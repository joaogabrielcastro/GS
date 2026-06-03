import rateLimit from "express-rate-limit";

const windowMs = 15 * 60 * 1000;
const maxAttempts = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 40;

/**
 * Limite só para tentativas de login **falhas** (senha errada).
 * Logins corretos não consomem a cota — evita 429 em uso normal.
 */
export const loginRateLimit = rateLimit({
  windowMs,
  max: Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 40,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message:
          "Muitas tentativas de login incorretas. Aguarde cerca de 15 minutos e tente novamente.",
      },
    });
  },
});
