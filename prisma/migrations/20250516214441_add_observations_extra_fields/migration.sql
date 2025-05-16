-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "extra_fields" JSONB,
ADD COLUMN     "observations" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notifiable_id" TEXT NOT NULL,
    "notifiable_type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_notifiable_id_notifiable_type_idx" ON "Notification"("notifiable_id", "notifiable_type");
