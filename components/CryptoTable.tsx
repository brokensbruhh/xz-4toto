"use client";

type CryptoItem = {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
};

type CryptoTableProps = {
  items: CryptoItem[];
  onRemove: (id: string) => Promise<void>;
};

export default function CryptoTable({ items, onRemove }: CryptoTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Coin</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Price (USD)</th>
            <th className="px-4 py-3">24h</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                No watchlist items.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.symbol}</td>
                <td className="px-4 py-3 text-slate-700">
                  {item.price !== null ? item.price.toFixed(2) : "—"}
                </td>
                <td
                  className={`px-4 py-3 text-sm font-semibold ${
                    (item.change24h ?? 0) >= 0
                      ? "text-emerald-600"
                      : "text-rose-500"
                  }`}
                >
                  {item.change24h !== null
                    ? `${item.change24h.toFixed(2)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
