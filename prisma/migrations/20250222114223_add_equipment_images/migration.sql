-- CreateTable
CREATE TABLE "equipment_images" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "equipment_images" ADD CONSTRAINT "equipment_images_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
