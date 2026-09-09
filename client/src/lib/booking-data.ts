import { supabase } from "./supabase";
import { AvailabilityResult, ConsoleId, Experience, calculateOfficialPrice } from "./booking";

export interface NewBookingInput {
  name: string;
  phone: string;
  experience: Experience;
  consoleId?: ConsoleId;
  players: number;
  date: string;
  startTime: string;
  endTime: string;
  game?: string;
  message?: string;
}

export interface ConsoleSlotBooking {
  console_id: ConsoleId;
  experience: Experience;
  start_time: string;
  end_time: string;
  players: number;
  game?: string | null;
}

/**
 * Fetch anonymized slot booking data for a date.
 * Returns active sessions per console with zero customer PII.
 */
export async function fetchConsoleSlotAvailability(date: string): Promise<ConsoleSlotBooking[]> {
  if (!date) return [];
  const { data, error } = await supabase.rpc("get_console_slot_availability", {
    p_date: date,
  });

  if (error) {
    console.warn("get_console_slot_availability RPC warning:", error.message);
    return [];
  }

  return (data?.bookings as ConsoleSlotBooking[]) || [];
}

/**
 * Check slot availability securely via database RPC.
 * Returns only availability and remaining capacity. Zero customer records are exposed.
 */
export async function checkAvailabilityRemote(
  experience: Experience,
  players: number,
  date: string,
  startTime: string,
  endTime: string,
  consoleId?: ConsoleId,
  game?: string,
): Promise<AvailabilityResult> {
  // First attempt: call with consoleId and game
  let res = await supabase.rpc("check_booking_availability", {
    p_experience: experience,
    p_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
    p_players: players,
    p_console_id: consoleId ?? null,
    p_game: game ?? null,
  });

  // Fallback to 5-parameter signature if PGRST202 (parameter mismatch / schema cache)
  if (res.error && res.error.code === "PGRST202") {
    res = await supabase.rpc("check_booking_availability", {
      p_experience: experience,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_players: players,
    });
  }

  if (res.error) {
    console.warn("check_booking_availability RPC error:", res.error.message);
    const price = calculateOfficialPrice(experience, players, startTime, endTime);
    return {
      available: true,
      availableUnits: 1,
      requestedUnits: players,
      capacity: 1,
      consoleId,
      price,
      message: "Slot selected. (Please execute the migration script in Supabase SQL Editor for full RPC sync)",
    };
  }

  const data = res.data;
  const price = calculateOfficialPrice(experience, players, startTime, endTime);

  return {
    available: Boolean(data?.available),
    availableUnits: Number(data?.remainingCapacity ?? 0),
    requestedUnits: players,
    capacity: Number(data?.capacity ?? 0),
    consoleId: (data?.consoleId as ConsoleId) || consoleId,
    existingGame: data?.existingGame || undefined,
    price,
    message: String(data?.message || (data?.available ? "Slot available" : "Slot unavailable")),
  };
}

/**
 * Create a new booking request atomically via database RPC.
 * Serialized in PostgreSQL via transaction advisory lock to prevent race conditions.
 */
export async function createBooking(
  input: NewBookingInput,
): Promise<{ ok: boolean; availability: AvailabilityResult; price?: number }> {
  let res = await supabase.rpc("create_booking_atomic", {
    p_name: input.name,
    p_phone: input.phone,
    p_experience: input.experience,
    p_players: input.players,
    p_date: input.date,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
    p_game: input.game ?? null,
    p_message: input.message ?? null,
    p_console_id: input.consoleId ?? null,
  });

  if (res.error && res.error.code === "PGRST202") {
    res = await supabase.rpc("create_booking_atomic", {
      p_name: input.name,
      p_phone: input.phone,
      p_experience: input.experience,
      p_players: input.players,
      p_date: input.date,
      p_start_time: input.startTime,
      p_end_time: input.endTime,
      p_game: input.game ?? null,
      p_message: input.message ?? null,
    });
  }

  if (res.error) {
    console.warn("create_booking_atomic RPC error:", res.error.message);
    throw new Error(res.error.message || "Failed to save booking. Please try again.");
  }

  const ok = Boolean(res.data?.ok);
  const remaining = Number(res.data?.remainingCapacity ?? 0);
  const price = Number(res.data?.price ?? calculateOfficialPrice(input.experience, input.players, input.startTime, input.endTime));

  const availability: AvailabilityResult = {
    available: ok,
    availableUnits: remaining,
    requestedUnits: input.players,
    capacity: 0,
    consoleId: input.consoleId,
    existingGame: res.data?.existingGame || undefined,
    price,
    message: String(
      res.data?.message ||
        (ok
          ? "Your booking request has been received."
          : "Sorry, this time slot is no longer available. Please choose another time."),
    ),
  };

  return { ok, availability, price };
}


