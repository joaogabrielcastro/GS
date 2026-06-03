import fs from "fs";
import path from "path";
import { logger } from "./logger";

const COOLIFY_COMMON_MOUNTS = ["/data/uploads", "/data/gs/uploads"];

function countFilesInDir(dir: string): number {
  if (!fs.existsSync(dir)) return -1;
  try {
    return fs.readdirSync(dir).filter((f) => {
      try {
        return fs.statSync(path.join(dir, f)).isFile();
      } catch {
        return false;
      }
    }).length;
  } catch {
    return -1;
  }
}

/** Alerta quando o volume do Coolify não coincide com UPLOAD_PATH. */
export function logUploadPathDiagnostics() {
  const uploadPath = path.resolve(process.env.UPLOAD_PATH || "./uploads");
  const checklistDir = path.join(uploadPath, "checklist");
  const checklistCount = countFilesInDir(checklistDir);

  logger.info("upload_path_config", {
    UPLOAD_PATH: uploadPath,
    checklistFiles: checklistCount >= 0 ? checklistCount : "pasta inexistente",
    UPLOAD_CLEANUP_ENABLED: process.env.UPLOAD_CLEANUP_ENABLED ?? "(padrão prod: false)",
  });

  if (process.env.NODE_ENV !== "production") return;

  const isRelativeDefault =
    !process.env.UPLOAD_PATH || process.env.UPLOAD_PATH.startsWith("./");

  if (isRelativeDefault) {
    logger.error("upload_path_misconfigured", {
      UPLOAD_PATH: uploadPath,
      problem:
        "Sem UPLOAD_PATH absoluto, fotos vão para ./uploads dentro do container (NÃO usa o volume em /data/uploads).",
      fix: "No Coolify: Environment → UPLOAD_PATH=/data/uploads (igual ao Destination Path do volume).",
    });
    return;
  }

  if (uploadPath !== path.resolve("/data/uploads")) {
    for (const mount of COOLIFY_COMMON_MOUNTS) {
      if (path.resolve(mount) === uploadPath) continue;
      const mountChecklist = path.join(mount, "checklist");
      const mountCount = countFilesInDir(mountChecklist);
      if (mountCount > 0 && checklistCount === 0) {
        logger.error("upload_path_volume_mismatch", {
          UPLOAD_PATH: uploadPath,
          volumeWithFiles: mountChecklist,
          filesOnVolume: mountCount,
          hint: `Há fotos em ${mount} mas a API lê ${checklistDir}. Defina UPLOAD_PATH=${mount} ou mude o Destination Path do volume.`,
        });
      }
    }
  }

  const ephemeralChecklist = path.resolve("./uploads/checklist");
  const ephemeralCount = countFilesInDir(ephemeralChecklist);
  if (
    ephemeralCount > 0 &&
    path.resolve("./uploads") !== uploadPath &&
    checklistCount === 0
  ) {
    logger.warn("upload_path_ephemeral_files_found", {
      ephemeralDir: ephemeralChecklist,
      ephemeralFiles: ephemeralCount,
      UPLOAD_PATH: uploadPath,
      hint: "Fotos antigas podem estar em ./uploads (sem volume). Copie para UPLOAD_PATH/checklist ou reenvie checklists.",
    });
  }
}
