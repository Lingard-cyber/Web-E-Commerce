CREATE TYPE "FinancialEntryType" AS ENUM ('income', 'cost_of_goods', 'expense');

CREATE TYPE "FinancialPaymentMethod" AS ENUM ('cash', 'bank_transfer', 'qris', 'marketplace', 'other');

CREATE TABLE "catatan_keuangan" (
    "id" TEXT NOT NULL,
    "type" "FinancialEntryType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountIdr" INTEGER NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "FinancialPaymentMethod" NOT NULL,
    "evidenceUrl" TEXT,
    "umkmId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "catatan_keuangan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "catatan_keuangan_transactionDate_type_idx" ON "catatan_keuangan"("transactionDate", "type");
CREATE INDEX "catatan_keuangan_umkmId_transactionDate_idx" ON "catatan_keuangan"("umkmId", "transactionDate");

ALTER TABLE "catatan_keuangan"
ADD CONSTRAINT "catatan_keuangan_umkmId_fkey"
FOREIGN KEY ("umkmId") REFERENCES "umkm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
