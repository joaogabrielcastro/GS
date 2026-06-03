import { API_URL } from "@/config/env";

/** Extrai nome do arquivo a partir de qualquer URL gravada no banco. */
export function extractMediaFilename(
  path: string | null | undefined,
): string | null {
  if (!path?.trim()) return null;
  const normalized = path.replace(/\\/g, "/").trim();
  const m = normalized.match(
    /(?:api\/files|uploads)\/(?:checklist|occurrences|tires)\/([^/?#]+)$/i,
  );
  if (m?.[1]) return m[1];
  const legacy = normalized.match(/\/(checklist|occurrences|tires)\/([^/?#]+)$/i);
  if (legacy?.[2]) return legacy[2];
  if (!normalized.includes("/") && /\.(jpe?g|png|webp)$/i.test(normalized)) {
    return normalized;
  }
  const last = normalized.split("/").pop();
  return last && /\.(jpe?g|png|webp)$/i.test(last) ? last : null;
}

function detectCategory(
  path: string,
): "checklist" | "occurrences" | "tires" | null {
  const n = path.replace(/\\/g, "/").toLowerCase();
  if (n.includes("occurrences")) return "occurrences";
  if (n.includes("tires")) return "tires";
  if (n.includes("checklist") || extractMediaFilename(path)) return "checklist";
  return null;
}

/**
 * Caminho relativo para axios (baseURL = API_URL).
 * Ex.: /files/checklist/uuid.jpg
 */
export function getPrivateMediaApiPath(path: string | null | undefined): string {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/").trim();
  const filename = extractMediaFilename(normalized);
  if (!filename) return "";

  const category =
    detectCategory(normalized) ??
    (normalized.includes("occurrences")
      ? "occurrences"
      : normalized.includes("tires")
        ? "tires"
        : "checklist");

  return `/files/${category}/${filename}`;
}

/** URL absoluta (abrir em nova aba). */
export function getPrivateMediaUrl(path: string | null | undefined): string {
  const apiPath = getPrivateMediaApiPath(path);
  if (!apiPath) return "";
  const base = API_URL.replace(/\/$/, "");
  return `${base}${apiPath}`;
}
