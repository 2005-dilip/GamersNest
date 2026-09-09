-- ==============================================================================
-- GamersNest Official Gaming Setup, Game-Locking & Shared-Session Migration
--
-- Official Physical Consoles & Capacity:
--   PS5 #1, PS5 #2, PS5 #3 (4 seats each -> 12 total seats)
--   PS4 #1 (4 seats)
--   PS2 #1 (2 seats)
--   Steering Simulator #1 (1 seat, ₹150/hr)
--   VR Gaming #1 (1 seat, ₹100/30min)
-- ==============================================================================

-- 1. Ensure console_id and price columns exist on public.bookings
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS console_id TEXT;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Backfill legacy rows with default console IDs where console_id is null
UPDATE public.bookings
SET console_id = CASE
    WHEN experience::text = 'PS5' THEN 'PS5 #1'
    WHEN experience::text = 'PS4' THEN 'PS4 #1'
    WHEN experience::text = 'PS2' THEN 'PS2 #1'
    WHEN experience::text IN ('Steering simulator 1', 'Steering Simulator #1') THEN 'Steering Simulator #1'
    WHEN experience::text IN ('VR GAMING', 'VR Gaming #1') THEN 'VR Gaming #1'
    ELSE 'PS5 #1'
END
WHERE console_id IS NULL;


-- -----------------------------------------------------------------------------
-- Helper Function: Get console physical capacity
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_console_capacity(p_console_id text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN p_console_id IN ('PS5 #1', 'PS5 #2', 'PS5 #3') THEN 4
        WHEN p_console_id = 'PS4 #1' THEN 4
        WHEN p_console_id = 'PS2 #1' THEN 2
        WHEN p_console_id IN ('Steering Simulator #1', 'Steering simulator 1') THEN 1
        WHEN p_console_id IN ('VR Gaming #1', 'VR GAMING') THEN 1
        ELSE 4
    END;
$$;


-- -----------------------------------------------------------------------------
-- Helper Function: Calculate official price for a booking session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_official_price(
    p_experience text,
    p_players integer,
    p_start_time time,
    p_end_time time
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_duration_minutes numeric;
    v_hours numeric;
    v_30min_units numeric;
    v_clean_exp text;
BEGIN
    v_duration_minutes := (EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60.0);
    IF v_duration_minutes <= 0 THEN
        RETURN 0;
    END IF;

    v_hours := v_duration_minutes / 60.0;
    v_30min_units := CEIL(v_duration_minutes / 30.0);

    v_clean_exp := UPPER(TRIM(p_experience));

    -- VR Gaming: ₹100 per 30 minutes
    IF v_clean_exp LIKE '%VR%' THEN
        RETURN v_30min_units * 100;
    -- Steering Simulator: ₹150 per player per hour
    ELSIF v_clean_exp LIKE '%STEERING%' OR v_clean_exp LIKE '%SIMULATOR%' THEN
        RETURN ROUND(v_hours * 150, 2);
    -- PS2: Single ₹80/hr, Multiplayer ₹70/player/hr
    ELSIF v_clean_exp LIKE '%PS2%' THEN
        IF p_players <= 1 THEN
            RETURN ROUND(v_hours * 80, 2);
        ELSE
            RETURN ROUND(v_hours * 70 * p_players, 2);
        END IF;
    -- PS5 / PS4: Single ₹100/hr, Multiplayer ₹90/player/hr
    ELSE
        IF p_players <= 1 THEN
            RETURN ROUND(v_hours * 100, 2);
        ELSE
            RETURN ROUND(v_hours * 90 * p_players, 2);
        END IF;
    END IF;
END;
$$;


-- -----------------------------------------------------------------------------
-- 1. Secure Per-Console Slot Availability RPC (Zero Customer PII)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_console_slot_availability(
    p_date date,
    p_experience text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_bookings jsonb;
BEGIN
    -- Query active bookings for the specified date without returning any PII (no name, phone, etc.)
    SELECT jsonb_agg(
        jsonb_build_object(
            'console_id', COALESCE(console_id, CASE
                WHEN experience::text = 'PS5' THEN 'PS5 #1'
                WHEN experience::text = 'PS4' THEN 'PS4 #1'
                WHEN experience::text = 'PS2' THEN 'PS2 #1'
                WHEN experience::text = 'Steering simulator 1' THEN 'Steering Simulator #1'
                WHEN experience::text = 'VR GAMING' THEN 'VR Gaming #1'
                ELSE 'PS5 #1'
            END),
            'experience', experience::text,
            'start_time', to_char(start_time, 'HH24:MI'),
            'end_time', to_char(end_time, 'HH24:MI'),
            'players', players,
            'game', game
        )
    )
    INTO v_bookings
    FROM public.bookings
    WHERE date = p_date
    AND status::text != 'cancelled';

    RETURN jsonb_build_object(
        'date', p_date,
        'bookings', COALESCE(v_bookings, '[]'::jsonb)
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 2. Enhanced Secure Availability Check RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_booking_availability(
    p_experience text,
    p_date date,
    p_start_time time,
    p_end_time time,
    p_players integer,
    p_console_id text DEFAULT NULL,
    p_game text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_console_id text;
    v_capacity integer;
    v_overlapping_usage integer := 0;
    v_remaining_capacity integer;
    v_existing_game text := NULL;
    v_available boolean;
    v_message text;
    v_store_open time := time '11:00:00';
    v_store_close time := time '23:00:00';
BEGIN
    -- Determine console_id if not explicitly provided
    IF p_console_id IS NOT NULL AND trim(p_console_id) != '' THEN
        v_console_id := trim(p_console_id);
    ELSE
        IF p_experience = 'PS5' THEN v_console_id := 'PS5 #1';
        ELSIF p_experience = 'PS4' THEN v_console_id := 'PS4 #1';
        ELSIF p_experience = 'PS2' THEN v_console_id := 'PS2 #1';
        ELSIF p_experience LIKE '%Steering%' THEN v_console_id := 'Steering Simulator #1';
        ELSIF p_experience LIKE '%VR%' THEN v_console_id := 'VR Gaming #1';
        ELSE v_console_id := 'PS5 #1';
        END IF;
    END IF;

    v_capacity := public.get_console_capacity(v_console_id);

    -- Player count validation
    IF p_players IS NULL OR p_players < 1 THEN
        RETURN jsonb_build_object('available', false, 'remainingCapacity', v_capacity, 'capacity', v_capacity, 'message', 'Please select a valid number of players.');
    END IF;

    IF p_players > v_capacity THEN
        RETURN jsonb_build_object('available', false, 'remainingCapacity', v_capacity, 'capacity', v_capacity, 'message', format('%s supports up to %s player%s at once.', v_console_id, v_capacity, CASE WHEN v_capacity > 1 THEN 's' ELSE '' END));
    END IF;

    -- Date & time validation
    IF p_date IS NULL THEN
        RETURN jsonb_build_object('available', false, 'remainingCapacity', v_capacity, 'capacity', v_capacity, 'message', 'Please choose a date.');
    END IF;

    IF p_start_time IS NULL OR p_end_time IS NULL OR p_start_time >= p_end_time THEN
        RETURN jsonb_build_object('available', false, 'remainingCapacity', v_capacity, 'capacity', v_capacity, 'message', 'End time must be after start time.');
    END IF;

    IF p_start_time < v_store_open OR p_end_time > v_store_close THEN
        RETURN jsonb_build_object('available', false, 'remainingCapacity', v_capacity, 'capacity', v_capacity, 'message', 'Bookings are only available between 11:00 AM and 11:00 PM.');
    END IF;

    -- Calculate usage on this specific console for the time interval
    SELECT COALESCE(SUM(players), 0)
    INTO v_overlapping_usage
    FROM public.bookings
    WHERE (console_id = v_console_id OR (console_id IS NULL AND experience::text = p_experience))
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time;

    -- Find existing active game on this console
    SELECT game INTO v_existing_game
    FROM public.bookings
    WHERE (console_id = v_console_id OR (console_id IS NULL AND experience::text = p_experience))
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time
    AND game IS NOT NULL AND trim(game) != ''
    LIMIT 1;

    v_remaining_capacity := GREATEST(0, v_capacity - v_overlapping_usage);
    v_available := (p_players <= v_remaining_capacity);

    -- Validate game conflict if existing game exists
    IF v_existing_game IS NOT NULL AND p_game IS NOT NULL AND trim(p_game) != '' THEN
        IF LOWER(TRIM(p_game)) != LOWER(TRIM(v_existing_game)) THEN
            RETURN jsonb_build_object(
                'available', false,
                'remainingCapacity', v_remaining_capacity,
                'capacity', v_capacity,
                'existingGame', v_existing_game,
                'message', format('This console already has an active session playing %s. You can only join the existing %s session.', v_existing_game, v_existing_game)
            );
        END IF;
    END IF;

    IF v_available THEN
        IF v_existing_game IS NOT NULL THEN
            v_message := format('Joined existing %s session on %s (%s/%s seats taken).', v_existing_game, v_console_id, v_overlapping_usage, v_capacity);
        ELSE
            v_message := format('%s of %s seats available on %s.', v_remaining_capacity, v_capacity, v_console_id);
        END IF;
    ELSE
        IF v_remaining_capacity = 0 THEN
            v_message := format('%s is fully booked for this time slot.', v_console_id);
        ELSE
            v_message := format('Only %s of %s seats available on %s (you requested %s).', v_remaining_capacity, v_capacity, v_console_id, p_players);
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'available', v_available,
        'remainingCapacity', v_remaining_capacity,
        'capacity', v_capacity,
        'consoleId', v_console_id,
        'existingGame', v_existing_game,
        'message', v_message
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 3. Atomic Booking Creation RPC with Game Locking & Advisory Locks
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_name text,
    p_phone text,
    p_experience text,
    p_players integer,
    p_date date,
    p_start_time time,
    p_end_time time,
    p_game text DEFAULT NULL,
    p_message text DEFAULT NULL,
    p_console_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_console_id text;
    v_capacity integer;
    v_overlapping_usage integer := 0;
    v_remaining_capacity integer;
    v_existing_game text := NULL;
    v_calculated_price numeric;
    v_store_open time := time '11:00:00';
    v_store_close time := time '23:00:00';
    v_lock_key bigint;
    v_exp_enum public.experience_type;
BEGIN
    -- Determine target console_id
    IF p_console_id IS NOT NULL AND trim(p_console_id) != '' THEN
        v_console_id := trim(p_console_id);
    ELSE
        IF p_experience = 'PS5' THEN v_console_id := 'PS5 #1';
        ELSIF p_experience = 'PS4' THEN v_console_id := 'PS4 #1';
        ELSIF p_experience = 'PS2' THEN v_console_id := 'PS2 #1';
        ELSIF p_experience LIKE '%Steering%' THEN v_console_id := 'Steering Simulator #1';
        ELSIF p_experience LIKE '%VR%' THEN v_console_id := 'VR Gaming #1';
        ELSE v_console_id := 'PS5 #1';
        END IF;
    END IF;

    -- 1. Acquire transaction-level advisory lock scoped to (console_id, date)
    v_lock_key := ('x' || substr(md5(v_console_id || ':' || p_date::text), 1, 15))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    v_capacity := public.get_console_capacity(v_console_id);

    -- 2. Validate input parameters
    IF p_players IS NULL OR p_players < 1 OR p_players > v_capacity THEN
        RETURN jsonb_build_object('ok', false, 'message', format('Invalid player count for %s (maximum %s).', v_console_id, v_capacity));
    END IF;

    IF trim(COALESCE(p_name, '')) = '' THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Full name is required.');
    END IF;
    IF trim(COALESCE(p_phone, '')) = '' THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Phone / WhatsApp number is required.');
    END IF;

    IF p_date IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Booking date is required.');
    END IF;
    IF p_start_time IS NULL OR p_end_time IS NULL OR p_start_time >= p_end_time THEN
        RETURN jsonb_build_object('ok', false, 'message', 'End time must be after start time.');
    END IF;
    IF p_start_time < v_store_open OR p_end_time > v_store_close THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Bookings are only available between 11:00 AM and 11:00 PM.');
    END IF;

    -- 3. Check existing usage and active game on this console
    SELECT COALESCE(SUM(players), 0)
    INTO v_overlapping_usage
    FROM public.bookings
    WHERE (console_id = v_console_id OR (console_id IS NULL AND experience::text = p_experience))
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time;

    SELECT game INTO v_existing_game
    FROM public.bookings
    WHERE (console_id = v_console_id OR (console_id IS NULL AND experience::text = p_experience))
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time
    AND game IS NOT NULL AND trim(game) != ''
    LIMIT 1;

    v_remaining_capacity := GREATEST(0, v_capacity - v_overlapping_usage);

    -- 4. Shared Session Game Locking Validation
    IF v_existing_game IS NOT NULL AND p_game IS NOT NULL AND trim(p_game) != '' THEN
        IF LOWER(TRIM(p_game)) != LOWER(TRIM(v_existing_game)) THEN
            RETURN jsonb_build_object(
                'ok', false,
                'remainingCapacity', v_remaining_capacity,
                'existingGame', v_existing_game,
                'message', format('This console already has an active session playing %s. You can only join the existing %s session.', v_existing_game, v_existing_game)
            );
        END IF;
    END IF;

    -- 5. Capacity Check
    IF p_players > v_remaining_capacity THEN
        RETURN jsonb_build_object(
            'ok', false,
            'remainingCapacity', v_remaining_capacity,
            'message', 'Sorry, this time slot is no longer available for the requested players. Please choose another time or console.'
        );
    END IF;

    -- 6. Calculate official booking price
    v_calculated_price := public.calculate_official_price(p_experience, p_players, p_start_time, p_end_time);

    -- Map experience string safely to experience_type enum
    BEGIN
        v_exp_enum := p_experience::public.experience_type;
    EXCEPTION WHEN OTHERS THEN
        IF p_experience LIKE '%Steering%' THEN v_exp_enum := 'Steering simulator 1'::public.experience_type;
        ELSIF p_experience LIKE '%VR%' THEN v_exp_enum := 'VR GAMING'::public.experience_type;
        ELSE v_exp_enum := 'PS5'::public.experience_type;
        END IF;
    END;

    -- 7. Insert booking atomically
    INSERT INTO public.bookings (
        name,
        phone,
        experience,
        console_id,
        players,
        date,
        start_time,
        end_time,
        game,
        price,
        message,
        status
    )
    VALUES (
        trim(p_name),
        trim(p_phone),
        v_exp_enum,
        v_console_id,
        p_players,
        p_date,
        p_start_time,
        p_end_time,
        COALESCE(NULLIF(trim(p_game), ''), v_existing_game),
        v_calculated_price,
        NULLIF(trim(COALESCE(p_message, '')), ''),
        'pending'
    );

    RETURN jsonb_build_object(
        'ok', true,
        'consoleId', v_console_id,
        'price', v_calculated_price,
        'remainingCapacity', v_remaining_capacity - p_players,
        'message', 'Your booking request has been received.'
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- Grants & Execution Permissions
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_console_capacity(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_official_price(text, integer, time, time) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_console_slot_availability(date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_booking_availability(text, date, time, time, integer, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(text, text, text, integer, date, time, time, text, text, text) TO anon, authenticated;
