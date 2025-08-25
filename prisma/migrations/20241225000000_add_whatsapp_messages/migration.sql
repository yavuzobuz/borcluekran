-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "durumTanitici" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "errorMessage" TEXT,
    "messageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppMessage_durumTanitici_idx" ON "WhatsAppMessage"("durumTanitici");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_phoneNumber_idx" ON "WhatsAppMessage"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_status_idx" ON "WhatsAppMessage"("status");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_createdAt_idx" ON "WhatsAppMessage"("createdAt");