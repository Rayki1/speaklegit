function normalizeBaseUrl(rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return import.meta.env.PROD ? "/api" : "http://localhost:5000";
  }

  return value.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export function apiUrl(path = "") {
  const cleanPath = String(path || "").trim();

  if (!cleanPath) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export default API_BASE_URL;
