import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { buildPrivateFileUrl } from "../lib/storage";
import { logger } from "../lib/logger";

type ChecklistPhotoInput = {
  category: string;
  axleNumber?: number | string | null;
  side?: string | null;
  photoUrl: string;
  notes?: string | null;
};

export const checklistController = {
  // Criar checklist diário
  async create(req: Request, res: Response) {
    try {
      const driverId = req.user?.id;
      if (!driverId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
      const {
        truckId,
        cabinPhotoUrl,
        tiresPhotoUrl,
        canvasPhotoUrl,
        overallCondition,
        tiresCondition,
        cabinCondition,
        canvasCondition,
        notes,
        location,
        latitude,
        longitude,
        // Array of {category, axleNumber?, side?, photoUrl, notes?}
        checklistPhotos,
      } = req.body;

      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        return res.status(404).json({ error: "Caminhão não encontrado" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingChecklist = await prisma.dailyChecklist.findFirst({
        where: {
          truckId,
          driverId,
          date: { gte: today },
        },
      });

      if (existingChecklist) {
        return res.status(409).json({
          error: "Checklist já foi preenchido hoje para este caminhão",
        });
      }

      // Parse checklistPhotos if it came as a JSON string
      let photos: ChecklistPhotoInput[] = [];
      if (checklistPhotos) {
        try {
            photos = (
              typeof checklistPhotos === "string"
                ? JSON.parse(checklistPhotos)
                : checklistPhotos
            ) as ChecklistPhotoInput[];
        } catch {
          photos = [];
        }
      }

      // Add legacy single photos as ChecklistPhoto records too
      if (cabinPhotoUrl)
        photos.push({ category: "CABINE", photoUrl: cabinPhotoUrl });
      if (tiresPhotoUrl)
        photos.push({ category: "PNEU", photoUrl: tiresPhotoUrl });
      if (canvasPhotoUrl)
        photos.push({ category: "LONA", photoUrl: canvasPhotoUrl });

      const checklist = await prisma.dailyChecklist.create({
        data: {
          truckId,
          driverId,
          overallCondition,
          tiresCondition,
          cabinCondition,
          canvasCondition,
          notes,
          location,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          photos:
            photos.length > 0
              ? {
                  createMany: {
                    data: photos.map((p) => ({
                      category: p.category,
                      axleNumber: p.axleNumber ? parseInt(String(p.axleNumber), 10) : null,
                      side: p.side || null,
                      photoUrl: p.photoUrl,
                      notes: p.notes || null,
                    })),
                  },
                }
              : undefined,
        },
        include: { photos: true },
      });

      const hasIssues =
        tiresCondition === "RUIM" ||
        cabinCondition === "RUIM" ||
        canvasCondition === "RASGADO" ||
        overallCondition === "RUIM";

      if (hasIssues) {
        const admins = await prisma.user.findMany({
          where: { role: "ADMINISTRADOR" },
        });

        const notification = await prisma.notification.create({
          data: {
            title: "Alerta de Checklist ⚠️",
            message: `Problemas reportados no caminhão ${truck.plate} pelo motorista.`,
          },
        });

        await prisma.notificationUser.createMany({
          data: admins.map((admin) => ({
            notificationId: notification.id,
            userId: admin.id,
          })),
        });
      }

      return res.status(201).json({
        message: "Checklist criado com sucesso",
        checklist,
      });
    } catch (error) {
      logger.error("Erro ao criar checklist", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao criar checklist" });
    }
  },

  // Listar checklists
  async list(req: Request, res: Response) {
    try {
      const {
        truckId,
        driverId,
        startDate,
        endDate,
        page = "1",
        limit = "10",
      } = req.query;
      const truckIdValue = typeof truckId === "string" ? truckId : undefined;
      const driverIdValue = typeof driverId === "string" ? driverId : undefined;
      const userRole = req.user?.role;
      const userId = req.user?.id;
      if (!userRole || !userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
      const parsedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const parsedLimit = Math.min(
        Math.max(parseInt(limit as string, 10) || 10, 1),
        100,
      );
      const skip = (parsedPage - 1) * parsedLimit;

      const where: Prisma.DailyChecklistWhereInput = {};

      // Motorista só vê seus próprios checklists
      if (userRole === "MOTORISTA") {
        where.driverId = userId;
      } else {
        if (driverIdValue) where.driverId = driverIdValue;
      }

      if (truckIdValue) where.truckId = truckIdValue;

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const [total, checklists] = await Promise.all([
        prisma.dailyChecklist.count({ where }),
        prisma.dailyChecklist.findMany({
          where,
          include: {
            truck: {
              select: {
                id: true,
                plate: true,
                model: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            photos: {
              orderBy: { axleNumber: "asc" },
            },
          },
          orderBy: { date: "desc" },
          skip,
          take: parsedLimit,
        }),
      ]);

      return res.json({
        data: checklists,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar checklists" });
    }
  },

  // Buscar checklist por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const checklist = await prisma.dailyChecklist.findUnique({
        where: { id },
        include: {
          truck: {
            include: { currentDriver: { select: { id: true, name: true } } },
          },
          driver: {
            select: { id: true, name: true, email: true, phone: true },
          },
          photos: { orderBy: { axleNumber: "asc" } },
        },
      });

      if (!checklist) {
        return res.status(404).json({ error: "Checklist não encontrado" });
      }

      return res.json(checklist);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar checklist" });
    }
  },

  // Upload de fotos do checklist (aceita qualquer campo: cabinPhoto, axle_1_esq, axle_2_dir, etc)
  async uploadPhotos(req: Request, res: Response) {
    try {
      // upload.any() gives req.files as an array
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.json({ message: "Nenhuma foto enviada", photoUrls: {} });
      }

      const photoUrls: Record<string, string> = {};

      for (const file of files) {
        photoUrls[file.fieldname] = buildPrivateFileUrl(
          "checklist",
          file.filename,
        );
      }

      return res.json({ message: "Fotos enviadas com sucesso", photoUrls });
    } catch (error) {
      logger.error("Erro no upload de checklist", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao fazer upload das fotos" });
    }
  },
};
