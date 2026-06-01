-- Execute no PostgreSQL de produção se /api/dashboard/admin-stats ou /api/checklists retornam 500
-- após deploy do commit d240b65+ (rodar preferencialmente: npx prisma migrate deploy)

ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "odometer" INTEGER;
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_checklists_reviewedById_fkey'
  ) THEN
    ALTER TABLE "daily_checklists"
      ADD CONSTRAINT "daily_checklists_reviewedById_fkey"
      FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
