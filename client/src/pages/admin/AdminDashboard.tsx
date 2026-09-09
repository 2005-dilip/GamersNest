import React, { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  fetchBookingsAdmin,
  updateBookingStatus,
  generateWhatsAppUrl,
  type AdminBooking,
  type BookingStatus,
  formatTime12hDisplay,
  formatDateHuman,
} from "@/lib/admin-data";
import { BookingDetailModal } from "./BookingDetailModal";
import {
  CalendarDays,
  Clock3,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Eye,
  RefreshCw,
  Gamepad2,
  Users,
  ArrowRight,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";
import { Link } from "wouter";
import { WalkInSlotChecker } from "./WalkInSlotChecker";

export const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [showChecker, setShowChecker] = useState<boolean>(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { bookings: allBookings } = await fetchBookingsAdmin();
      setBookings(allBookings);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate metrics
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const upcomingToday = todayBookings.filter((b) => b.status !== "cancelled" && b.status !== "completed");

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      await loadDashboardData();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12151e] border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#00f2fe]/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Dashboard Overview
              <Sparkles className="h-5 w-5 text-[#00f2fe]" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time summary of today's gaming sessions and pending customer requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowChecker(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00f2fe] to-[#49e8ff] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#00f2fe]/20 transition-all cursor-pointer"
            >
              <SearchIcon className="h-4 w-4" />
              <span>See for Slot / Walk-in</span>
            </button>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#00f2fe]" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Key Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Today's Total Bookings */}
          <div className="bg-[#12151e] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-[#00f2fe]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Today's Bookings
              </span>
              <div className="h-10 w-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{todayBookings.length}</span>
              <span className="text-[11px] text-slate-400 font-mono">Sessions today</span>
            </div>
          </div>

          {/* Card 2: Pending Bookings */}
          <div className="bg-[#12151e] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Pending Approval
              </span>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{pendingBookings.length}</span>
              <span className="text-[11px] text-amber-400 font-mono">Action required</span>
            </div>
          </div>

          {/* Card 3: Confirmed Bookings */}
          <div className="bg-[#12151e] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Confirmed Total
              </span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{confirmedBookings.length}</span>
              <span className="text-[11px] text-emerald-400 font-mono">Confirmed</span>
            </div>
          </div>

          {/* Card 4: Upcoming Today */}
          <div className="bg-[#12151e] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Upcoming Today
              </span>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{upcomingToday.length}</span>
              <span className="text-[11px] text-cyan-400 font-mono">Slots reserved</span>
            </div>
          </div>
        </div>

        {/* Section 1: Today's Upcoming Sessions */}
        <div className="bg-[#12151e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0f1117]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#00f2fe]" />
              Today's Upcoming Sessions ({todayStr})
            </h2>
            <Link
              href="/admin/bookings"
              className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All Bookings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Loading today's schedule...
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No bookings scheduled for today yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {todayBookings.map((booking) => {
                const whatsappUrl = generateWhatsAppUrl(booking);
                return (
                  <div
                    key={booking.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="h-10 w-10 rounded-xl bg-[#0a0b0e] border border-slate-800 flex items-center justify-center text-[#00f2fe] shrink-0 mt-0.5">
                        <Gamepad2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{booking.name}</span>
                          <span className="text-xs text-slate-400 font-mono">({booking.phone})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                          <span className="text-[#00f2fe] font-semibold">{booking.experience}</span>
                          <span>•</span>
                          <span>{booking.players} player(s)</span>
                          <span>•</span>
                          <span className="font-mono text-white">
                            {formatTime12hDisplay(booking.start_time)} - {formatTime12hDisplay(booking.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Recent Pending Requests */}
        <div className="bg-[#12151e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0f1117]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-400" />
              Pending Requests Needing Confirmation ({pendingBookings.length})
            </h2>
            <Link
              href="/admin/connect"
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Connect Section</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Loading pending requests...
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              All caught up! No pending bookings at the moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {pendingBookings.slice(0, 5).map((booking) => {
                const whatsappUrl = generateWhatsAppUrl(booking);
                return (
                  <div
                    key={booking.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{booking.name}</span>
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="text-white font-medium">{formatDateHuman(booking.date)}</span>
                        <span>•</span>
                        <span>{booking.experience}</span>
                        <span>•</span>
                        <span>
                          {formatTime12hDisplay(booking.start_time)} - {formatTime12hDisplay(booking.end_time)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm</span>
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail View Modal */}
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Walk-In Slot Checker & Booking Modal */}
        {showChecker && (
          <WalkInSlotChecker
            onClose={() => setShowChecker(false)}
            onBooked={async () => {
              await loadDashboardData();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};
