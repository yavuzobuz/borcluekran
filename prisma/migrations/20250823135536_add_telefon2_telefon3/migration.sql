/*
  Warnings:

  - You are about to drop the `WhatsAppMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "borclu_bilgileri" ADD COLUMN "telefon_2" TEXT;
ALTER TABLE "borclu_bilgileri" ADD COLUMN "telefon_3" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WhatsAppMessage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "durum_tanitici" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" DATETIME,
    "delivered_at" DATETIME,
    "read_at" DATETIME,
    "error_message" TEXT,
    "message_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "whatsapp_messages_durum_tanitici_idx" ON "whatsapp_messages"("durum_tanitici");

-- CreateIndex
CREATE INDEX "whatsapp_messages_phone_number_idx" ON "whatsapp_messages"("phone_number");

-- CreateIndex
CREATE INDEX "whatsapp_messages_status_idx" ON "whatsapp_messages"("status");

-- CreateIndex
CREATE INDEX "whatsapp_messages_created_at_idx" ON "whatsapp_messages"("created_at");
