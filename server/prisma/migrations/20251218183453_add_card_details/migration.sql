-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'low';
