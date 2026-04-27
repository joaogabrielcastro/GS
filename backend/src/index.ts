import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Importar rotas
import authRoutes from "./routes/authRoutes";
import truckRoutes from "./routes/truckRoutes";
import tireRoutes from "./routes/tireRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import occurrenceRoutes from "./routes/occurrenceRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import fileRoutes from "./routes/fileRoutes";

// Importar middleware
import { errorHandler } from "./middleware/errorHandler";
import { occurrenceController } from "./controllers/occurrenceController";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./lib/logger";
import { errorResponseNormalizer } from "./middleware/errorResponse";
import { startRefreshTokenCleanupJob } from "./jobs/refreshTokenCleanup";
import { startUploadCleanupJob } from "./jobs/uploadCleanup";
import { successResponseWrapper } from "./middleware/successResponse";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Confiar em 1 nível de proxy (Railway, Heroku, etc.)
// Usar o número 1 em vez de `true` para evitar bypass de rate-limit.
app.set("trust proxy", 1);

// Configurar origens permitidas via env
const allowedOrigins: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

// Logar origens permitidas para facilitar depuração no deploy
if (allowedOrigins.length === 0) {
  logger.warn(
    "CORS: allowedOrigins vazio — apenas localhost e requisições sem origin serão aceitas unless CORS_ORIGIN configured",
  );
} else if (allowedOrigins.includes("*")) {
  logger.warn(
    "CORS: wildcard '*' ativo — aceitando todas as origens (reflete Origin no header)",
  );
} else {
  logger.info("CORS: allowed origins", { allowedOrigins });
}
const httpServer = createServer(app);

function isOriginAllowed(origin?: string) {
  if (!origin) return true; // aceitar requisições sem origin (curl, mobile, etc)
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:")
  )
    return true;
  // Se estiver configurado '*', permitir todas as origens.
  if (allowedOrigins.includes("*")) return true;
  if (allowedOrigins.includes(origin)) return true;
  return false;
}

// Configurar Socket.IO para notificações em tempo real
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      logger.warn("CORS denied for socket origin", { origin });
      return callback(null, false);
    },
    credentials: true,
  },
});

// Passar Socket.IO para o controller de ocorrências
occurrenceController.setSocketIO(io);

// Middleware de segurança
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS - aceitar qualquer porta localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      logger.warn("CORS denied for origin", { origin });
      return callback(null, false);
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: "Muitas requisições deste IP, tente novamente mais tarde.",
});

app.use("/api/", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(errorResponseNormalizer);
app.use(successResponseWrapper);

// Rotas
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.send("API Transportadora rodando 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/tires", tireRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/occurrences", occurrenceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/files", fileRoutes);

// Socket.IO - Gerenciamento de conexões
io.on("connection", (socket) => {
  logger.info("Socket client connected", { socketId: socket.id });

  // Usuário se junta à sua "sala" pessoal para notificações
  socket.on("join", (userId: string) => {
    socket.join(`user_${userId}`);
    logger.info("User joined socket room", { userId, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    logger.info("Socket client disconnected", { socketId: socket.id });
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info("Servidor iniciado", {
    port: PORT,
    apiUrl: `http://localhost:${PORT}/api`,
    env: process.env.NODE_ENV || "development",
  });
  startRefreshTokenCleanupJob();
  startUploadCleanupJob();
});

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, _promise) => {
  logger.error("Unhandled Rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

export { io };
