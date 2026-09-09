/**
 * GamersNest — Booking inventory config + availability engine.
 *
 * This module is intentionally UI-agnostic. It owns:
 *   - the physical gaming inventory (capacity per experience)
 *   - the TypeScript domain types (Experience, Booking, Inventory, AvailabilityResult)
 *   - a reusable `checkAvailability` function based on standard interval-overlap logic
 *   - a temporary/mock list of existing bookings for local testing
 *
 * The source of `existingBookings` lives in the Supabase data layer
 * (`booking-data.ts`). The types, the inventory config and `checkAvailability`
 * stay pure and UI/data-source agnostic.
 */

/** The five bookable physical experiences. */
export type Experience =
  | "PS2"
  | "PS4"
  | "PS5"
  | "Steering simulator 1"
  | "VR GAMING";

/** Official physical console / equipment IDs */
export type ConsoleId =
  | "PS5 #1"
  | "PS5 #2"
  | "PS5 #3"
  | "PS4 #1"
  | "PS2 #1"
  | "Steering Simulator #1"
  | "VR Gaming #1";

export interface ConsoleConfig {
  id: ConsoleId;
  experience: Experience;
  label: string;
  capacity: number;
  supportsSharedSession: boolean;
}

/** Official GamersNest Consoles Setup */
export const CONSOLES: Record<ConsoleId, ConsoleConfig> = {
  "PS5 #1": { id: "PS5 #1", experience: "PS5", label: "PS5 #1", capacity: 4, supportsSharedSession: true },
  "PS5 #2": { id: "PS5 #2", experience: "PS5", label: "PS5 #2", capacity: 4, supportsSharedSession: true },
  "PS5 #3": { id: "PS5 #3", experience: "PS5", label: "PS5 #3", capacity: 4, supportsSharedSession: true },
  "PS4 #1": { id: "PS4 #1", experience: "PS4", label: "PS4 #1", capacity: 4, supportsSharedSession: true },
  "PS2 #1": { id: "PS2 #1", experience: "PS2", label: "PS2 #1", capacity: 2, supportsSharedSession: true },
  "Steering Simulator #1": { id: "Steering Simulator #1", experience: "Steering simulator 1", label: "Steering Simulator #1", capacity: 1, supportsSharedSession: false },
  "VR Gaming #1": { id: "VR Gaming #1", experience: "VR GAMING", label: "VR Gaming #1", capacity: 1, supportsSharedSession: false },
};

/** List of consoles per experience */
export function getConsolesForExperience(experience: Experience): ConsoleConfig[] {
  return Object.values(CONSOLES).filter((c) => {
    if (experience === "PS5") return c.experience === "PS5";
    if (experience === "PS4") return c.experience === "PS4";
    if (experience === "PS2") return c.experience === "PS2";
    if (experience.toLowerCase().includes("steering")) return c.experience === "Steering simulator 1";
    if (experience.toLowerCase().includes("vr")) return c.experience === "VR GAMING";
    return false;
  });
}

/**
 * Centralized inventory: physical capacity per experience / max capacity of single console.
 */
export interface InventoryItem {
  experience: Experience;
  label: string;
  capacity: number;
  consolesCount: number;
  maxPlayersPerConsole: number;
}

export type Inventory = Record<Experience, InventoryItem>;

export const INVENTORY: Inventory = {
  PS5: { experience: "PS5", label: "PS5", capacity: 4, consolesCount: 3, maxPlayersPerConsole: 4 },
  PS4: { experience: "PS4", label: "PS4", capacity: 4, consolesCount: 1, maxPlayersPerConsole: 4 },
  PS2: { experience: "PS2", label: "PS2", capacity: 2, consolesCount: 1, maxPlayersPerConsole: 2 },
  "Steering simulator 1": {
    experience: "Steering simulator 1",
    label: "Steering Simulator",
    capacity: 1,
    consolesCount: 1,
    maxPlayersPerConsole: 1,
  },
  "VR GAMING": {
    experience: "VR GAMING",
    label: "VR Gaming",
    capacity: 1,
    consolesCount: 1,
    maxPlayersPerConsole: 1,
  },
};

/**
 * Store opening hours. Bookings must fall fully within this window.
 * "HH:MM" 24-hour strings — 11:00 AM to 11:00 PM.
 */
export const STORE_HOURS = {
  open: "11:00",
  close: "23:00",
} as const;

/** Ordered list of experiences for rendering dropdowns consistently. */
export const EXPERIENCES: Experience[] = [
  "PS5",
  "PS4",
  "PS2",
  "Steering simulator 1",
  "VR GAMING",
];

/**
 * Calculate official GamersNest pricing:
 * - PS5: 1 player = ₹100/hr, >1 player = ₹90/player/hr
 * - PS4: 1 player = ₹100/hr, >1 player = ₹90/player/hr
 * - PS2: 1 player = ₹80/hr, >1 player = ₹70/player/hr
 * - Steering Simulator: ₹150/hr (1 player max)
 * - VR Gaming: ₹100 per 30 minutes (1 player max)
 */
export function calculateOfficialPrice(
  experience: Experience,
  players: number,
  startTime: string,
  endTime: string,
): number {
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (Number.isNaN(startMin) || Number.isNaN(endMin) || endMin <= startMin) {
    return 0;
  }

  const durationMin = endMin - startMin;
  const hours = durationMin / 60.0;

  if (experience === "VR GAMING") {
    // ₹100 per 30 minutes (₹200 / 1 hr)
    const units30min = Math.ceil(durationMin / 30.0);
    return units30min * 100;
  }

  if (experience === "Steering simulator 1") {
    // ₹150 per hour
    return Math.round(hours * 150);
  }

  if (experience === "PS2") {
    if (players <= 1) {
      return Math.round(hours * 80);
    }
    return Math.round(hours * 70 * players);
  }

  // PS5 & PS4
  if (players <= 1) {
    return Math.round(hours * 100);
  }
  return Math.round(hours * 90 * players);
}

/**
 * A booking consumes `players` physical units of `experience` for the
 * half-open time interval [startTime, endTime) on a given `date`.
 * Times are "HH:MM" 24-hour strings; date is "YYYY-MM-DD".
 */
export interface Booking {
  experience: Experience;
  consoleId?: ConsoleId;
  players: number;
  date: string;
  startTime: string;
  endTime: string;
  game?: string;
}

export interface AvailabilityResult {
  available: boolean;
  availableUnits: number;
  requestedUnits: number;
  capacity: number;
  consoleId?: ConsoleId;
  existingGame?: string;
  price?: number;
  message: string;
}

/** Capacity (max concurrent players/units) for a console or experience. */
export function getCapacity(experience: Experience): number {
  return INVENTORY[experience]?.capacity ?? 0;
}

/** Maximum selectable player count for an experience console. */
export function getMaxPlayers(experience: Experience): number {
  return getCapacity(experience);
}

/** Convert "HH:MM" to minutes since midnight; NaN if malformed. */
export function toMinutes(time: string): number {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return Number.NaN;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.NaN;
  return h * 60 + m;
}

/** Format a 24h "HH:MM" string as a 12-hour label, e.g. "15:30" -> "3:30 PM". */
export function formatTime12h(time: string): string {
  const total = toMinutes(time);
  if (Number.isNaN(total)) return time;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Selectable time slots within store hours, at a fixed interval.
 * Values are 24h "HH:MM"; labels are 12h.
 * For VR, 30-minute intervals are default. For hourly consoles, 60 or 30 mins are available.
 */
export function getTimeSlots(intervalMinutes = 30): { value: string; label: string }[] {
  const open = toMinutes(STORE_HOURS.open);
  const close = toMinutes(STORE_HOURS.close);
  const slots: { value: string; label: string }[] = [];
  for (let t = open; t <= close; t += intervalMinutes) {
    const value = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    slots.push({ value, label: formatTime12h(value) });
  }
  return slots;
}

/** True when a start/end pair forms a valid, non-empty forward interval. */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return start < end;
}

/** True when the whole [startTime, endTime] window falls within store hours. */
export function isWithinStoreHours(startTime: string, endTime: string): boolean {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const open = toMinutes(STORE_HOURS.open);
  const close = toMinutes(STORE_HOURS.close);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return start >= open && end <= close;
}

/** Standard half-open interval overlap. */
export function intervalsOverlap(
  existingStart: number,
  existingEnd: number,
  requestedStart: number,
  requestedEnd: number,
): boolean {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

export function checkAvailability(
  experience: Experience,
  players: number,
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[],
  consoleId?: ConsoleId,
  requestedGame?: string,
): AvailabilityResult {
  const targetConsoleId: ConsoleId = consoleId || getConsolesForExperience(experience)[0]?.id || "PS5 #1";
  const consoleConfig = CONSOLES[targetConsoleId];
  const capacity = consoleConfig?.capacity ?? getCapacity(experience);
  const requestedUnits = players;

  if (capacity <= 0) {
    return { available: false, availableUnits: 0, requestedUnits, capacity, message: "Please select a valid experience." };
  }

  if (!Number.isInteger(players) || players < 1) {
    return { available: false, availableUnits: capacity, requestedUnits, capacity, message: "Please select a valid number of players." };
  }

  if (players > capacity) {
    return { available: false, availableUnits: capacity, requestedUnits, capacity, message: `${targetConsoleId} supports up to ${capacity} player${capacity > 1 ? "s" : ""} at once.` };
  }

  if (!date) {
    return { available: false, availableUnits: capacity, requestedUnits, capacity, message: "Please choose a date." };
  }

  if (!isValidTimeRange(startTime, endTime)) {
    return { available: false, availableUnits: capacity, requestedUnits, capacity, message: "End time must be after start time." };
  }

  if (!isWithinStoreHours(startTime, endTime)) {
    return { available: false, availableUnits: capacity, requestedUnits, capacity, message: "Bookings are only available between 11:00 AM and 11:00 PM." };
  }

  const requestedStart = toMinutes(startTime);
  const requestedEnd = toMinutes(endTime);

  const overlappingBookings = existingBookings.filter((b) => {
    const isSameConsole = b.consoleId ? b.consoleId === targetConsoleId : b.experience === experience;
    return isSameConsole && b.date === date && intervalsOverlap(toMinutes(b.startTime), toMinutes(b.endTime), requestedStart, requestedEnd);
  });

  const usedUnits = overlappingBookings.reduce((total, b) => total + b.players, 0);
  const existingGame = overlappingBookings.find((b) => Boolean(b.game))?.game;

  // Game locking rule
  if (existingGame && requestedGame && requestedGame.trim() !== "") {
    if (existingGame.trim().toLowerCase() !== requestedGame.trim().toLowerCase()) {
      return {
        available: false,
        availableUnits: Math.max(0, capacity - usedUnits),
        requestedUnits,
        capacity,
        consoleId: targetConsoleId,
        existingGame,
        message: `This console already has an active session playing ${existingGame}. You can only join the existing ${existingGame} session.`,
      };
    }
  }

  const availableUnits = Math.max(0, capacity - usedUnits);
  const available = requestedUnits <= availableUnits;
  const price = calculateOfficialPrice(experience, players, startTime, endTime);

  let message: string;
  if (available) {
    if (existingGame) {
      message = `Joined existing ${existingGame} session on ${targetConsoleId} (${usedUnits}/${capacity} seats taken).`;
    } else {
      message = `${availableUnits} of ${capacity} seats available on ${targetConsoleId}.`;
    }
  } else if (availableUnits === 0) {
    message = `${targetConsoleId} is fully booked for this time slot.`;
  } else {
    message = `Only ${availableUnits} of ${capacity} seats available on ${targetConsoleId} (you requested ${requestedUnits}).`;
  }

  return { available, availableUnits, requestedUnits, capacity, consoleId: targetConsoleId, existingGame, price, message };
}

export { PLAYABLE_GAMES, PLAYABLE_GAME_TITLES } from "./games-data";

