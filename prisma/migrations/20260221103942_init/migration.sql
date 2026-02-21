-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('POS', 'AIRTIME', 'BILLS', 'CARD_PAYMENT', 'SAVINGS', 'MONIEBOOK', 'KYC');

-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('POS', 'APP', 'USSD', 'WEB', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MerchantTier" AS ENUM ('STARTER', 'VERIFIED', 'PREMIUM');

-- CreateTable
CREATE TABLE "Event" (
    "event_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "event_timestamp" TIMESTAMP(3) NOT NULL,
    "product" "ProductType" NOT NULL,
    "event_type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "StatusType" NOT NULL,
    "channel" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "merchant_tier" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);
