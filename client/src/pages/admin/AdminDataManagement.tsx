import React, { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  fetchBookingsAdmin,
  exportBookingsToExcel,
  deleteAllBookingsAdmin,
} from "@/lib/admin-data";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

export const AdminDataManagement: React.FC = () => {
  const { verifyPassword } = useAdminAuth();

  // Export State
  const [exporting, setExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Clear Data Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [backupVerified, setBackupVerified] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  const REQUIRED_CONFIRM_TEXT = "DELETE ALL BOOKING DATA";

  const handleDownloadBackup = async () => {
    setExporting(true);
    setExportSuccessMsg(null);
    try {
      const { bookings } = await fetchBookingsAdmin({ page: 1, pageSize: 10000 });
      if (!bookings || bookings.length === 0) {
        alert("No booking data available to export.");
        return false;
      }
      const ok = exportBookingsToExcel(bookings, "GamersNest_Backup");
      if (ok) {
        setExportSuccessMsg(`Successfully exported ${bookings.length} booking records!`);
        setBackupVerified(true);
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
      return false;
    } finally {
      setExporting(false);
    }
  };

  const handleOpenClearModal = () => {
    setShowClearModal(true);
    setBackupVerified(false);
    setAdminPassword("");
    setConfirmText("");
    setClearError(null);
    setPurgedSuccess(false);
  };

  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setClearError(null);

    // Step 1: Backup verification check
    if (!backupVerified) {
      setClearError("You must generate and verify an Excel backup before proceeding.");
      return;
    }

    // Step 2: Confirm text check
    if (confirmText.trim() !== REQUIRED_CONFIRM_TEXT) {
      setClearError(`Please type exact confirmation text: "${REQUIRED_CONFIRM_TEXT}"`);
      return;
    }

    // Step 3: Password re-authentication
    if (!adminPassword) {
      setClearError("Please enter your admin password to re-authenticate.");
      return;
    }

    setClearing(true);
    try {
      const isValidPassword = await verifyPassword(adminPassword);
      if (!isValidPassword) {
        setClearError("Incorrect password. Re-authentication failed.");
        setClearing(false);
        return;
      }

      // Step 4: Execute database purge via RPC
      const result = await deleteAllBookingsAdmin();
      if (result.ok) {
        setPurgedSuccess(true);
      } else {
        setClearError(result.message || "Failed to clear booking data.");
      }
    } catch (err: any) {
      setClearError(err.message || "Deletion failed.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="bg-[#12151e] border border-slate-800 p-6 rounded-2xl">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-[#00f2fe]" />
            Data Management &amp; Backup
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Export booking records to Excel spreadsheets or manage database clearance with multi-step security verification.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Download Excel Backup */}
          <div className="bg-[#12151e] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Excel Backup Export</h3>
                  <p className="text-xs text-slate-400">Download full CSV/Excel spreadsheet of all customer bookings.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Export all booking fields including Customer PII, Experience, Player Count, Dates, Times, Status, and Messages for local archive or financial analysis.
              </p>
            </div>

            {exportSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{exportSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleDownloadBackup}
              disabled={exporting}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Excel File...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download as Excel</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Clear All Data (Destructive Action) */}
          <div className="bg-[#12151e] border border-rose-500/20 p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-300">Clear All Booking Data</h3>
                  <p className="text-xs text-slate-400">Permanently purge all customer records from Supabase.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Destructive operation. Requires mandatory Excel backup generation, admin password re-authentication, and explicit text confirmation before deletion.
              </p>
            </div>

            <button
              onClick={handleOpenClearModal}
              className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Clear All Data Multi-Step Modal */}
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#12151e] border border-rose-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="p-5 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-rose-400 font-bold">
                  <ShieldAlert className="h-5 w-5" />
                  <span>DANGEROUS ACTION: Clear All Booking Data</span>
                </div>
                <button
                  onClick={() => setShowClearModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs text-slate-300">
                {purgedSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Data Cleared Successfully</h3>
                    <p className="text-slate-400">
                      All booking records have been permanently deleted from Supabase.
                    </p>
                    <button
                      onClick={() => setShowClearModal(false)}
                      className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDeletion} className="space-y-4">
                    {/* Warning Notice */}
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
                      <p className="font-bold mb-1">Permanent Deletion Warning:</p>
                      <p>
                        This action will permanently delete all customer bookings. This step cannot be undone.
                      </p>
                    </div>

                    {clearError && (
                      <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{clearError}</span>
                      </div>
                    )}

                    {/* Step 1: Mandatory Excel Backup */}
                    <div className="p-3.5 bg-[#0a0b0e] border border-slate-800 rounded-xl space-y-2">
                      <span className="font-mono text-slate-400 uppercase text-[11px] block">
                        Step 1: Generate Excel Backup
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">
                          {backupVerified ? "Backup generated & verified!" : "Backup required before deletion."}
                        </span>
                        <button
                          type="button"
                          onClick={handleDownloadBackup}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Generate Backup</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Re-authenticate Admin Password */}
                    <div>
                      <label className="block text-slate-400 font-mono text-[11px] uppercase mb-1">
                        Step 2: Admin Password Re-Authentication
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter your admin password"
                          className="w-full pl-9 pr-3 py-2 bg-[#0a0b0e] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                          required
                        />
                        <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Step 3: Type DELETE ALL BOOKING DATA */}
                    <div>
                      <label className="block text-slate-400 font-mono text-[11px] uppercase mb-1">
                        Step 3: Type "<span className="text-rose-400 font-bold">{REQUIRED_CONFIRM_TEXT}</span>"
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={REQUIRED_CONFIRM_TEXT}
                        className="w-full px-3 py-2 bg-[#0a0b0e] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Submit Deletion Button */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowClearModal(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={clearing || !backupVerified}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        {clearing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>DELETE ALL BOOKING DATA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
