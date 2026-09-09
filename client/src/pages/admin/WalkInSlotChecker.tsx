/**
 * WalkInSlotChecker — "See for Slot" tool for the admin counter.
 *
 * Updated with official shared console gaming logic, per-console availability grid,
 * game locking for active shared sessions, console selection, and live official price calculation.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Search as SearchIcon,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  RefreshCw,
  ArrowRight,
  Gamepad2,
  Users,
  Lock,
  Tag,
  Coins,
  Sparkles,
} from "lucide-react";
import {
  EXPERIENCES,
  INVENTORY,
  ConsoleId,
  getMaxPlayers,
  getTimeSlots,
  formatTime12h,
  isValidTimeRange,
  isWithinStoreHours,
  getConsolesForExperience,
  calculateOfficialPrice,
  type Experience,
} from "@/lib/booking";
import { PLAYABLE_GAMES, type Game } from "@/lib/games-data";
import { createBooking, checkAvailabilityRemote } from "@/lib/booking-data";
import { fetchDayBookingsForExperience, type AdminBooking } from "@/lib/admin-data";
import { ConsoleSlotGrid } from "@/components/ConsoleSlotGrid";

interface WalkInSlotCheckerProps {
  onClose: () => void;
  onBooked: () => void | Promise<void>;
}

const toMin = (t: string): number => {
  if (!t) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && aEnd > bStart;

const usageInWindow = (bookings: AdminBooking[], startMin: number, endMin: number): number =>
  bookings
    .filter((b) => overlaps(toMin(b.start_time), toMin(b.end_time), startMin, endMin))
    .reduce((sum, b) => sum + (b.players || 1), 0);

export const WalkInSlotChecker: React.FC<WalkInSlotCheckerProps> = ({ onClose, onBooked }) => {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [experience, setExperience] = useState<Experience>("PS5");
  const [date, setDate] = useState<string>(today);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [players, setPlayers] = useState<number>(1);
  const [selectedConsoleId, setSelectedConsoleId] = useState<ConsoleId | "">("");

  const [dayBookings, setDayBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(false);

  // Shared session & game locking state
  const [isSharedSession, setIsSharedSession] = useState<boolean>(false);
  const [activeSessionGame, setActiveSessionGame] = useState<string | undefined>(undefined);

  // Booking form state
  const [showForm, setShowForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [game, setGame] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const capacity = INVENTORY[experience]?.capacity ?? 1;
  const maxPlayers = getMaxPlayers(experience);
  const availableConsoles = getConsolesForExperience(experience);

  const timeSlots = useMemo(() => getTimeSlots(experience === "VR GAMING" ? 30 : 60), [experience]);
  const startSlots = useMemo(() => timeSlots.slice(0, -1), [timeSlots]);
  const endSlots = useMemo(
    () => (startTime ? timeSlots.filter((s) => s.value > startTime) : timeSlots.slice(1)),
    [timeSlots, startTime],
  );

  // Calculate official total price
  const calculatedPrice = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return calculateOfficialPrice(experience, players, startTime, endTime);
  }, [experience, players, startTime, endTime]);

  // Keep players within capacity when experience changes
  useEffect(() => {
    setPlayers((p) => Math.min(Math.max(1, p), Math.max(1, maxPlayers)));
    setSelectedConsoleId("");
    setIsSharedSession(false);
    setActiveSessionGame(undefined);
  }, [experience, maxPlayers]);

  // Clear end time if start changes to after end
  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) setEndTime("");
  }, [startTime, endTime]);

  const loadDay = async (exp: Experience, d: string) => {
    if (!d) return;
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchDayBookingsForExperience(exp, d);
      setDayBookings(list);
    } catch (err: any) {
      setLoadError(err.message || "Could not load bookings for that day.");
      setDayBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setChecked(false);
    setShowForm(false);
    setSuccessMsg(null);
    if (!date) {
      setDayBookings([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    fetchDayBookingsForExperience(experience, date)
      .then((list) => {
        if (active) setDayBookings(list);
      })
      .catch((err: any) => {
        if (active) {
          setLoadError(err.message || "Could not load bookings for that day.");
          setDayBookings([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [experience, date]);

  // Handle slot selection directly from the visual ConsoleSlotGrid
  const handleSelectSlotFromGrid = (
    cId: ConsoleId,
    start: string,
    end: string,
    existingGame?: string,
    isShared?: boolean
  ) => {
    setSelectedConsoleId(cId);
    setStartTime(start);
    setEndTime(end);
    setChecked(true);
    setShowForm(true);
    setFormError(null);

    if (existingGame) {
      setGame(existingGame);
      setActiveSessionGame(existingGame);
      setIsSharedSession(true);
    } else {
      setIsSharedSession(false);
      setActiveSessionGame(undefined);
    }
  };

  // Evaluate exact requested window
  const requested = useMemo(() => {
    if (!startTime || !endTime) return null;
    if (!isValidTimeRange(startTime, endTime)) {
      return { ok: false, reason: "End time must be after start time.", conflicts: [] as AdminBooking[] };
    }
    if (!isWithinStoreHours(startTime, endTime)) {
      return { ok: false, reason: "Outside store hours (11:00 AM – 11:00 PM).", conflicts: [] as AdminBooking[] };
    }
    const s = toMin(startTime);
    const e = toMin(endTime);
    const conflicts = dayBookings.filter((b) => overlaps(toMin(b.start_time), toMin(b.end_time), s, e));
    const used = usageInWindow(dayBookings, s, e);
    const remaining = Math.max(0, capacity - used);
    const ok = players <= remaining;
    let reason = "";
    if (!ok) {
      if (remaining === 0) {
        const first = conflicts[0];
        const fmt = (t: string) => formatTime12h(t.slice(0, 5));
        reason = first
          ? `Booking exists from ${fmt(first.start_time)} – ${fmt(first.end_time)}.`
          : "Fully booked for this window.";
      } else {
        reason = `Only ${remaining} of ${capacity} unit(s) free for this window (you need ${players}).`;
      }
    }
    return { ok, reason, remaining, conflicts };
  }, [startTime, endTime, dayBookings, capacity, players]);

  // Suggestions for nearby free windows
  const suggestions = useMemo(() => {
    if (!startTime || !endTime || !isValidTimeRange(startTime, endTime)) return [];
    const durationHrs = Math.max(1, Math.round((toMin(endTime) - toMin(startTime)) / 60));
    const out: { start: string; end: string }[] = [];
    for (const slot of startSlots) {
      const s = toMin(slot.value);
      const e = s + durationHrs * 60;
      const endStr = `${String(Math.floor(e / 60)).padStart(2, "0")}:00`;
      if (!isWithinStoreHours(slot.value, endStr)) continue;
      const used = usageInWindow(dayBookings, s, e);
      if (capacity - used >= players) {
        if (!(slot.value === startTime && endStr === endTime)) {
          out.push({ start: slot.value, end: endStr });
        }
      }
    }
    return out.slice(0, 6);
  }, [startTime, endTime, startSlots, dayBookings, capacity, players]);

  const handleCheck = async () => {
    setChecked(true);
    setShowForm(false);
    setSuccessMsg(null);

    // Query remote RPC for shared session check
    if (startTime && endTime) {
      try {
        const res = await checkAvailabilityRemote(
          experience,
          players,
          date,
          startTime,
          endTime,
          selectedConsoleId || undefined,
          game || undefined
        );
        if (res.existingGame) {
          setActiveSessionGame(res.existingGame);
          setGame(res.existingGame);
          setIsSharedSession(true);
        } else {
          setIsSharedSession(false);
          setActiveSessionGame(undefined);
        }
      } catch (e) {
        // Fall back to client calculation
      }
    }
  };

  const openFormFor = (s: string, e: string) => {
    setStartTime(s);
    setEndTime(e);
    setChecked(true);
    setShowForm(true);
    setFormError(null);
  };

  const handleCreate = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setFormError(null);
    if (!name.trim() || !phone.trim()) {
      setFormError("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { ok, availability, price } = await createBooking({
        name: name.trim(),
        phone: phone.trim(),
        experience,
        consoleId: selectedConsoleId || undefined,
        players,
        date,
        startTime,
        endTime,
        game: game.trim() || undefined,
        message: "Walk-in booking (created at counter)",
      });

      if (!ok) {
        setFormError(availability.message || "Slot no longer available.");
        await loadDay(experience, date);
        return;
      }

      setSuccessMsg(
        `Walk-in booked: ${name.trim()} — ${selectedConsoleId || experience}, ${formatTime12h(startTime)}–${formatTime12h(endTime)} (Total Collected: ₹${price ?? calculatedPrice}). Reloading dashboard...`
      );
      setShowForm(false);
      setName("");
      setPhone("");
      setGame("");
      setSelectedConsoleId("");
      setIsSharedSession(false);
      setActiveSessionGame(undefined);

      await loadDay(experience, date);
      await onBooked();

      // Automatically close modal and reload dashboard page after booking confirmation
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 900);
    } catch (err: any) {
      setFormError(err.message || "Could not create the booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Walk-in slot checker"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl my-4 bg-[#12151e] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0f1117]">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 text-[#00f2fe]">
              <SearchIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                See for Slot &amp; Walk-In Booking
                <Sparkles className="h-4 w-4 text-[#c4ff3d]" />
              </h2>
              <p className="text-xs text-slate-400">Check availability, shared console sessions &amp; book at the counter with official pricing.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Request inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800">
            <label className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Experience</span>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as Experience)}
                className="px-3 py-2 bg-[#12151e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] [color-scheme:dark]"
              >
                {EXPERIENCES.map((exp) => (
                  <option key={exp} value={exp}>{INVENTORY[exp].label}</option>
                ))}
              </select>
            </label>

            <label className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Date</span>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 bg-[#12151e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] [color-scheme:dark]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Start Time</span>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 bg-[#12151e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] [color-scheme:dark]"
              >
                <option value="">Select</option>
                {startSlots.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">End Time</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!startTime}
                className="px-3 py-2 bg-[#12151e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] disabled:opacity-40 [color-scheme:dark]"
              >
                <option value="">Select</option>
                {endSlots.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Players</span>
              <select
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className="px-3 py-2 bg-[#12151e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] [color-scheme:dark]"
              >
                {Array.from({ length: Math.max(1, maxPlayers) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n > 1 ? "players" : "player"}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleCheck}
              disabled={!startTime || !endTime}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00f2fe] to-[#49e8ff] hover:brightness-110 text-black font-extrabold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <SearchIcon className="h-4 w-4" /> Check Slot &amp; Price
            </button>

            {calculatedPrice > 0 && (
              <div className="flex items-center gap-2 bg-[#080d12] border border-[#c4ff3d]/30 px-3.5 py-1.5 rounded-xl font-mono text-xs">
                <Coins className="h-4 w-4 text-[#c4ff3d]" />
                <span className="text-slate-400">Official Rate:</span>
                <span className="text-[#c4ff3d] font-bold text-sm">₹{calculatedPrice}</span>
              </div>
            )}
          </div>

          {loadError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">{loadError}</div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
            </div>
          )}

          {/* Result for requested window */}
          {checked && requested && (
            <div
              className={`rounded-xl border p-4 ${
                requested.ok
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-rose-500/10 border-rose-500/40"
              }`}
            >
              <div className="flex items-center gap-2">
                {requested.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-400" />
                )}
                <span className={`font-black text-sm ${requested.ok ? "text-emerald-300" : "text-rose-300"}`}>
                  {requested.ok ? "SLOT AVAILABLE FOR WALK-IN" : "SLOT UNAVAILABLE"}
                </span>
                <span className="ml-auto font-mono text-xs text-slate-300">
                  {formatTime12h(startTime)} – {formatTime12h(endTime)}
                </span>
              </div>
              {!requested.ok && requested.reason && (
                <p className="mt-2 text-xs text-rose-200/90">
                  <span className="font-semibold">Reason: </span>{requested.reason}
                </p>
              )}
              {requested.ok && (
                <button
                  onClick={() => openFormFor(startTime, endTime)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                >
                  <CalendarPlus className="h-4 w-4" /> Book this walk-in (₹{calculatedPrice})
                </button>
              )}
            </div>
          )}

          {/* Interactive Console & Slot Grid Component */}
          <ConsoleSlotGrid
            experience={experience}
            date={date}
            selectedConsoleId={selectedConsoleId}
            selectedStartTime={startTime}
            selectedEndTime={endTime}
            onSelectSlot={handleSelectSlotFromGrid}
          />

          {/* Walk-in booking form */}
          {showForm && (
            <form onSubmit={handleCreate} className="rounded-xl border border-[#00f2fe]/40 bg-[#0d1620] p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-[#00f2fe] border-b border-slate-800 pb-3">
                <CalendarPlus className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">New Walk-In Counter Booking</span>
                <span className="ml-auto font-mono text-[11px] text-slate-300">
                  {INVENTORY[experience].label} · {formatTime12h(startTime)}–{formatTime12h(endTime)} · {players} player(s)
                </span>
              </div>

              {/* Shared Session Lock Warning Banner */}
              {isSharedSession && activeSessionGame && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2 font-mono">
                  <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    Shared Console Session Active on <strong>{selectedConsoleId || experience}</strong>. Game is locked to <strong>{activeSessionGame}</strong>.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Customer Name *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Walk-in customer name"
                    className="px-3.5 py-2 bg-[#0a0b0e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Customer Phone / WhatsApp *</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="Phone number"
                    className="px-3.5 py-2 bg-[#0a0b0e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Console Unit</span>
                  <select
                    value={selectedConsoleId}
                    onChange={(e) => setSelectedConsoleId(e.target.value as ConsoleId)}
                    className="px-3.5 py-2 bg-[#0a0b0e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] [color-scheme:dark]"
                  >
                    <option value="">Auto-assign Console</option>
                    {availableConsoles.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Game Title</span>
                  <select
                    value={game}
                    disabled={isSharedSession}
                    onChange={(e) => setGame(e.target.value)}
                    className="px-3.5 py-2 bg-[#0a0b0e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe] disabled:opacity-60 [color-scheme:dark]"
                  >
                    <option value="">Select Game</option>
                    {PLAYABLE_GAMES.map((g: Game) => (
                      <option key={g.id} value={g.title}>{g.title} ({g.genre})</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Price Calculation Card */}
              <div className="p-3.5 bg-[#080d12] border border-[#00f2fe]/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Official Calculated Rate</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {experience === "VR GAMING"
                      ? "VR Rate: ₹100 / 30 min"
                      : experience === "Steering simulator 1"
                      ? "Steering Rate: ₹150 / hour"
                      : players > 1
                      ? `Multiplayer Rate: ₹${experience === "PS2" ? 70 : 90}/player/hr`
                      : `Single Player Rate: ₹${experience === "PS2" ? 80 : 100}/hr`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Total to Collect</span>
                  <span className="text-xl font-black text-[#c4ff3d] font-mono">₹{calculatedPrice}</span>
                </div>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">{formError}</div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                  {submitting ? "Booking…" : `Confirm Walk-In Booking (₹${calculatedPrice})`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
