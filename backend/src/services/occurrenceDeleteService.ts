import fs from "fs";
import path from "path";
import { extractFilenameFromStoredUrl } from "../lib/fileUrls";
import { prisma } from "../lib/prisma";

const uploadRoot = () => path.resolve(process.env.UPLOAD_PATH || "./uploads");

function tryUnlinkOccurrenceFile(photoUrl: string | null | undefined) {
  const filename = extractFilenameFromStoredUrl(photoUrl);
  if (!filename) return;

  const folders = ["occurrences", "checklist"];
  for (const folder of folders) {
    const filePath = path.join(uploadRoot(), folder, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return;
      }
    } catch {
      // ignora falha ao apagar arquivo órfão
    }
  }
}

export async function deleteOccurrenceById(id: string) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
  });

  if (!occurrence) return null;

  for (const photoUrl of occurrence.photoUrls ?? []) {
    tryUnlinkOccurrenceFile(photoUrl);
  }

  await prisma.$transaction([
    prisma.notification.updateMany({
      where: { occurrenceId: id },
      data: { occurrenceId: null },
    }),
    prisma.occurrence.delete({ where: { id } }),
  ]);

  return occurrence;
}
