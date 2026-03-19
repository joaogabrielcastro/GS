const FALLBACK_API_URL = "http://localhost:3000/api";

export const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, "");
export const ASSETS_BASE_URL = API_URL.replace(/\/api\/?$/, "");
