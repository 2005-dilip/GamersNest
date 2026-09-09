-- ==============================================================================
-- GamersNest Secure Booking Architecture Migration (v2 with explicit enum cast)
--
-- Fixes: Casts experience::text and status::text to match PostgreSQL custom enum types
-- ==============================================================================

ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

-- Revoke direct SELECT from anon and public to protect customer data
REVOKE SELECT ON public.bookings FROM anon;
REVOKE SELECT ON public.bookings FROM public;

-- Drop insecure public SELECT policies if any were previously attempted
DROP POLICY IF EXISTS "Allow public read for slot availability" ON public.bookings;
DROP POLICY IF EXISTS "Allow anon read for slot availability" ON public.bookings;

-- -----------------------------------------------------------------------------
-- 1. Secure Availability Check RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_booking_availability(
    p_experience text,
    p_date date,
    p_start_time time,
    p_end_time time,
    p_players integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_capacity integer;
    v_overlapping_usage integer := 0;
    v_remaining_capacity integer;
    v_available boolean;
    v_message text;
    v_store_open time := time '11:00:00';
    v_store_close time := time '23:00:00';
BEGIN
    -- 1. Validate experience & determine physical capacity
    -- Physical Inventory: PS4=1, PS5=3, PS2=1, Steering Simulator=1, VR=1
    IF p_experience = 'PS5' THEN
        v_capacity := 3;
    ELSIF p_experience IN ('PS4', 'PS2', 'Steering simulator 1', 'VR GAMING') THEN
        v_capacity := 1;
    ELSE
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', 0,
            'capacity', 0,
            'message', 'Invalid experience selected.'
        );
    END IF;

    -- 2. Validate player count
    IF p_players IS NULL OR p_players < 1 THEN
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', v_capacity,
            'capacity', v_capacity,
            'message', 'Please select a valid number of players.'
        );
    END IF;

    IF p_players > v_capacity THEN
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', v_capacity,
            'capacity', v_capacity,
            'message', format('%s supports up to %s player%s at once.', p_experience, v_capacity, CASE WHEN v_capacity > 1 THEN 's' ELSE '' END)
        );
    END IF;

    -- 3. Validate date
    IF p_date IS NULL THEN
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', v_capacity,
            'capacity', v_capacity,
            'message', 'Please choose a date.'
        );
    END IF;

    -- 4. Validate time range order (start < end)
    IF p_start_time IS NULL OR p_end_time IS NULL OR p_start_time >= p_end_time THEN
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', v_capacity,
            'capacity', v_capacity,
            'message', 'End time must be after start time.'
        );
    END IF;

    -- 5. Validate store operating hours (11:00 AM – 11:00 PM)
    IF p_start_time < v_store_open OR p_end_time > v_store_close THEN
        RETURN jsonb_build_object(
            'available', false,
            'remainingCapacity', v_capacity,
            'capacity', v_capacity,
            'message', 'Bookings are only available between 11:00 AM and 11:00 PM.'
        );
    END IF;

    -- 6. Calculate overlapping capacity usage
    -- Overlap condition: existingStart < requestedEnd AND existingEnd > requestedStart
    -- Cancelled bookings do NOT consume capacity. (pending and confirmed DO consume capacity)
    -- Note: explicit ::text cast handles custom enum columns cleanly
    SELECT COALESCE(SUM(players), 0)
    INTO v_overlapping_usage
    FROM public.bookings
    WHERE experience::text = p_experience
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time;

    v_remaining_capacity := GREATEST(0, v_capacity - v_overlapping_usage);
    v_available := (p_players <= v_remaining_capacity);

    IF v_available THEN
        v_message := format('%s of %s %s units available for this time.', v_remaining_capacity, v_capacity, p_experience);
    ELSE
        IF v_remaining_capacity = 0 THEN
            v_message := format('Fully booked for this time. All %s %s units are in use.', v_capacity, p_experience);
        ELSE
            v_message := format('Only %s of %s %s units available for this time (you requested %s).', v_remaining_capacity, v_capacity, p_experience, p_players);
        END IF;
    END IF;

    -- Return ONLY availability metadata. Absolutely zero customer PII.
    RETURN jsonb_build_object(
        'available', v_available,
        'remainingCapacity', v_remaining_capacity,
        'capacity', v_capacity,
        'message', v_message
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Concurrency-Safe Atomic Booking Creation RPC
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
    p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_capacity integer;
    v_overlapping_usage integer := 0;
    v_remaining_capacity integer;
    v_store_open time := time '11:00:00';
    v_store_close time := time '23:00:00';
    v_lock_key bigint;
BEGIN
    -- 1. Acquire transaction-level advisory lock scoped to (experience, date).
    -- Serializes concurrent booking attempts for the same experience and date,
    -- preventing any double-booking or capacity overflow race conditions!
    v_lock_key := ('x' || substr(md5(p_experience || ':' || p_date::text), 1, 15))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 2. Validate experience & determine physical capacity
    IF p_experience = 'PS5' THEN
        v_capacity := 3;
    ELSIF p_experience IN ('PS4', 'PS2', 'Steering simulator 1', 'VR GAMING') THEN
        v_capacity := 1;
    ELSE
        RETURN jsonb_build_object(
            'ok', false,
            'message', 'Invalid experience selected.'
        );
    END IF;

    -- 3. Validate player count against physical capacity
    IF p_players IS NULL OR p_players < 1 OR p_players > v_capacity THEN
        RETURN jsonb_build_object(
            'ok', false,
            'message', format('Invalid player count for %s (maximum %s).', p_experience, v_capacity)
        );
    END IF;

    -- 4. Validate customer fields
    IF trim(COALESCE(p_name, '')) = '' THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Full name is required.');
    END IF;
    IF trim(COALESCE(p_phone, '')) = '' THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Phone / WhatsApp number is required.');
    END IF;

    -- 5. Validate date and operating hours (11:00 AM – 11:00 PM)
    IF p_date IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Booking date is required.');
    END IF;
    IF p_start_time IS NULL OR p_end_time IS NULL OR p_start_time >= p_end_time THEN
        RETURN jsonb_build_object('ok', false, 'message', 'End time must be after start time.');
    END IF;
    IF p_start_time < v_store_open OR p_end_time > v_store_close THEN
        RETURN jsonb_build_object('ok', false, 'message', 'Bookings are only available between 11:00 AM and 11:00 PM.');
    END IF;

    -- 6. Re-check overlapping usage inside the locked transaction
    SELECT COALESCE(SUM(players), 0)
    INTO v_overlapping_usage
    FROM public.bookings
    WHERE experience::text = p_experience
    AND date = p_date
    AND status::text != 'cancelled'
    AND start_time < p_end_time
    AND end_time > p_start_time;

    v_remaining_capacity := GREATEST(0, v_capacity - v_overlapping_usage);

    -- 7. Reject if requested players exceeds remaining capacity
    IF p_players > v_remaining_capacity THEN
        RETURN jsonb_build_object(
            'ok', false,
            'remainingCapacity', v_remaining_capacity,
            'message', 'Sorry, this time slot is no longer available. Please choose another time.'
        );
    END IF;

    -- 8. Insert booking safely inside transaction
    INSERT INTO public.bookings (
        name,
        phone,
        experience,
        players,
        date,
        start_time,
        end_time,
        game,
        message,
        status
    )
    VALUES (
        trim(p_name),
        trim(p_phone),
        p_experience::experience_type,
        p_players,
        p_date,
        p_start_time,
        p_end_time,
        NULLIF(trim(COALESCE(p_game, '')), ''),
        NULLIF(trim(COALESCE(p_message, '')), ''),
        'pending'
    );

    RETURN jsonb_build_object(
        'ok', true,
        'remainingCapacity', v_remaining_capacity - p_players,
        'message', 'Your booking request has been received.'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Permissions & Grants
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.check_booking_availability(text, date, time, time, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(text, text, text, integer, date, time, time, text, text) TO anon, authenticated;
