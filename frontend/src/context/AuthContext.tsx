"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken, setToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Verify token is valid by fetching user profile
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setAccessToken(token);
        setUser(userData);
      } else {
        // Token invalid, clear it
        removeToken();
        setAccessToken(null);
        setUser(null);
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      removeToken();
      setAccessToken(null);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setToken(data.access_token);
      setAccessToken(data.access_token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
