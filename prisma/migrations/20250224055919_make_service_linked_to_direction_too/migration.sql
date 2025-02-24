-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "direction_id" TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_direction_id_fkey" FOREIGN KEY ("direction_id") REFERENCES "Direction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
