
# DreamDevs Challenge API

**Author:** Obadimeji David

## Description
Express + TypeScript API that exposes analytics endpoints backed by Prisma and PostgreSQL. The service aggregates event data into top merchant, monthly active merchants, product adoption, KYC funnel, and failure rate metrics.

## Requirements
- Node.js 18+ (or compatible LTS)
- npm 9+ (or compatible)
- PostgreSQL database
- Prisma CLI (installed via dev dependencies)

## Setup
1. Install dependencies:
	- `npm install`
2. Configure environment:
	- Create a `.env` file in the project root with `DATABASE_URL` set to your PostgreSQL connection string.
	- If using Prisma Accelerate, also set `ACCELERATE_URL`.
3. Generate Prisma client:
	- `npx prisma generate`
4. (Optional) Import CSV data:
	- `npm run import:csv`
5. Start the API:
	- `npm run dev`

## Assumptions
- Product adoption counts only successful events (`status = SUCCESS`).
- Monthly active merchants are counted per month based on `event_timestamp` and `status = SUCCESS`.

## Malformed Data Handling
During CSV import, invalid rows are skipped and counted. A row is skipped if:
- `event_id` or `merchant_id` is missing.
- `product`, `status`, `channel`, or `merchant_tier` is not a valid enum value.
- `event_type` does not match the allowed set for the given product.
- `event_timestamp` is present but cannot be parsed into a valid date.
- `amount` is missing, non-numeric, or not finite.

Valid rows are inserted in batches with `skipDuplicates: true` to avoid inserting duplicate `event_id` values.

## API Routes and Response Data
Base path: `/analytics`

### GET `/analytics/top-merchant`
Returns the merchant with the highest total successful transaction amount.

Response shape:
```json
{
	"merchant_id": "string",
	"total_amount": 12345.67
}
```

### GET `/analytics/monthly-active-merchants`
Returns monthly active merchant counts for successful events.

Response shape:
```json
{
	"YYYY-MM": 123,
	"YYYY-MM": 456
}
```

### GET `/analytics/product-adoption`
Returns total successful events per product.

Response shape:
```json
{
	"POS": 109408,
    "AIRTIME": 80543,
    "BILLS": 68817,
    "CARD_PAYMENT": 45515,
    "SAVINGS": 54837,
    "MONIEBOOK": 47753,
    "KYC": 30001
}
```

### GET `/analytics/kyc-funnel`
Returns distinct merchant counts for KYC steps (successful events only).

Response shape:
```json
{
	"documents_submitted": 123,
	"verifications_completed": 98,
	"tier_upgrades": 45
}
```

### GET `/analytics/failure-rates`
Returns failure rate percentage per product, rounded to two decimals.

Response shape:
```json
[
	{
		"product": "POS",
		"failure_rate": 12.34
	}
]
```

