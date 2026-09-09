import React from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { Loader2 } from "lucide-react";

export const ProtectedAdminRoute: React.FC<{ component: React.ComponentType }> = ({
  component: Component,
}) => {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex flex-col items-center justify-center text-slate-300 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-[#00f2fe]" />
        <span className="text-xs font-mono">Verifying admin session...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return <Component />;
};
