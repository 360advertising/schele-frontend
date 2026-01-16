/**
 * Authentication helper functions
 * DEMO MODE - This file is disabled. No localStorage or cookie usage.
 * Authentication is handled via AuthContext with hardcoded demo user.
 */

// DEMO MODE - All functions disabled. No backend authentication.
/*
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
  // Also set cookie for middleware
  document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  // Remove cookie
  document.cookie = "access_token=; path=/; max-age=0";
}

export function logout(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
*/

// DEMO MODE - Placeholder functions that do nothing
export function getToken(): string | null {
  return null;
}

export function setToken(_token: string): void {
  // No-op in demo mode
}

export function removeToken(): void {
  // No-op in demo mode
}

export function logout(): void {
  // No-op in demo mode
}