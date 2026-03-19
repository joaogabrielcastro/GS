export type FileCategory = "checklist" | "occurrences" | "tires";

// Centraliza o formato das URLs para permitir migração futura
// para storage externo (S3/R2) sem alterar controllers.
export function buildPrivateFileUrl(category: FileCategory, filename: string) {
  return `/api/files/${category}/${filename}`;
}
