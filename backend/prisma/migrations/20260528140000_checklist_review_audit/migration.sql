-- AlterTable
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
ALTER TABLE "daily_checklists" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_checklists_reviewedById_fkey'
  ) THEN
    ALTER TABLE "daily_checklists" ADD CONSTRAINT "daily_checklists_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
