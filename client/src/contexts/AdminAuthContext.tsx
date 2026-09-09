import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(data.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkAdminRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: error.message };
      }
      if (!data.user) {
        return { ok: false, error: "User login failed." };
      }

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        return { ok: false, error: "Access denied. Your account does not have admin privileges." };
      }

      setUser(data.user);
      setIsAdmin(true);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || "An unexpected error occurred during login." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user || !user.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    return !error;
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, login, logout, verifyPassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
