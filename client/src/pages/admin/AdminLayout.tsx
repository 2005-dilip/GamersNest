import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Database,
  LogOut,
  Gamepad2,
  Menu,
  X,
  User,
  ExternalLink,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      label: "Connect with Gamers",
      path: "/admin/connect",
      icon: MessageCircle,
    },
    {
      label: "Data Management",
      path: "/admin/data",
      icon: Database,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-slate-100 flex flex-col font-sans selection:bg-[#00f2fe]/30 selection:text-white">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0f1117]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#00f2fe] to-[#84cc16] p-0.5 shadow-lg shadow-[#00f2fe]/20 group-hover:scale-105 transition-transform">
                <div className="h-full w-full bg-[#0a0b0e] rounded-[7px] flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-[#00f2fe]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                  GAMERS<span className="text-[#00f2fe]">NEST</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 tracking-normal">
                    Admin
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-sm shadow-[#00f2fe]/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#00f2fe]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 border-r border-slate-800 pr-4">
              <User className="h-3.5 w-3.5 text-[#a3e635]" />
              <span className="font-mono text-slate-300 truncate max-w-[150px]">
                {user?.email || "Admin Owner"}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-md transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between px-3.5 py-2">
              <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]">
                {user?.email}
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/60 bg-[#0a0b0e] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GamersNest Admin Portal &copy; {new Date().getFullYear()} — Secure Booking Management</span>
          <Link href="/" target="_blank" className="text-slate-400 hover:text-[#00f2fe] flex items-center gap-1">
            <span>Open Public Website</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
};
