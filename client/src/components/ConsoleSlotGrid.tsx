import React, { useEffect, useState } from "react";
import {
  CONSOLES,
  ConsoleId,
  Experience,
  formatTime12h,
  getConsolesForExperience,
  getTimeSlots,
  toMinutes,
} from "@/lib/booking";
import { fetchConsoleSlotAvailability, ConsoleSlotBooking } from "@/lib/booking-data";
import { Gamepad2, Users, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ConsoleSlotGridProps {
  experience: Experience;
  date: string;
  selectedConsoleId: ConsoleId | "";
  selectedStartTime: string;
  selectedEndTime: string;
  onSelectSlot: (
    consoleId: ConsoleId,
    startTime: string,
    endTime: string,
    existingGame?: string,
    isShared?: boolean,
    remainingSeats?: number
  ) => void;
}

export const ConsoleSlotGrid: React.FC<ConsoleSlotGridProps> = ({
  experience,
  date,
  selectedConsoleId,
  selectedStartTime,
  selectedEndTime,
  onSelectSlot,
}) => {
  const [slotBookings, setSlotBookings] = useState<ConsoleSlotBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load slot bookings whenever date changes
  useEffect(() => {
    let isSubscribed = true;
    if (!date) {
      setSlotBookings([]);
      return;
    }

    setLoading(true);
    fetchConsoleSlotAvailability(date)
      .then((data) => {
        if (isSubscribed) {
          setSlotBookings(data);
        }
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [date]);

  const availableConsoles = getConsolesForExperience(experience);
  const slotIntervalMinutes = experience === "VR GAMING" ? 30 : 60;
  const timeSlots = getTimeSlots(slotIntervalMinutes);
  // Start slots exclude the store closing slot
  const startSlots = timeSlots.slice(0, -1);

  return (
    <div className="console-grid-wrapper my-6 p-4 sm:p-6 bg-[#080d12]/90 border border-cyan-500/20 rounded-2xl shadow-xl space-y-6">
      {/* Grid Header & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#00f2fe] font-bold uppercase tracking-wider">
            <Gamepad2 className="h-4 w-4 text-[#c4ff3d]" />
            <span>REAL-TIME CONSOLE &amp; TIME SLOT AVAILABILITY</span>
          </div>
          <h4 className="text-lg font-bold text-white font-display mt-0.5">
            Select a Console &amp; Slot for {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Selected Date"}
          </h4>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            Partially Booked (Join Session)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            Fully Booked
          </span>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-xs font-mono text-cyan-400 animate-pulse">
          ⚡ Loading live console availability for {date}...
        </div>
      )}

      {/* Console Grids */}
      <div className="space-y-6">
        {availableConsoles.map((consoleItem) => {
          const consoleBookings = slotBookings.filter((b) => {
            if (b.console_id) return b.console_id === consoleItem.id;
            return b.experience === experience;
          });

          return (
            <div
              key={consoleItem.id}
              className="bg-[#0b1219] border border-slate-800/80 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] text-xs font-bold font-mono">
                    {consoleItem.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Capacity: {consoleItem.capacity} {consoleItem.capacity > 1 ? "players" : "player"}
                  </span>
                </div>
                {consoleItem.supportsSharedSession && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Shared Session Supported
                  </span>
                )}
              </div>

              {/* Slots Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
                {startSlots.map((slot) => {
                  const slotStartMin = toMinutes(slot.value);
                  const slotEndMin = slotStartMin + slotIntervalMinutes;
                  const endSlotValue = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

                  // Find overlapping bookings for this slot on this console
                  const overlapping = consoleBookings.filter((b) => {
                    const bStart = toMinutes(b.start_time);
                    const bEnd = toMinutes(b.end_time);
                    return bStart < slotEndMin && bEnd > slotStartMin;
                  });

                  const occupiedPlayers = overlapping.reduce((sum, b) => sum + (b.players || 1), 0);
                  const remainingSeats = Math.max(0, consoleItem.capacity - occupiedPlayers);
                  const activeGame = overlapping.find((b) => Boolean(b.game))?.game;

                  const isFullyBooked = remainingSeats <= 0;
                  const isPartiallyBooked = occupiedPlayers > 0 && remainingSeats > 0;
                  const isAvailable = occupiedPlayers === 0;

                  const isSelected =
                    selectedConsoleId === consoleItem.id &&
                    selectedStartTime === slot.value &&
                    selectedEndTime === endSlotValue;

                  let borderStyle = "border-slate-800 bg-[#080d12] hover:border-[#00f2fe]/60";
                  let statusBadge = (
                    <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                      {remainingSeats}/{consoleItem.capacity} Seats Available
                    </span>
                  );

                  if (isFullyBooked) {
                    borderStyle = "border-rose-950/60 bg-rose-950/20 opacity-65 cursor-not-allowed";
                    statusBadge = (
                      <span className="inline-flex items-center text-[10px] font-mono text-rose-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />
                        Fully Booked ({consoleItem.capacity}/{consoleItem.capacity})
                      </span>
                    );
                  } else if (isPartiallyBooked) {
                    borderStyle = "border-amber-500/40 bg-amber-500/10 hover:border-amber-400";
                    statusBadge = (
                      <span className="inline-flex items-center text-[10px] font-mono text-amber-300 font-bold truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 flex-shrink-0" />
                        {remainingSeats} Left · {activeGame || "Join Session"}
                      </span>
                    );
                  }

                  if (isSelected) {
                    borderStyle = "border-[#00f2fe] bg-[#00f2fe]/15 shadow-lg shadow-[#00f2fe]/20 ring-1 ring-[#00f2fe]";
                  }

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={isFullyBooked}
                      onClick={() =>
                        onSelectSlot(
                          consoleItem.id,
                          slot.value,
                          endSlotValue,
                          activeGame || undefined,
                          isPartiallyBooked,
                          remainingSeats
                        )
                      }
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${borderStyle}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white font-mono">
                          {slot.label} – {formatTime12h(endSlotValue)}
                        </span>
                      </div>

                      <div className="mt-1.5 w-full truncate">
                        {statusBadge}
                      </div>

                      {isPartiallyBooked && activeGame && (
                        <div className="mt-1 text-[10px] text-amber-200/90 font-mono truncate bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                          🎮 {activeGame}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
