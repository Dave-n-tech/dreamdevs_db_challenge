/*
  Warnings:

  - Changed the type of `event_type` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CARD_TRANSACTION', 'CASH_WITHDRAWAL', 'TRANSFER', 'AIRTIME_PURCHASE', 'DATA_PURCHASE', 'ELECTRICITY', 'CABLE_TV', 'INTERNET', 'WATER', 'BETTING', 'SUPPLIER_PAYMENT', 'INVOICE_PAYMENT', 'DEPOSIT', 'WITHDRAWAL', 'INTEREST_CREDIT', 'AUTO_SAVE', 'SALE_RECORDED', 'INVENTORY_UPDATE', 'EXPENSE_LOGGED', 'DOCUMENT_SUBMITTED', 'VERIFICATION_COMPLETED', 'TIER_UPGRADE');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "event_type",
ADD COLUMN     "event_type" "EventType" NOT NULL;
