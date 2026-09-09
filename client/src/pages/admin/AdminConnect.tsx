import React, { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  fetchBookingsAdmin,
  generateWhatsAppUrl,
  type AdminBooking,
  formatDateHuman,
  formatTime12hDisplay,
} from "@/lib/admin-data";
import { MessageCircle, Search, RefreshCw, Phone, User, Calendar, CheckCircle, Clock } from "lucide-react";

export const AdminConnect: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { bookings: data } = await fetchBookingsAdmin({
        searchQuery: search,
        pageSize: 100,
      });
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="bg-[#12151e] border border-slate-800 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-[#25D366]" />
                Connect with Gamers
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Directly communicate with your gaming customers on WhatsApp with pre-filled session confirmation details.
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#00f2fe]" : ""}`} />
              <span>Refresh List</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="bg-[#12151e] border border-slate-800 p-4 rounded-2xl">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gamer by customer name or phone number..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#0a0b0e] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2fe]"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </form>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Gamers Table */}
        <div className="bg-[#12151e] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1117] text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Booking Date</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Players</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-mono">
                      Loading customer list...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No customer records found.
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
                        <td className="p-4 font-medium text-white whitespace-nowrap">
                          {formatDateHuman(booking.date)}
                        </td>
                        <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                          {formatTime12hDisplay(booking.start_time)}
                        </td>
                        <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                          {formatTime12hDisplay(booking.end_time)}
                        </td>
                        <td className="p-4 text-[#00f2fe] font-semibold whitespace-nowrap">
                          {booking.experience}
                        </td>
                        <td className="p-4 whitespace-nowrap">{booking.players}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              booking.status === "confirmed"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : booking.status === "pending"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold rounded-lg shadow-md shadow-emerald-500/20 transition-all text-xs cursor-pointer"
                          >
                            <MessageCircle className="h-3.5 w-3.5 fill-black" />
                            <span>💬 WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
