import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authController = {
  // Registro de usuário
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, cpf, phone, role } = req.body;

      // Validação básica
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          cpf,
          phone,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({ message: 'Usuário criado com sucesso', user });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      res.json({
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
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não fornecido' });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Usuário inválido' });
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '1h' }
      );

      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ error: 'Refresh token inválido' });
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
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar perfil' });
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
          user!.password
        );

        if (!validPassword) {
          return res.status(400).json({ error: 'Senha atual incorreta' });
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

      res.json({ message: 'Perfil atualizado com sucesso', user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  },
};
