import React, { useState } from "react";
import {
  type AdminBooking,
  type BookingStatus,
  formatDateHuman,
  formatTime12hDisplay,
  generateWhatsAppUrl,
} from "@/lib/admin-data";
import {
  X,
  User,
  Phone,
  Gamepad2,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock3,
  CheckCheck,
  Loader2,
  FileText,
} from "lucide-react";

interface BookingDetailModalProps {
  booking: AdminBooking | null;
  onClose: () => void;
  onStatusUpdate: (id: string, newStatus: BookingStatus) => Promise<void>;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onStatusUpdate,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!booking) return null;

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setUpdating(true);
    try {
      await onStatusUpdate(booking.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock3 className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case "not_responded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Clock className="h-3.5 w-3.5" />
            Not Responded
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCheck className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const whatsappUrl = generateWhatsAppUrl(booking);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12151e] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0f1117]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Booking Details</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {booking.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Customer & Status Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-base font-bold text-white">
                <User className="h-4 w-4 text-[#00f2fe]" />
                <span>{booking.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-xs mt-1 font-mono">
                <Phone className="h-3.5 w-3.5 text-[#a3e635]" />
                <span>{booking.phone}</span>
              </div>
            </div>
            <div>{getStatusBadge(booking.status)}</div>
          </div>

          {/* Booking Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-[#0a0b0e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <Gamepad2 className="h-3.5 w-3.5 text-[#00f2fe]" />
                Console &amp; Experience
              </span>
              <p className="font-bold text-white">{booking.console_id || booking.experience}</p>
              <p className="text-[11px] text-slate-400 font-mono">{booking.experience}</p>
            </div>

            <div className="bg-[#0a0b0e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-[#a3e635]" />
                Players &amp; Price
              </span>
              <p className="font-bold text-white">{booking.players} Player(s)</p>
              {booking.price !== undefined && booking.price !== null && (
                <p className="text-[11px] text-[#c4ff3d] font-bold font-mono">Total: ₹{booking.price}</p>
              )}
            </div>

            <div className="bg-[#0a0b0e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                Date
              </span>
              <p className="font-bold text-white">{formatDateHuman(booking.date)}</p>
              <p className="text-[11px] text-slate-500 font-mono">{booking.date}</p>
            </div>

            <div className="bg-[#0a0b0e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Time Window
              </span>
              <p className="font-bold text-white text-xs sm:text-sm">
                {formatTime12hDisplay(booking.start_time)} – {formatTime12hDisplay(booking.end_time)}
              </p>
            </div>
          </div>

          {/* Optional Info: Preferred Game & Customer Message */}
          {(booking.game || booking.message) && (
            <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800">
              {booking.game && (
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                    Requested Game
                  </span>
                  <p className="text-slate-200 font-medium">{booking.game}</p>
                </div>
              )}
              {booking.message && (
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                    Customer Message
                  </span>
                  <p className="text-slate-300 text-xs italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    "{booking.message}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Created At Stamp */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
            <FileText className="h-3.5 w-3.5" />
            <span>Booked on: {new Date(booking.created_at).toLocaleString()}</span>
          </div>

          {/* WhatsApp Direct Communication Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <MessageCircle className="h-5 w-5 fill-black text-black" />
            <span>WhatsApp Customer</span>
          </a>

          {/* Status Quick Change Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 block">
              Change Booking Status
            </span>
            {updating ? (
              <div className="py-4 flex items-center justify-center space-x-2 text-slate-400 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-[#00f2fe]" />
                <span>Updating database...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={booking.status === "confirmed"}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Confirm</span>
                </button>

                <button
                  onClick={() => handleStatusChange("not_responded")}
                  disabled={booking.status === "not_responded"}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Not Responded</span>
                </button>

                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={booking.status === "completed"}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark Completed</span>
                </button>

                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={booking.status === "cancelled"}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0f1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
