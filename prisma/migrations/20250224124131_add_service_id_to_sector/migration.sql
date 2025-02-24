/*
  Warnings:

  - A unique constraint covering the columns `[department_id,service_id]` on the table `Sector` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_department_id_fkey";

-- AlterTable
ALTER TABLE "Sector" ADD COLUMN     "service_id" TEXT,
ALTER COLUMN "department_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sector_department_id_service_id_key" ON "Sector"("department_id", "service_id");

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
