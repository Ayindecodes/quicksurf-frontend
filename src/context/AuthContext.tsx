"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored tokens & fetch profile on mount
  useEffect(() => {
    const access = localStorage.getItem("access") || localStorage.getItem("qs_access");
    if (access) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch logged-in user data
  const fetchUser = async () => {
    try {
      const me = await api.get<User>("/users/dashboard/");
      setUser(me);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post<{ access: string; refresh: string }>(
        "/users/login/",
        { email, password }
      );
      // Keep your existing keys...
      localStorage.setItem("access", resp.access);
      localStorage.setItem("refresh", resp.refresh);
      // ...and also set keys the api helper reads (qs_*) so authFetch adds Authorization
      localStorage.setItem("qs_access", resp.access);
      localStorage.setItem("qs_refresh", resp.refresh);

      toast.success("Login successful");
      await fetchUser();
    } catch {
      toast.error("Invalid credentials");
    }
  };

  // Register
  const register = async (email: string, password: string) => {
    try {
      await api.post("/users/register/", { email, password });
      toast.success("Registration successful! Please log in.");
    } catch {
      toast.error("Registration failed");
    }
  };

  // Logout
  const logout = () => {
    // Clear both sets of keys to stay consistent
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("qs_access");
    localStorage.removeItem("qs_refresh");
    setUser(null);
    toast("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
