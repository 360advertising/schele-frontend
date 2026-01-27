/*
  Warnings:

  - Made the column `startDate` on table `contracts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "supplierAddress" TEXT,
ADD COLUMN     "supplierBankAccount" TEXT,
ADD COLUMN     "supplierBankName" TEXT,
ADD COLUMN     "supplierEmail" TEXT,
ADD COLUMN     "supplierName" TEXT NOT NULL DEFAULT 'A.D. SCHELE',
ADD COLUMN     "supplierPhone" TEXT,
ADD COLUMN     "supplierTaxId" TEXT,
ADD COLUMN     "terms" TEXT,
ALTER COLUMN "startDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "contracts_clientId_idx" ON "contracts"("clientId");

-- CreateIndex
CREATE INDEX "contracts_deletedAt_idx" ON "contracts"("deletedAt");

-- CreateIndex
CREATE INDEX "contracts_contractDate_idx" ON "contracts"("contractDate");
