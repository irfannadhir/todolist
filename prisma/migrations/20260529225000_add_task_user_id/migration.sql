-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- AddForeignKey
ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
