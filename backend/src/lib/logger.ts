type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function write(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    write("info", message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    write("warn", message, meta);
  },
  error(message: string, meta?: LogMeta) {
    write("error", message, meta);
  },
};
