import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Gamepad2, Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.ok) {
        setLocation("/admin/dashboard");
      } else {
        setErrorMsg(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00f2fe]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#a3e635]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00f2fe] via-cyan-500 to-[#a3e635] p-0.5 shadow-2xl shadow-[#00f2fe]/20 mb-4">
            <div className="h-full w-full bg-[#0a0b0e] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-[#00f2fe]" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">
            GAMERS<span className="text-[#00f2fe]">NEST</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">
            Owner Admin Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#12151e]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-2">Admin Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your authorized Supabase admin credentials to access the booking manager.
          </p>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-300 text-xs animate-in fade-in duration-200">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 font-mono">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gamersnest.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0b0e] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0b0e] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#00f2fe] to-cyan-500 hover:from-cyan-400 hover:to-[#00f2fe] text-[#0a0b0e] font-extrabold text-sm rounded-xl shadow-lg shadow-[#00f2fe]/20 hover:shadow-[#00f2fe]/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Protected by Supabase Auth &amp; Row Level Security.
        </p>
      </div>
    </div>
  );
};
