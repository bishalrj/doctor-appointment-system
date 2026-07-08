"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, AuthTokenResponse } from "@/types/auth";
import { api } from "@/lib/axios";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthTokenResponse) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Validate token by fetching latest profile
          const res = await api.get<User>("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
          console.error("Session verification failed during init:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (data: AuthTokenResponse) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success("Successfully logged in!");
    
    // Redirect based on role
    if (data.user.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (data.user.role === "DOCTOR") {
      router.push("/dashboard/doctor");
    } else {
      router.push("/dashboard/patient");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Logout API call failed, clearing local state anyway.");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      toast.info("You have been logged out.");
      router.push("/login");
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
