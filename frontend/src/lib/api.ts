export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("access_token") 
    : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; path=/; max-age=0";
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
