const PROTECTED_FOLDERS = new Set(["checklist", "occurrences"]);
const ALL_FOLDERS = ["checklist", "occurrences", "tires"] as const;
export type UploadFolder = (typeof ALL_FOLDERS)[number];

export function isUploadCleanupEnabled(): boolean {
  const raw = process.env.UPLOAD_CLEANUP_ENABLED?.trim().toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function getUploadCleanupFolders(): UploadFolder[] {
  const raw = process.env.UPLOAD_CLEANUP_FOLDERS?.trim();
  if (!raw) return ["tires"];
  const requested = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is UploadFolder =>
      (ALL_FOLDERS as readonly string[]).includes(s),
    );
  return requested.filter((folder) => !PROTECTED_FOLDERS.has(folder));
}

export function isProtectedUploadFolder(folder: string) {
  return PROTECTED_FOLDERS.has(folder);
}
