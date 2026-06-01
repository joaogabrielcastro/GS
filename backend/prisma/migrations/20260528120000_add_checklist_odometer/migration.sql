-- Hodômetro no checklist (idempotente se a coluna já existir via db push)
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "odometer" INTEGER;
