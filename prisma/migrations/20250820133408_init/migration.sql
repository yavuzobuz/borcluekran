-- CreateTable
CREATE TABLE "borclu_bilgileri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "durum_tanitici" TEXT NOT NULL,
    "isim" TEXT,
    "borc_tutari" REAL,
    "telefon" TEXT,
    "adres" TEXT,
    "notlar" TEXT,
    "kayit_tarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "odeme_sozleri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "durum_tanitici" TEXT NOT NULL,
    "soz_tarihi" DATETIME NOT NULL,
    "soz_tutari" REAL NOT NULL,
    "aciklama" TEXT,
    "olusturma_tarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "odeme_sozleri_durum_tanitici_fkey" FOREIGN KEY ("durum_tanitici") REFERENCES "borclu_bilgileri" ("durum_tanitici") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "borclu_bilgileri_durum_tanitici_key" ON "borclu_bilgileri"("durum_tanitici");
