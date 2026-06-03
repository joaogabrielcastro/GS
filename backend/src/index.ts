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
import { logUploadPathDiagnostics } from "./lib/uploadPathDiagnostics";
import { successResponseWrapper } from "./middleware/successResponse";
import { attachSocketAuth } from "./lib/socketAuth";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const uploadPath = process.env.UPLOAD_PATH || "./uploads";

if (process.env.NODE_ENV === "production" && uploadPath.startsWith("./")) {
  logger.warn("UPLOAD_PATH parece não persistente em produção", {
    uploadPath,
    recommendation:
      "Use um volume persistente e configure UPLOAD_PATH para um caminho absoluto, ex: /data/transportadora/uploads",
  });
}

// Proxy reverso (Coolify, etc.): padrão 1 hop. TRUST_PROXY=true confia em toda a cadeia (só se necessário).
const trustProxyEnv = process.env.TRUST_PROXY?.trim();
const trustProxy: boolean | number =
  trustProxyEnv === "true"
    ? true
    : trustProxyEnv && !Number.isNaN(Number(trustProxyEnv))
      ? Number(trustProxyEnv)
      : 1;
app.set("trust proxy", trustProxy);

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

attachSocketAuth(io);

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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(errorResponseNormalizer);
app.use(successResponseWrapper);

// Health fora do rate limit (evita healthcheck do painel consumindo cota e falhas em rajada)
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Rate limiting (não aplicar em /api/health — já declarada acima)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // hard refresh + SPA dispara várias chamadas; 100 era fácil estourar em uso real
  message: "Muitas requisições deste IP, tente novamente mais tarde.",
});

app.use("/api/", limiter);

// Rotas
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

io.on("connection", (socket) => {
  logger.info("Socket client connected", {
    socketId: socket.id,
    userId: socket.data.userId,
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
  logUploadPathDiagnostics();
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
