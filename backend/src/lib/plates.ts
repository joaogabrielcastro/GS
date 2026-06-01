export function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
