import jwt from "jsonwebtoken";
import type { Server, Socket } from "socket.io";

export type AuthenticatedSocket = Socket & {
  data: {
    userId?: string;
    role?: string;
  };
};

export function attachSocketAuth(io: Server) {
  io.use((socket, next) => {
    const authToken =
      (socket.handshake.auth?.token as string | undefined) ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!authToken) {
      return next(new Error("Não autenticado"));
    }

    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      return next();
    } catch {
      return next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    socket.join(`user_${userId}`);
  });
}
