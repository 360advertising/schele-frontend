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

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(fullUrl, {
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
    
    // Try to parse JSON error, but handle HTML responses gracefully
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } else {
        // If it's not JSON, read as text to see what we got
        const text = await response.text();
        console.error("Non-JSON error response:", text.substring(0, 200));
        errorMessage = `Server returned non-JSON response. Status: ${response.status}`;
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
      errorMessage = `Request failed with status ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content and 304 Not Modified responses (no body)
  const responseStatus = response.status;
  if (responseStatus === 204 || responseStatus === 304) {
    return null as T;
  }

  // Check if response has content before parsing
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null as T;
  }

  try {
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      return null as T;
    }
    
    return JSON.parse(text) as T;
  } catch (parseError: any) {
    console.error('Failed to parse JSON response:', parseError);
    return null as T;
  }
}
