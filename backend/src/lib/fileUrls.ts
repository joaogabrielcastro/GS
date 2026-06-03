import type { FileCategory } from "./storage";

/** Variantes de URL gravadas no banco ao longo do tempo. */
export function buildStoredFileUrlCandidates(
  category: FileCategory,
  filename: string,
): string[] {
  const safe = filename.replace(/\\/g, "/").split("/").pop() || filename;
  return [
    `/api/files/${category}/${safe}`,
    `/uploads/${category}/${safe}`,
    `/${category}/${safe}`,
    `${category}/${safe}`,
    safe,
  ];
}

export function extractFilenameFromStoredUrl(
  photoUrl: string | null | undefined,
): string | null {
  if (!photoUrl?.trim()) return null;
  const normalized = photoUrl.replace(/\\/g, "/").trim();
  const fromPath = normalized.match(
    /(?:api\/files|uploads)\/(?:checklist|occurrences|tires)\/([^/?#]+)$/i,
  );
  if (fromPath?.[1]) return fromPath[1];
  const legacy = normalized.match(/\/(checklist|occurrences|tires)\/([^/?#]+)$/i);
  if (legacy?.[2]) return legacy[2];
  if (!normalized.includes("/") && /\.(jpe?g|png|webp)$/i.test(normalized)) {
    return normalized;
  }
  const last = normalized.split("/").pop();
  return last && /\.(jpe?g|png|webp)$/i.test(last) ? last : null;
}
