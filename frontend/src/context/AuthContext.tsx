"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";

// DEMO MODE - User hardcodat pentru demo
export const DEMO_USER = {
  id: 'demo-admin',
  email: 'admin@schele.ro',
  name: 'Administrator',
  role: 'ADMIN',
};

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
  login: (token?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const login = async () => {
    // Mock login - nu face nimic în modul DEMO
    // Utilizatorul este deja autentificat
  };

  const logout = () => {
    // Mock logout - redirect la login
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: 'demo-token',
        user: DEMO_USER,
        isAuthenticated: true,
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
