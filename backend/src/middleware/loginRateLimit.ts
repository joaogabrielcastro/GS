import rateLimit from "express-rate-limit";

/** Proteção contra brute-force no login (por IP). */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Muitas tentativas de login. Aguarde alguns minutos." },
  },
});
