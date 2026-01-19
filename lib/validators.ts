import { z } from "zod";

export const Currency = z.enum(["USD", "KZT"]);
export const TxType = z.enum(["income", "expense"]);

export const TransactionInput = z.object({
  type: TxType,
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number with up to 2 decimals"),
  currency: Currency,
  category: z.string().min(1).max(60),
  note: z.string().max(240).optional().or(z.literal("")),
  date: z.string().datetime(),
});

export const WatchlistInput = z.object({
  coinId: z.string().min(1),
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(60),
});

export const BudgetInput = z.object({
  category: z.string().min(1).max(60),
  limit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Limit must be a number with up to 2 decimals"),
  currency: Currency,
});

export const RateInput = z.object({
  base: Currency,
  quote: Currency,
  rate: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Rate must be a number with up to 4 decimals"),
});

export const HoldingInput = z.object({
  coinId: z.string().min(1),
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(80),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,8})?$/, "Amount must be a number with up to 8 decimals"),
});

export const HoldingUpdateInput = z.object({
  id: z.string().min(1),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,8})?$/, "Amount must be a number with up to 8 decimals"),
});

export const PortfolioSummaryQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const ExplainMoveQuery = z.object({
  coinId: z.string().min(1),
  days: z.string().optional(),
});

export const SearchQuery = z.object({
  q: z.string().min(1),
});
