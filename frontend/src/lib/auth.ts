/**
 * Authentication helper functions
 */

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