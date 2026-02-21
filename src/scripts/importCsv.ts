import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";

import {
  Prisma,
  ProductType,
  StatusType,
  ChannelType,
  MerchantTier,
  EventType,
} from "../generated/prisma/client";
import prisma from "../config/prisma";

type RawRecord = {
  event_id: string;
  merchant_id: string;
  event_timestamp: string;
  product: string;
  event_type: string;
  amount: string;
  status: string;
  channel: string;
  region: string;
  merchant_tier: string;
};

const productValues = new Set([
  "POS",
  "AIRTIME",
  "BILLS",
  "CARD_PAYMENT",
  "SAVINGS",
  "MONIEBOOK",
  "KYC",
]);

const statusValues = new Set(["SUCCESS", "FAILED", "PENDING"]);
const channelValues = new Set(["POS", "APP", "USSD", "WEB", "OFFLINE"]);
const merchantTierValues = new Set(["STARTER", "VERIFIED", "PREMIUM"]);

const VALID_EVENT_TYPES: Record<string, Set<string>> = {
  POS: new Set(["CARD_TRANSACTION", "CASH_WITHDRAWAL", "TRANSFER"]),
  AIRTIME: new Set(["AIRTIME_PURCHASE", "DATA_PURCHASE"]),
  BILLS: new Set(["ELECTRICITY", "CABLE_TV", "INTERNET", "WATER", "BETTING"]),
  CARD_PAYMENT: new Set(["SUPPLIER_PAYMENT", "INVOICE_PAYMENT"]),
  SAVINGS: new Set(["DEPOSIT", "WITHDRAWAL", "INTEREST_CREDIT", "AUTO_SAVE"]),
  MONIEBOOK: new Set(["SALE_RECORDED", "INVENTORY_UPDATE", "EXPENSE_LOGGED"]),
  KYC: new Set(["DOCUMENT_SUBMITTED", "VERIFICATION_COMPLETED", "TIER_UPGRADE"]),
};

const BATCH_SIZE = 900;
const DATA_DIR = path.resolve(process.cwd(), "data");

const toEventInput = (
  record: RawRecord,
): Prisma.EventCreateManyInput | null => {
  if (!record.event_id || !record.merchant_id) {
    return null;
  }

  if (!productValues.has(record.product)) {
    return null;
  }

  if (!statusValues.has(record.status)) {
    return null;
  }

  if (!channelValues.has(record.channel)) {
    return null;
  }

  if (!merchantTierValues.has(record.merchant_tier)) {
    return null;
  }

  // Validate product-event relationship
  const validEvents = VALID_EVENT_TYPES[record.product];
  if (!validEvents || !validEvents.has(record.event_type)) {
    return null;
  }

  let eventTimestamp: Date | null = null;
  if (record.event_timestamp) {
    const parsedTimestamp = new Date(record.event_timestamp);
    if (!Number.isNaN(parsedTimestamp.getTime())) {
      eventTimestamp = parsedTimestamp;
    }
  }

  const amountText = record.amount?.trim().replace(/,/g, "");
  if (!amountText || !/^[-+]?\d+(\.\d+)?$/.test(amountText)) {
    return null;
  }

  const amountNumber = Number(amountText);
  if (!Number.isFinite(amountNumber)) {
    return null;
  }

  const amountNormalized = amountNumber.toFixed(2);

  return {
    event_id: record.event_id,
    merchant_id: record.merchant_id,
    event_timestamp: eventTimestamp,
    product: record.product as ProductType,
    event_type: record.event_type as EventType,
    amount: amountNormalized,
    status: record.status as StatusType,
    channel: record.channel as ChannelType,
    region: record.region,
    merchant_tier: record.merchant_tier as MerchantTier,
  };
};

const importFile = async (filePath: string): Promise<void> => {
  const batch: Prisma.EventCreateManyInput[] = [];
  let importedCount = 0;
  let skippedCount = 0;

  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

  for await (const record of parser) {
    const input = toEventInput(record as RawRecord);
    if (!input) {
      skippedCount += 1;
      continue;
    }

    batch.push(input);

    if (batch.length >= BATCH_SIZE) {
      const result = await prisma.event.createMany({
        data: batch,
        skipDuplicates: true,
      });
      importedCount += result.count;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const result = await prisma.event.createMany({
      data: batch,
      skipDuplicates: true,
    });
    importedCount += result.count;
  }

  console.log(
    `Imported ${importedCount} rows from ${path.basename(filePath)} (skipped ${skippedCount}).`,
  );
};

const main = async (): Promise<void> => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const entries = await fs.promises.readdir(DATA_DIR, { withFileTypes: true });
  const csvFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith("activities_") &&
        entry.name.endsWith(".csv"),
    )
    .map((entry) => path.join(DATA_DIR, entry.name))
    .sort();

  if (csvFiles.length === 0) {
    console.log("No CSV files found in data/.");
    return;
  }

  for (const filePath of csvFiles) {
    await importFile(filePath);
  }
};

main()
  .catch((error) => {
    console.error("CSV import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
