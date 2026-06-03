import fs from "fs";
import path from "path";
import { extractFilenameFromStoredUrl } from "../lib/fileUrls";
import { prisma } from "../lib/prisma";

const uploadRoot = () => path.resolve(process.env.UPLOAD_PATH || "./uploads");

function tryUnlinkChecklistFile(photoUrl: string | null | undefined) {
  const filename = extractFilenameFromStoredUrl(photoUrl);
  if (!filename) return;
  const filePath = path.join(uploadRoot(), "checklist", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignora falha ao apagar arquivo órfão
  }
}

export async function deleteChecklistById(id: string) {
  const checklist = await prisma.dailyChecklist.findUnique({
    where: { id },
    include: { photos: { select: { photoUrl: true } } },
  });

  if (!checklist) return null;

  for (const photo of checklist.photos) {
    tryUnlinkChecklistFile(photo.photoUrl);
  }

  await prisma.dailyChecklist.delete({ where: { id } });
  return checklist;
}
