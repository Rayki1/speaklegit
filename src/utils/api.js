const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function apiUrl(path = "") {
  const cleanPath = String(path || "");
  if (!cleanPath) return API_BASE_URL;
  return `${API_BASE_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

export default API_BASE_URL;
