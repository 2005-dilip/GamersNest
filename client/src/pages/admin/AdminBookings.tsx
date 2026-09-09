import React, { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  fetchBookingsAdmin,
  updateBookingStatus,
  deleteBookingAdmin,
  exportBookingsToExcel,
  generateWhatsAppUrl,
  type AdminBooking,
  type BookingStatus,
  formatDateHuman,
  formatTime12hDisplay,
} from "@/lib/admin-data";
import { BookingDetailModal } from "./BookingDetailModal";
import { WalkInSlotChecker } from "./WalkInSlotChecker";
import {
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  CheckCheck,
  Clock3,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Plus,
  Trash2,
  Search as SearchIcon,
} from "lucide-react";

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "custom">("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBookingsAdmin({
        dateFilter,
        customDate,
        statusFilter,
        searchQuery,
        page,
        pageSize,
      });
      setBookings(result.bookings);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [dateFilter, customDate, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBookings();
  };

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showChecker, setShowChecker] = useState<boolean>(false);

  const handleDeleteBooking = async (booking: AdminBooking) => {
    const confirmed = window.confirm(
      `Permanently delete this booking?\n\n${booking.name} — ${booking.experience}\n${formatDateHuman(booking.date)}, ${formatTime12hDisplay(booking.start_time)}–${formatTime12hDisplay(booking.end_time)}\n\nThis removes the record entirely and cannot be undone. To keep a record while freeing the slot, cancel it instead.`,
    );
    if (!confirmed) return;

    setDeletingId(booking.id);
    try {
      await deleteBookingAdmin(booking.id);
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking(null);
      }
      await loadBookings();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    // Export all current filtered bookings
    try {
      const { bookings: exportList } = await fetchBookingsAdmin({
        dateFilter,
        customDate,
        statusFilter,
        searchQuery,
        page: 1,
        pageSize: 10000,
      });
      if (exportList.length === 0) {
        alert("No bookings found matching current filters to export.");
        return;
      }
      exportBookingsToExcel(exportList);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock3 className="h-3 w-3" />
            Pending
          </span>
        );
      case "not_responded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Clock className="h-3 w-3" />
            Not Responded
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCheck className="h-3 w-3" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Title & Export Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12151e] border border-slate-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#00f2fe]" />
              Booking Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Filter, manage, view details, and update booking statuses for all GamersNest customer sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowChecker(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#00f2fe] to-[#49e8ff] hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#00f2fe]/20 transition-all cursor-pointer"
            >
              <SearchIcon className="h-4 w-4" />
              <span>See for Slot / Walk-in</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download as Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#12151e] border border-slate-800 p-4 rounded-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 sm:min-w-[280px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name or phone number..."
                  className="w-full pl-9 pr-10 py-2 bg-[#0a0b0e] border border-slate-700/80 rounded-xl text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe]"
                />
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                      loadBookings();
                    }}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Date Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0b0e] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setDateFilter("all");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === "all"
                    ? "bg-[#00f2fe] text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Dates
              </button>
              <button
                onClick={() => {
                  setDateFilter("today");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === "today"
                    ? "bg-[#00f2fe] text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setDateFilter("tomorrow");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === "tomorrow"
                    ? "bg-[#00f2fe] text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === "custom"
                    ? "bg-[#00f2fe] text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Custom Date
              </button>
            </div>
          </div>

          {/* Custom Date Input if selected */}
          {dateFilter === "custom" && (
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Select Specific Date:</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-[#0a0b0e] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f2fe]"
              />
            </div>
          )}

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-mono shrink-0 mr-1">Status:</span>
            {[
              { label: "All Statuses", val: "all" },
              { label: "Pending", val: "pending" },
              { label: "Confirmed", val: "confirmed" },
              { label: "Not Responded", val: "not_responded" },
              { label: "Completed", val: "completed" },
              { label: "Cancelled", val: "cancelled" },
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => {
                  setStatusFilter(st.val);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-all ${
                  statusFilter === st.val
                    ? "bg-slate-700 text-white border-slate-500 font-bold"
                    : "bg-[#0a0b0e] text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-[#12151e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1117] text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Console Setup</th>
                  <th className="p-4">Players</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 font-mono">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-[#00f2fe]" />
                        <span>Fetching bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No bookings found matching your selected filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => {
                    const whatsappUrl = generateWhatsAppUrl(booking);
                    return (
                      <tr key={booking.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white whitespace-nowrap">
                          {booking.name}
                        </td>
                        <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                          {booking.phone}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="text-[#00f2fe] font-bold block">{booking.console_id || booking.experience}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{booking.experience}</span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold text-white">{booking.players}</td>
                        <td className="p-4 whitespace-nowrap font-mono text-[#c4ff3d] font-bold">
                          {booking.price !== undefined && booking.price !== null ? `₹${booking.price}` : "—"}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-medium text-white">{formatDateHuman(booking.date)}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {booking.date}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono text-slate-300">
                          {formatTime12hDisplay(booking.start_time)} - {formatTime12hDisplay(booking.end_time)}
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono text-cyan-300">
                          {booking.game ? `🎮 ${booking.game}` : "—"}
                        </td>
                        <td className="p-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                        <td className="p-4 whitespace-nowrap text-right space-x-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg border border-[#25D366]/30 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                            title="View Details & Update Status"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            disabled={deletingId === booking.id}
                            className="inline-flex p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete this booking permanently"
                          >
                            {deletingId === booking.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-[#0f1117] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {bookings.length} of {totalCount} total bookings
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Walk-in "See for Slot" availability checker + quick booking */}
        {showChecker && (
          <WalkInSlotChecker
            onClose={() => setShowChecker(false)}
            onBooked={async () => {
              await loadBookings();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};
