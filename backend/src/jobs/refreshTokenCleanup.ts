import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

const DEFAULT_INTERVAL_MINUTES = 60;

function getCleanupIntervalMinutes() {
  const raw = process.env.REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES;
  const parsed = raw ? Number(raw) : DEFAULT_INTERVAL_MINUTES;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_INTERVAL_MINUTES;
  return parsed;
}

async function cleanupExpiredRefreshTokens() {
  const now = new Date();
  const deleted = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  logger.info("refresh_token_cleanup", {
    deletedCount: deleted.count,
    ranAt: now.toISOString(),
  });
}

export function startRefreshTokenCleanupJob() {
  const intervalMinutes = getCleanupIntervalMinutes();
  const intervalMs = intervalMinutes * 60 * 1000;

  void cleanupExpiredRefreshTokens().catch((error) => {
    logger.error("refresh_token_cleanup_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  setInterval(() => {
    void cleanupExpiredRefreshTokens().catch((error) => {
      logger.error("refresh_token_cleanup_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }, intervalMs);

  logger.info("refresh_token_cleanup_started", {
    intervalMinutes,
  });
}
