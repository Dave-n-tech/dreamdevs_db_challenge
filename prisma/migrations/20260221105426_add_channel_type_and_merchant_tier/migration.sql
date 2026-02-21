/*
  Warnings:

  - Changed the type of `channel` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `merchant_tier` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "channel",
ADD COLUMN     "channel" "ChannelType" NOT NULL,
DROP COLUMN "merchant_tier",
ADD COLUMN     "merchant_tier" "MerchantTier" NOT NULL;
