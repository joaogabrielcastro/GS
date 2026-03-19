import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

type JwtExpiresIn = NonNullable<jwt.SignOptions["expiresIn"]>;
type StatusError = Error & { statusCode?: number };

// ─── Helper interno — cria usuário com role controlada ────────────────────────
async function createUserInternal(data: {
  email: string;
  password: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser)
    throw Object.assign(new Error("Email já cadastrado"), { statusCode: 409 });

  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      role: data.role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export const authController = {
  refreshCookieName: "refreshToken",
  maxActiveRefreshTokensPerUser: 5,

  getCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ("strict" as const) : ("lax" as const),
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  },

  hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  createAccessToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as JwtExpiresIn },
    );
  },

  createRefreshToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as JwtExpiresIn,
    });
  },

  getTokenExpiryDate(token: string) {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    return decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  },

  async cleanupExpiredRefreshTokens() {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },

  async pruneRefreshTokensForUser(userId: string) {
    const activeTokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (activeTokens.length <= authController.maxActiveRefreshTokensPerUser) return;

    const tokenIdsToRevoke = activeTokens
      .slice(authController.maxActiveRefreshTokensPerUser)
      .map((token) => token.id);

    await prisma.refreshToken.updateMany({
      where: { id: { in: tokenIdsToRevoke } },
      data: { revokedAt: new Date() },
    });
  },

  // Registro público — role sempre MOTORISTA (segurança)
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, cpf, phone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }
      const user = await createUserInternal({
        email,
        password,
        name,
        cpf,
        phone,
        role: "MOTORISTA",
      });
      return res
        .status(201)
        .json({ message: "Usuário criado com sucesso", user });
    } catch (error: unknown) {
      const typedError = error as StatusError;
      if (typedError.statusCode === 409)
        return res.status(409).json({ error: typedError.message });
      logger.error("Erro no registro", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  },

  // Criar usuário (Admin) — aceita qualquer role
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, name, cpf, phone, role } = req.body;
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }
      const user = await createUserInternal({
        email,
        password,
        name,
        cpf,
        phone,
        role: role as UserRole,
      });
      return res
        .status(201)
        .json({ message: "Usuário criado com sucesso", user });
    } catch (error: unknown) {
      const typedError = error as StatusError;
      if (typedError.statusCode === 409)
        return res.status(409).json({ error: typedError.message });
      logger.error("Erro ao criar usuário admin", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  },
  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email e senha são obrigatórios" });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Gerar tokens
      const token = authController.createAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = authController.createRefreshToken(user.id);
      const expiresAt = authController.getTokenExpiryDate(refreshToken);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: authController.hashToken(refreshToken),
          expiresAt,
        },
      });
      await authController.cleanupExpiredRefreshTokens();
      await authController.pruneRefreshTokensForUser(user.id);

      res.cookie(
        authController.refreshCookieName,
        refreshToken,
        authController.getCookieOptions(),
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Erro no login", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.[authController.refreshCookieName];

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token não fornecido" });
      }

      const currentTokenHash = authController.hashToken(refreshToken);
      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: currentTokenHash },
      });

      if (storedToken?.revokedAt) {
        await prisma.refreshToken.updateMany({
          where: {
            userId: storedToken.userId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
        res.clearCookie(
          authController.refreshCookieName,
          authController.getCookieOptions(),
        );
        return res.status(401).json({ error: "Sessão inválida. Faça login novamente." });
      }

      let decoded: { id: string };
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
          id: string;
        };
      } catch (_error) {
        if (storedToken) {
          await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
          });
        }
        res.clearCookie(
          authController.refreshCookieName,
          authController.getCookieOptions(),
        );
        return res.status(401).json({ error: "Refresh token inválido" });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: "Usuário inválido" });
      }

      if (
        !storedToken ||
        storedToken.userId !== user.id ||
        storedToken.revokedAt ||
        storedToken.expiresAt < new Date()
      ) {
        return res.status(401).json({ error: "Refresh token inválido" });
      }

      const newToken = authController.createAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = authController.createRefreshToken(user.id);
      const newExpiresAt = authController.getTokenExpiryDate(newRefreshToken);

      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        }),
        prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash: authController.hashToken(newRefreshToken),
            expiresAt: newExpiresAt,
          },
        }),
      ]);

      res.cookie(
        authController.refreshCookieName,
        newRefreshToken,
        authController.getCookieOptions(),
      );

      await authController.cleanupExpiredRefreshTokens();
      await authController.pruneRefreshTokensForUser(user.id);

      return res.json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }
  },

  // Logout com revogação do refresh token atual
  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.[authController.refreshCookieName];
      const userId = req.user?.id;

      if (userId) {
        await prisma.refreshToken.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }

      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: {
            tokenHash: authController.hashToken(refreshToken),
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }
      await authController.cleanupExpiredRefreshTokens();

      res.clearCookie(
        authController.refreshCookieName,
        authController.getCookieOptions(),
      );
      return res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao fazer logout" });
    }
  },

  // Obter perfil do usuário logado
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          cpf: true,
          phone: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  },

  // Atualizar perfil
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
      const { name, phone, currentPassword, newPassword } = req.body;

      const updateData: Prisma.UserUpdateInput = {};

      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      // Se quiser mudar a senha
      if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
        return res.status(400).json({
          error: "Informe senha atual e nova senha para alterar a senha",
        });
      }

      if (currentPassword && newPassword) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        const validPassword = await bcrypt.compare(
          currentPassword,
          user!.password,
        );

        if (!validPassword) {
          return res.status(400).json({ error: "Senha atual incorreta" });
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      return res.json({
        message: "Perfil atualizado com sucesso",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  },

  // Listar usuários (Admin)
  async list(req: Request, res: Response) {
    try {
      const { role } = req.query;
      const where: Prisma.UserWhereInput = {};
      if (role) where.role = role as UserRole;

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          phone: true,
          cpf: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar usuários" });
    }
  },
};
