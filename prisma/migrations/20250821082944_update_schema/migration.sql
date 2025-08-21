/*
  Warnings:

  - You are about to drop the `odeme_sozleri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `adres` on the `borclu_bilgileri` table. All the data in the column will be lost.
  - You are about to drop the column `borc_tutari` on the `borclu_bilgileri` table. All the data in the column will be lost.
  - You are about to drop the column `isim` on the `borclu_bilgileri` table. All the data in the column will be lost.
  - You are about to drop the column `notlar` on the `borclu_bilgileri` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "odeme_sozleri";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_borclu_bilgileri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ilgili_tckn" TEXT,
    "avukat_atama_tarihi" TEXT,
    "durum" TEXT,
    "durum_tanitici" TEXT NOT NULL,
    "muhatap_tanimi" TEXT,
    "durum_tanimi" TEXT,
    "sozlesme_hesabi" TEXT,
    "tc_kimlik_no" TEXT,
    "vergi_no" TEXT,
    "icra_dosya_numarasi" TEXT,
    "icra_dairesi_tanimi" TEXT,
    "adres_bilgileri" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "telefon" TEXT,
    "telefon_abone_grubu" TEXT,
    "asil_alacak" REAL,
    "takip_cikis_miktari" REAL,
    "takip_oncesi_tahsilat" REAL,
    "takip_sonrasi_tahsilat" REAL,
    "toplam_acik_tutar" REAL,
    "guncel_borc" REAL,
    "itiraz_durumu" TEXT,
    "borclu_tipi_tanimi" TEXT,
    "hitam_tarihi" TEXT,
    "takip_tarihi" TEXT,
    "neden_tanimi" TEXT,
    "durum_turu" TEXT,
    "durum_turu_tanimi" TEXT,
    "tesisat_durumu" TEXT,
    "odeme_durumu" TEXT,
    "vekalet_ucreti" REAL,
    "neden" TEXT,
    "muhatap_tanimi_ek" TEXT,
    "uyap_durumu" TEXT,
    "telefon_tesisat" TEXT,
    "tesisat_durumu_tanimi" TEXT,
    "kayit_tarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" DATETIME NOT NULL
);
INSERT INTO "new_borclu_bilgileri" ("avukat_atama_tarihi", "durum_tanitici", "guncelleme_tarihi", "id", "ilgili_tckn", "kayit_tarihi", "muhatap_tanimi", "telefon") SELECT "avukat_atama_tarihi", "durum_tanitici", "guncelleme_tarihi", "id", "ilgili_tckn", "kayit_tarihi", "muhatap_tanimi", "telefon" FROM "borclu_bilgileri";
DROP TABLE "borclu_bilgileri";
ALTER TABLE "new_borclu_bilgileri" RENAME TO "borclu_bilgileri";
CREATE UNIQUE INDEX "borclu_bilgileri_durum_tanitici_key" ON "borclu_bilgileri"("durum_tanitici");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
