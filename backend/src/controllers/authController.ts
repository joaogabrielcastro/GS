import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// ─── Helper interno — cria usuário com role controlada ────────────────────────
async function createUserInternal(data: {
  email: string;
  password: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: string;
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
      role: data.role as any,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export const authController = {
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
    } catch (error: any) {
      if (error.statusCode === 409)
        return res.status(409).json({ error: error.message });
      console.error("Erro no registro:", error);
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
        role,
      });
      return res
        .status(201)
        .json({ message: "Usuário criado com sucesso", user });
    } catch (error: any) {
      if (error.statusCode === 409)
        return res.status(409).json({ error: error.message });
      console.error(error);
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
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as any },
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        {
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
        },
      );

      return res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token não fornecido" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: "Usuário inválido" });
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as any },
      );

      return res.json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }
  },

  // Obter perfil do usuário logado
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

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
      const userId = (req as any).user.id;
      const { name, phone, currentPassword, newPassword } = req.body;

      const updateData: any = {};

      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      // Se quiser mudar a senha
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
      const where: any = {};
      if (role) where.role = role as any;

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
