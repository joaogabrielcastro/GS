import { ASSETS_BASE_URL } from "@/config/env";

/** Resolve URL de foto (legado + /api/files/ + uploads antigos). */
export function getPrivateMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/").trim();

  if (normalized.startsWith("http")) return normalized;

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  if (withLeadingSlash.startsWith("/uploads/checklist/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/uploads/checklist/", "/api/files/checklist/")}`;
  }
  if (withLeadingSlash.startsWith("/uploads/occurrences/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/uploads/occurrences/", "/api/files/occurrences/")}`;
  }
  if (withLeadingSlash.startsWith("/api/files/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash}`;
  }

  if (withLeadingSlash.startsWith("/checklist/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/checklist/", "/api/files/checklist/")}`;
  }
  if (withLeadingSlash.startsWith("/occurrences/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/occurrences/", "/api/files/occurrences/")}`;
  }

  if (!withLeadingSlash.includes("/")) {
    return `${ASSETS_BASE_URL}/api/files/checklist/${withLeadingSlash.replace(/^\//, "")}`;
  }

  return `${ASSETS_BASE_URL}${withLeadingSlash}`;
}
