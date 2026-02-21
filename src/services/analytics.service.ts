import prisma from "../config/prisma";
import { EventType, ProductType } from "../generated/prisma/enums";

export const getTopMerchant = async () => {
  const successfulTransactions = await prisma.event.findMany({
    where: {
      status: "SUCCESS",
    },
  });
  const merchantTotalAmounts = successfulTransactions.reduce(
    (acc: Record<string, number>, transaction) => {
      const merchantId = transaction.merchant_id;
      const amount = parseFloat(transaction.amount.toNumber().toFixed(2));
      acc[merchantId] = (acc[merchantId] || 0) + amount;
      return acc;
    },
    {},
  );

  const sorted = Object.entries(merchantTotalAmounts).sort(
    (a, b) => b[1] - a[1],
  );

  const topMerchant = sorted[0]
    ? { merchant_id: sorted[0][0], total_amount: sorted[0][1] }
    : null;

  return topMerchant;
};

export const getMonthlyActiveMerchants = async () => {
  const successfulEvents = await prisma.event.findMany({
    where: {
      status: "SUCCESS",
    },
  });

  const monthlyMerchants: Record<string, Set<string>> = {};

  successfulEvents.forEach((event) => {
    if (!event.event_timestamp) return;
    
    const month = event.event_timestamp.toISOString().slice(0, 7);
    if (!monthlyMerchants[month]) {
      monthlyMerchants[month] = new Set();
    }
    monthlyMerchants[month].add(event.merchant_id);
  });

  const monthlyActiveMerchantsCount: Record<string, number> = {};
  for (const month in monthlyMerchants) {
    if (monthlyMerchants[month]) {
      monthlyActiveMerchantsCount[month] = monthlyMerchants[month].size;
    }
  }

  return monthlyActiveMerchantsCount;
};

export const getProductAdoption = async () => {
  const successfulEvents = await prisma.event.findMany({
    where: {
      status: "SUCCESS",
    },
  });

  const productAdoption: Record<string, number> = {};

  successfulEvents.forEach((event) => {
    const product = event.product;
    if (!productAdoption[product]) {
      productAdoption[product] = 0;
    }
    productAdoption[product]++;
  });

  return productAdoption;
};

export const getKycFunnel = async () => {
  const kycEvents = await prisma.event.findMany({
    where: {
      event_type: {
        in: [
          EventType.DOCUMENT_SUBMITTED,
          EventType.VERIFICATION_COMPLETED,
          EventType.TIER_UPGRADE,
        ],
      },
      status: "SUCCESS",
    },
  });

  const funnel: {
    documents_submitted: Set<string>;
    verifications_completed: Set<string>;
    tier_upgrades: Set<string>;
  } = {
    documents_submitted: new Set(),
    verifications_completed: new Set(),
    tier_upgrades: new Set(),
  };

  kycEvents.forEach((event) => {
    if (event.event_type === EventType.DOCUMENT_SUBMITTED) {
      funnel.documents_submitted.add(event.merchant_id);
    } else if (event.event_type === EventType.VERIFICATION_COMPLETED) {
      funnel.verifications_completed.add(event.merchant_id);
    } else if (event.event_type === EventType.TIER_UPGRADE) {
      funnel.tier_upgrades.add(event.merchant_id);
    }
  });

  return funnel;
};

export const getFailureRates = async () => {
  const failedEvents = await prisma.event.findMany({
    where: {
      status: "FAILED",
    },
  });

  const failureRates: {
    product: string;
    failure_rate: number;
  }[] = [];

  const failedCounts: Record<string, number> = {};

  failedEvents.forEach((event) => {
    const product = event.product;
    failedCounts[product] = (failedCounts[product] || 0) + 1;
  });

  for (const product in failedCounts) {
    const total = await prisma.event.count({
      where: {
        product: product as ProductType,
        status: {
          not: "PENDING",
        },
      },
    });
    failureRates.push({
      product,
      failure_rate:
        total > 0 ? ((failedCounts[product] ?? 0) / total) * 100 : 0,
    });
  }

  return failureRates.sort((a, b) => b.failure_rate - a.failure_rate);
};

export default {
  getTopMerchant,
  getMonthlyActiveMerchants,
  getProductAdoption,
  getKycFunnel,
  getFailureRates,
};
