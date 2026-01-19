"use client";

type CryptoItem = {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  coinId?: string;
};

type CryptoTableProps = {
  items: CryptoItem[];
  onRemove: (id: string) => Promise<void>;
  onExplain?: (coinId: string) => void;
};

export default function CryptoTable({
  items,
  onRemove,
  onExplain,
}: CryptoTableProps) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Coin</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Price (USD)</th>
            <th className="px-4 py-3">24h</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                No watchlist items.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-200">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-400">{item.symbol}</td>
                <td className="px-4 py-3 text-slate-200">
                  {item.price !== null ? item.price.toFixed(2) : "—"}
                </td>
                <td
                  className={`px-4 py-3 text-sm font-semibold ${
                    (item.change24h ?? 0) >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }`}
                >
                  {item.change24h !== null
                    ? `${item.change24h.toFixed(2)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {onExplain && item.coinId ? (
                      <button
                        onClick={() => onExplain(item.coinId ?? "")}
                        className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300"
                      >
                        Explain last 7d move
                      </button>
                    ) : null}
                    <button
                      onClick={() => onRemove(item.id)}
                      className="rounded-md border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
