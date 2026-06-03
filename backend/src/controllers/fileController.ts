import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { buildStoredFileUrlCandidates } from "../lib/fileUrls";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

const uploadRoot = path.resolve(process.env.UPLOAD_PATH || "./uploads");

const categoryToFolder: Record<string, string> = {
  checklist: "checklist",
  occurrences: "occurrences",
  tires: "tires",
};

async function canAccessChecklistFile(userId: string, role: string, filename: string) {
  if (role === "ADMINISTRADOR" || role === "FINANCEIRO") return true;
  const safeFilename = path.basename(filename);
  const urlCandidates = buildStoredFileUrlCandidates("checklist", safeFilename);
  const photo = await prisma.checklistPhoto.findFirst({
    where: {
      OR: [
        { photoUrl: { in: urlCandidates } },
        { photoUrl: { endsWith: safeFilename } },
      ],
      checklist: { driverId: userId },
    },
    select: { id: true },
  });
  return Boolean(photo);
}

async function canAccessOccurrenceFile(userId: string, role: string, filename: string) {
  if (role === "ADMINISTRADOR" || role === "FINANCEIRO") return true;
  const occ = await prisma.occurrence.findFirst({
    where: {
      photoUrls: { has: `/api/files/occurrences/${filename}` },
      driverId: userId,
    },
    select: { id: true },
  });
  if (occ) return true;
  // Compatibilidade com URLs antigas /uploads/occurrences/*
  const occLegacy = await prisma.occurrence.findFirst({
    where: {
      photoUrls: { has: `/uploads/occurrences/${filename}` },
      driverId: userId,
    },
    select: { id: true },
  });
  return Boolean(occLegacy);
}

export const fileController = {
  async getPrivateFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const { category, filename } = req.params;

      if (!userId || !role) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const folder = categoryToFolder[category];
      if (!folder) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }

      let allowed = false;
      if (category === "checklist") {
        allowed = await canAccessChecklistFile(userId, role, filename);
      } else if (category === "occurrences") {
        allowed = await canAccessOccurrenceFile(userId, role, filename);
      } else {
        allowed = role === "ADMINISTRADOR";
      }

      if (!allowed) {
        return res.status(403).json({ error: "Acesso negado ao arquivo" });
      }

      const safeFilename = path.basename(filename);
      const target = path.resolve(uploadRoot, folder, safeFilename);

      if (!target.startsWith(path.resolve(uploadRoot, folder))) {
        return res.status(400).json({ error: "Caminho de arquivo inválido" });
      }

      const resolveExistingPath = (): string | null => {
        if (fs.existsSync(target)) return target;
        if (category === "occurrences") {
          const legacyTarget = path.resolve(uploadRoot, "checklist", safeFilename);
          if (fs.existsSync(legacyTarget)) return legacyTarget;
        }
        return null;
      };

      const existingPath = resolveExistingPath();
      if (!existingPath) {
        logger.warn("private_file_missing", {
          category,
          filename: safeFilename,
          expectedPath: target,
          uploadRoot,
          hint:
            "Arquivo ausente no disco. Redeploy sem volume em UPLOAD_PATH apaga fotos; use backup da pasta uploads.",
        });
        return res.status(404).json({
          error: "Arquivo não encontrado no servidor",
          code: "FILE_MISSING_ON_DISK",
          filename: safeFilename,
        });
      }

      return res.sendFile(existingPath);

    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar arquivo" });
    }
  },
};
