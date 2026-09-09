import { supabase } from "./supabase";
import type { Experience } from "./booking";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "not_responded"
  | "completed"
  | "cancelled";

export interface AdminBooking {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  experience: Experience;
  console_id?: string | null;
  players: number;
  date: string;
  start_time: string;
  end_time: string;
  game?: string | null;
  price?: number | null;
  message?: string | null;
  status: BookingStatus;
}

export interface BookingFilterOptions {
  dateFilter?: "all" | "today" | "tomorrow" | "custom";
  customDate?: string;
  statusFilter?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

/** Format "YYYY-MM-DD" into readable "5 September" or "05 Sep 2026" */
export function formatDateHuman(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/** Format 24h "18:00:00" or "18:00" into 12h "6:00 PM" */
export function formatTime12hDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
  Fetch all bookings from Supabase with optional filtering and search.
 */
export async function fetchBookingsAdmin(options?: BookingFilterOptions): Promise<{
  bookings: AdminBooking[];
  totalCount: number;
}> {
  let query = supabase.from("bookings").select("*", { count: "exact" });

  const today = new Date().toISOString().split("T")[0];

  if (options?.dateFilter === "today") {
    query = query.eq("date", today);
  } else if (options?.dateFilter === "tomorrow") {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split("T")[0];
    query = query.eq("date", tomorrow);
  } else if (options?.dateFilter === "custom" && options.customDate) {
    query = query.eq("date", options.customDate);
  }

  if (options?.statusFilter && options.statusFilter !== "all") {
    query = query.eq("status", options.statusFilter);
  }

  if (options?.searchQuery && options.searchQuery.trim() !== "") {
    const search = options.searchQuery.trim();
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // Order by booking date descending, then start_time ascending
  query = query.order("date", { ascending: false }).order("start_time", { ascending: true });

  if (options?.page && options?.pageSize) {
    const from = (options.page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin bookings:", error.message);
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  return {
    bookings: (data as AdminBooking[]) || [],
    totalCount: count || 0,
  };
}

/**
 * Update a booking's status in Supabase.
 */
export async function updateBookingStatus(
  id: string,
  newStatus: BookingStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Failed to update booking status:", error.message);
    throw new Error(`Could not update booking status: ${error.message}`);
  }

  return true;
}

/**
 * Permanently delete a single booking record (hard delete).
 *
 * This is distinct from cancelling: cancelling keeps the row (status =
 * 'cancelled') for the record/history and frees the slot; deleting removes the
 * row entirely. Authorized by the admin "FOR ALL" RLS policy on public.bookings
 * (same mechanism as updateBookingStatus's direct .update()).
 */
export async function deleteBookingAdmin(id: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete booking:", error.message);
    throw new Error(`Could not delete booking: ${error.message}`);
  }

  return true;
}

/**
 * Fetch all non-cancelled bookings for a specific experience on a specific date.
 * Powers the walk-in "See for Slot" availability checker — cancelled bookings
 * are excluded because they no longer consume capacity (mirrors the DB RPC).
 */
export async function fetchDayBookingsForExperience(
  experience: Experience,
  date: string,
): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("experience", experience)
    .eq("date", date)
    .neq("status", "cancelled")
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Failed to load day bookings:", error.message);
    throw new Error(`Could not load bookings for that day: ${error.message}`);
  }

  return (data as AdminBooking[]) || [];
}

/**
 * Build pre-filled WhatsApp click-to-chat URL for customer communication.
 */
export function generateWhatsAppUrl(booking: AdminBooking): string {
  // Sanitize phone number (strip spaces, dashes, plus)
  let cleanPhone = booking.phone.replace(/[^0-9]/g, "");

  // If Indian number without country code (10 digits), prepend 91
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const formattedDate = formatDateHuman(booking.date);
  const formattedStart = formatTime12hDisplay(booking.start_time);
  const formattedEnd = formatTime12hDisplay(booking.end_time);

  const textMessage = `Hi ${booking.name} 👋

This is GamersNest 🎮

Your gaming booking details:

📅 Date: ${formattedDate}
⏰ Time: ${formattedStart} - ${formattedEnd}
🎮 Experience: ${booking.experience}
👥 Players: ${booking.players}

Please confirm your booking by replying YES.

Thank you! See you at GamersNest 🎮`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
}

/**
 * Export booking records to an Excel-readable CSV file download.
 */
export function exportBookingsToExcel(bookings: AdminBooking[], filenamePrefix = "GamersNest_Bookings"): boolean {
  if (!bookings || bookings.length === 0) {
    return false;
  }

  const headers = [
    "Booking ID",
    "Created At",
    "Name",
    "Phone",
    "Experience",
    "Players",
    "Date",
    "Start Time",
    "End Time",
    "Game",
    "Message",
    "Status",
  ];

  const rows = bookings.map((b) => [
    `"${b.id}"`,
    `"${b.created_at || ""}"`,
    `"${(b.name || "").replace(/"/g, '""')}"`,
    `"${(b.phone || "").replace(/"/g, '""')}"`,
    `"${b.experience || ""}"`,
    b.players || 1,
    `"${b.date || ""}"`,
    `"${b.start_time || ""}"`,
    `"${b.end_time || ""}"`,
    `"${(b.game || "").replace(/"/g, '""')}"`,
    `"${(b.message || "").replace(/"/g, '""')}"`,
    `"${b.status || "pending"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const timestamp = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

/**
 * Perform safe admin database clearance via RPC procedure.
 */
export async function deleteAllBookingsAdmin(): Promise<{ ok: boolean; message: string }> {
  const { data, error } = await supabase.rpc("delete_all_bookings_admin");

  if (error) {
    console.error("Error clearing booking data:", error.message);
    throw new Error(error.message || "Failed to clear booking data.");
  }

  return {
    ok: Boolean(data?.ok),
    message: String(data?.message || "All booking data cleared successfully."),
  };
}
