/*
  Warnings:

  - You are about to drop the column `department_id` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `direction_id` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `Request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_department_id_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_direction_id_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_service_id_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "department_id",
DROP COLUMN "direction_id",
DROP COLUMN "service_id",
ADD COLUMN     "destination_department_id" TEXT,
ADD COLUMN     "destination_direction_id" TEXT,
ADD COLUMN     "destination_repartition_id" TEXT,
ADD COLUMN     "destination_sector_id" TEXT,
ADD COLUMN     "destination_service_id" TEXT,
ADD COLUMN     "requester_department_id" TEXT,
ADD COLUMN     "requester_direction_id" TEXT,
ADD COLUMN     "requester_name" TEXT,
ADD COLUMN     "requester_repartition_id" TEXT,
ADD COLUMN     "requester_sector_id" TEXT,
ADD COLUMN     "requester_service_id" TEXT,
ALTER COLUMN "requester_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requester_direction_id_fkey" FOREIGN KEY ("requester_direction_id") REFERENCES "Direction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requester_department_id_fkey" FOREIGN KEY ("requester_department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requester_service_id_fkey" FOREIGN KEY ("requester_service_id") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requester_sector_id_fkey" FOREIGN KEY ("requester_sector_id") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requester_repartition_id_fkey" FOREIGN KEY ("requester_repartition_id") REFERENCES "Repartition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_destination_direction_id_fkey" FOREIGN KEY ("destination_direction_id") REFERENCES "Direction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_destination_department_id_fkey" FOREIGN KEY ("destination_department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_destination_service_id_fkey" FOREIGN KEY ("destination_service_id") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_destination_sector_id_fkey" FOREIGN KEY ("destination_sector_id") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_destination_repartition_id_fkey" FOREIGN KEY ("destination_repartition_id") REFERENCES "Repartition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
