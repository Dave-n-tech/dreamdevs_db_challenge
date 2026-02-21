import prisma from "../config/prisma";
import { EventType, StatusType } from "../generated/prisma/enums";

export const getTopMerchant = async () => {
  const grouped = await prisma.event.groupBy({
    by: ["merchant_id"],
    where: {
      status: StatusType.SUCCESS,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: 1,
  }) as { merchant_id: string; _sum: { amount: number | null } }[];

  if (grouped.length === 0) {
    return null;
  }

  const top = grouped[0];

  if(!top) {
    return null;
  }
  
  if (!top._sum.amount) {
    return null;
  }

  return {
    merchant_id: top.merchant_id,
    total_amount: parseFloat(top._sum.amount.toFixed(2)),
  };
};

export const getMonthlyActiveMerchants = async () => {
  const rows = await prisma.$queryRaw<
    { month: Date; active_merchants: bigint }[]
  >`
    SELECT
      date_trunc('month', event_timestamp) AS month,
      COUNT(DISTINCT merchant_id) AS active_merchants
    FROM "Event"
    WHERE status = ${StatusType.SUCCESS}
      AND event_timestamp IS NOT NULL
    GROUP BY 1
    ORDER BY 1
  `;

  const monthlyActiveMerchantsCount: Record<string, number> = {};
  rows.forEach((row) => {
    const monthKey = row.month.toISOString().slice(0, 7);
    monthlyActiveMerchantsCount[monthKey] = Number(row.active_merchants);
  });

  return monthlyActiveMerchantsCount;
};

export const getProductAdoption = async () => {
  const grouped = await prisma.event.groupBy({
    by: ["product"],
    where: {
      status: StatusType.SUCCESS,
    },
    _count: {
      _all: true,
    },
  }) as { product: string; _count: { _all: number } }[];

  const productAdoption: Record<string, number> = {};
  grouped.forEach((row) => {
    productAdoption[row.product] = row._count._all;
  });

  return productAdoption;
};

export const getKycFunnel = async () => {
  const rows = await prisma.$queryRaw<
    { event_type: EventType; merchant_count: bigint }[]
  >`
    SELECT
      event_type,
      COUNT(DISTINCT merchant_id) AS merchant_count
    FROM "Event"
    WHERE status = ${StatusType.SUCCESS}
      AND event_type IN (
        ${EventType.DOCUMENT_SUBMITTED},
        ${EventType.VERIFICATION_COMPLETED},
        ${EventType.TIER_UPGRADE}
      )
    GROUP BY event_type
  `;

  const funnel = {
    documents_submitted: 0,
    verifications_completed: 0,
    tier_upgrades: 0,
  };

  rows.forEach((row) => {
    if (row.event_type === EventType.DOCUMENT_SUBMITTED) {
      funnel.documents_submitted = Number(row.merchant_count);
    } else if (row.event_type === EventType.VERIFICATION_COMPLETED) {
      funnel.verifications_completed = Number(row.merchant_count);
    } else if (row.event_type === EventType.TIER_UPGRADE) {
      funnel.tier_upgrades = Number(row.merchant_count);
    }
  });

  return funnel;
};

export const getFailureRates = async () => {
  const totals = await prisma.event.groupBy({
    by: ["product"],
    where: {
      status: {
        not: StatusType.PENDING,
      },
    },
    _count: {
      _all: true,
    },
  }) as { product: string; _count: { _all: number } }[];

  const failed = await prisma.event.groupBy({
    by: ["product"],
    where: {
      status: StatusType.FAILED,
    },
    _count: {
      _all: true,
    },
  }) as { product: string; _count: { _all: number } }[];

  const failedCounts: Record<string, number> = {};
  failed.forEach((row) => {
    failedCounts[row.product] = row._count._all;
  });

  const failureRates = totals.map((row) => {
    const total = row._count._all;
    const failedCount = failedCounts[row.product] ?? 0;
    return {
      product: row.product,
      failure_rate: total > 0 ? (failedCount / total) * 100 : 0,
    };
  });

  return failureRates.sort((a, b) => b.failure_rate - a.failure_rate);
};

export default {
  getTopMerchant,
  getMonthlyActiveMerchants,
  getProductAdoption,
  getKycFunnel,
  getFailureRates,
};
