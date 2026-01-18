# Finance & Crypto Dashboard

A production-ready finance tracker + crypto dashboard built with Next.js 14, Prisma, and SQLite. Includes transaction CRUD, analytics charts, crypto watchlist with live prices, and enhancements like CSV import, category budgets, manual FX conversion, and PDF export.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Prisma ORM + SQLite
- TailwindCSS
- Chart.js via react-chartjs-2

## Features
- Transactions CRUD with filters
- Dashboard with balance summary, pie + line charts
- Crypto watchlist with CoinGecko live prices
- Demo auth with httpOnly cookie session
- CSV import for transactions
- Category budgets with progress bars
- Manual USD/KZT conversion
- PDF export of summary by period

## Getting Started

```bash
npm install
```

Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

Run the app:

```bash
npm run dev
```

Open http://localhost:3000 and log in using any username (3-24 chars).

## CSV Import Format
Provide a CSV with the following columns:

```
2024-06-30,income,2500,USD,Salary,June payout
2024-06-30,expense,120.5,USD,Groceries,Weekly shop
```

Columns: `date,type,amount,currency,category,note`

## Project Structure
```
app/
  (auth)/login/page.tsx
  (app)/
    layout.tsx
    page.tsx
    transactions/page.tsx
    transactions/new/page.tsx
    transactions/[id]/edit/page.tsx
    watchlist/page.tsx
  api/
    auth/login/route.ts
    auth/logout/route.ts
    transactions/route.ts
    transactions/[id]/route.ts
    watchlist/route.ts
    budgets/route.ts
    rates/route.ts
components/
  Nav.tsx
  TransactionForm.tsx
  TransactionsTable.tsx
  Charts.tsx
  CryptoTable.tsx
lib/
  prisma.ts
  auth.ts
  validators.ts
  dates.ts
  coingecko.ts
prisma/
  schema.prisma
  seed.ts
middleware.ts
```

## Screenshots
- Dashboard: _add screenshot_
- Transactions: _add screenshot_
- Watchlist: _add screenshot_

## Notes
- The demo auth is intentionally minimal for portfolio/demo usage.
- The CoinGecko API is public and rate-limited; avoid excessive refreshes.
