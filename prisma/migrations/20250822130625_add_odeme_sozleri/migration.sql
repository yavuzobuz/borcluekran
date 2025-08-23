-- CreateTable
CREATE TABLE "odeme_sozleri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "borclu_id" INTEGER NOT NULL,
    "tarih" DATETIME NOT NULL,
    "aciklama" TEXT NOT NULL,
    "odeme_miktari" REAL,
    "durum" TEXT NOT NULL DEFAULT 'Aktif',
    "olusturma_tarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" DATETIME NOT NULL,
    CONSTRAINT "odeme_sozleri_borclu_id_fkey" FOREIGN KEY ("borclu_id") REFERENCES "borclu_bilgileri" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
