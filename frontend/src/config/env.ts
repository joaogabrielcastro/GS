const FALLBACK_API_URL = "http://localhost:3000/api";

export const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, "");
export const ASSETS_BASE_URL = API_URL.replace(/\/api\/?$/, "");

/** Exibir rota /register e link na tela de login (deve bater com ALLOW_PUBLIC_REGISTER no backend). */
export const ALLOW_PUBLIC_REGISTER =
  import.meta.env.VITE_ALLOW_PUBLIC_REGISTER === "true";
