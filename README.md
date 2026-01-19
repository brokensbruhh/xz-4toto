# Finance & Crypto Dashboard

A production-ready finance tracker + crypto dashboard built with Next.js 14, Prisma, and SQLite. Includes transaction CRUD, analytics charts, crypto watchlist with live prices, portfolio allocation, and AI explanations based on recent news.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Prisma ORM + SQLite
- TailwindCSS
- Chart.js via react-chartjs-2
- OpenAI API + NewsAPI for AI explain

## Features
- Transactions CRUD with filters
- Dashboard with balance summary, pie + line charts
- Crypto watchlist with CoinGecko live prices
- Demo auth with httpOnly cookie session
- CSV import for transactions
- Category budgets with progress bars
- Manual USD/KZT conversion
- PDF export of summary by period
- Portfolio allocation with holdings + CoinGecko pricing
- Crypto search with quick add to watchlist or holdings
- AI explanation of recent price moves (news-cited)

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

## Environment Variables
Create a `.env` file with:

```
OPENAI_API_KEY=your_openai_key
NEWS_API_KEY=your_newsapi_key
```

- `OPENAI_API_KEY` is required for `/api/ai/explain-move`.
- `NEWS_API_KEY` is required for news evidence in the AI explanation.

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
    portfolio/page.tsx
    preview/page.tsx
    transactions/page.tsx
    transactions/new/page.tsx
    transactions/[id]/edit/page.tsx
    watchlist/page.tsx
  api/
    ai/explain-move/route.ts
    auth/login/route.ts
    auth/logout/route.ts
    coingecko/search/route.ts
    holdings/route.ts
    portfolio/summary/route.ts
    portfolio/allocation/route.ts
    transactions/route.ts
    transactions/[id]/route.ts
    watchlist/route.ts
    budgets/route.ts
    rates/route.ts
components/
  DonutChart.tsx
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
- Portfolio: _add screenshot_
- Watchlist: _add screenshot_

## Notes
- The demo auth is intentionally minimal for portfolio/demo usage.
- The CoinGecko API is public and rate-limited; avoid excessive refreshes.
