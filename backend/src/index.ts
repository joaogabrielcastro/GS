import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import path from "path";

// Importar rotas
import authRoutes from "./routes/authRoutes";
import truckRoutes from "./routes/truckRoutes";
import tireRoutes from "./routes/tireRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import occurrenceRoutes from "./routes/occurrenceRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import notificationRoutes from "./routes/notificationRoutes";

// Importar middleware
import { errorHandler } from "./middleware/errorHandler";
import { occurrenceController } from "./controllers/occurrenceController";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Confiar no proxy (necessário quando o deploy passa cabeçalhos X-Forwarded-For)
// Plataformas como Railway, Heroku, Vercel, etc. setam esse header.
// Isso permite que express-rate-limit identifique corretamente o IP do cliente.
app.set("trust proxy", true);

// Configurar origens permitidas via env
const allowedOrigins: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

// Logar origens permitidas para facilitar depuração no deploy
if (allowedOrigins.length === 0) {
  console.log(
    "CORS: allowedOrigins vazio — apenas localhost e requisições sem origin serão aceitas unless CORS_ORIGIN configured",
  );
} else if (allowedOrigins.includes("*")) {
  console.log(
    "CORS: wildcard '*' ativo — aceitando todas as origens (reflete Origin no header)",
  );
} else {
  console.log("CORS: allowed origins:", allowedOrigins);
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
      console.warn(`CORS denied for origin: ${origin}`);
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
      console.warn(`CORS denied for origin: ${origin}`);
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

// Servir arquivos estáticos (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

// Socket.IO - Gerenciamento de conexões
io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  // Usuário se junta à sua "sala" pessoal para notificações
  socket.on("join", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`Usuário ${userId} entrou na sala`);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO pronto para conexões`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`💚 Ambiente: ${process.env.NODE_ENV || "development"}`);
});

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

export { io };
