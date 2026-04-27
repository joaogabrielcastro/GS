import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_INTERVAL_HOURS = 24;
const UPLOAD_FOLDERS = ["checklist", "occurrences", "tires"] as const;
type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

function parsePositiveNumber(raw: string | undefined, fallback: number) {
  const parsed = raw ? Number(raw) : fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getRetentionDays() {
  return parsePositiveNumber(
    process.env.UPLOAD_CLEANUP_RETENTION_DAYS,
    DEFAULT_RETENTION_DAYS,
  );
}

function getCleanupIntervalHours() {
  return parsePositiveNumber(
    process.env.UPLOAD_CLEANUP_INTERVAL_HOURS,
    DEFAULT_INTERVAL_HOURS,
  );
}

function getUploadRoot() {
  return path.resolve(process.env.UPLOAD_PATH || "./uploads");
}

function buildUrlCandidates(folder: UploadFolder, filename: string) {
  const base = [
    `/api/files/${folder}/${filename}`,
    `/uploads/${folder}/${filename}`,
    `/${folder}/${filename}`,
    `${folder}/${filename}`,
  ];

  // Compatibilidade com registros antigos que guardaram só o nome do arquivo.
  if (folder === "checklist") {
    base.push(filename);
  }

  return base;
}

async function cleanupDatabaseReferences(
  deletedByFolder: Partial<Record<UploadFolder, string[]>>,
) {
  const deletedChecklist = deletedByFolder.checklist ?? [];
  const deletedOccurrences = deletedByFolder.occurrences ?? [];
  const deletedTires = deletedByFolder.tires ?? [];

  let checklistRefsRemoved = 0;
  let occurrenceRowsUpdated = 0;
  let tireEventRefsRemoved = 0;

  if (deletedChecklist.length > 0) {
    const checklistUrls = deletedChecklist.flatMap((name) =>
      buildUrlCandidates("checklist", name),
    );
    const deleted = await prisma.checklistPhoto.deleteMany({
      where: { photoUrl: { in: checklistUrls } },
    });
    checklistRefsRemoved = deleted.count;
  }

  if (deletedOccurrences.length > 0) {
    const occurrenceUrls = deletedOccurrences.flatMap((name) =>
      buildUrlCandidates("occurrences", name),
    );
    const affected = await prisma.occurrence.findMany({
      where: { photoUrls: { hasSome: occurrenceUrls } },
      select: { id: true, photoUrls: true },
    });

    for (const row of affected) {
      const nextPhotoUrls = row.photoUrls.filter((url) => !occurrenceUrls.includes(url));
      if (nextPhotoUrls.length === row.photoUrls.length) continue;

      await prisma.occurrence.update({
        where: { id: row.id },
        data: { photoUrls: nextPhotoUrls },
      });
      occurrenceRowsUpdated += 1;
    }
  }

  if (deletedTires.length > 0) {
    const tireUrls = deletedTires.flatMap((name) =>
      buildUrlCandidates("tires", name),
    );
    const updated = await prisma.tireEvent.updateMany({
      where: { photoUrl: { in: tireUrls } },
      data: { photoUrl: null },
    });
    tireEventRefsRemoved = updated.count;
  }

  return { checklistRefsRemoved, occurrenceRowsUpdated, tireEventRefsRemoved };
}

async function cleanupOldUploads() {
  const uploadRoot = getUploadRoot();
  const retentionDays = getRetentionDays();
  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(cutoffMs);

  let deletedCount = 0;
  let scannedCount = 0;
  const deletedByFolder: Partial<Record<UploadFolder, string[]>> = {};

  for (const folder of UPLOAD_FOLDERS) {
    const folderPath = path.resolve(uploadRoot, folder);

    if (!fs.existsSync(folderPath)) continue;

    const entries = await fs.promises.readdir(folderPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      scannedCount += 1;

      const filePath = path.resolve(folderPath, entry.name);
      let stats: fs.Stats;
      try {
        stats = await fs.promises.stat(filePath);
      } catch {
        continue;
      }

      const fileTime = stats.mtimeMs || stats.ctimeMs;
      if (fileTime > cutoffMs) continue;

      try {
        await fs.promises.unlink(filePath);
        deletedCount += 1;
        if (!deletedByFolder[folder]) deletedByFolder[folder] = [];
        deletedByFolder[folder]?.push(entry.name);
      } catch (error) {
        logger.warn("upload_cleanup_file_delete_failed", {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const {
    checklistRefsRemoved,
    occurrenceRowsUpdated,
    tireEventRefsRemoved,
  } = await cleanupDatabaseReferences(deletedByFolder);

  logger.info("upload_cleanup", {
    uploadRoot,
    retentionDays,
    cutoffDate: cutoffDate.toISOString(),
    scannedCount,
    deletedCount,
    checklistRefsRemoved,
    occurrenceRowsUpdated,
    tireEventRefsRemoved,
    ranAt: new Date().toISOString(),
  });
}

export function startUploadCleanupJob() {
  const intervalHours = getCleanupIntervalHours();
  const intervalMs = intervalHours * 60 * 60 * 1000;

  void cleanupOldUploads().catch((error) => {
    logger.error("upload_cleanup_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  setInterval(() => {
    void cleanupOldUploads().catch((error) => {
      logger.error("upload_cleanup_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }, intervalMs);

  logger.info("upload_cleanup_started", {
    intervalHours,
    retentionDays: getRetentionDays(),
    uploadRoot: getUploadRoot(),
  });
}
