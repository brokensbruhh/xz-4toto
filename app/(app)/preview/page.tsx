export default function PreviewPage() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <p className="text-xs uppercase text-slate-500">Net Worth</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">
            $2,068,973
          </h2>
          <p className="mt-2 text-sm text-rose-300">-$1,452,654 · -41.23%</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-xs text-slate-500">Claimable</p>
              <p className="mt-2 text-lg font-semibold text-slate-100">$0</p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-xs text-slate-500">Total Assets</p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                $2,068,973
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-xs text-slate-500">Total Liabilities</p>
              <p className="mt-2 text-lg font-semibold text-slate-100">$0</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase text-slate-500">Protocol Allocation</p>
          <div className="mt-6 h-40 rounded-full border border-slate-800/80 bg-slate-900/60"></div>
          <div className="mt-6 space-y-2 text-sm text-slate-400">
            <div className="flex items-center justify-between">
              <span>NFTs</span>
              <span>75.63%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Wallet</span>
              <span>23.99%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kelp</span>
              <span>0.38%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-lg font-semibold text-slate-100">Protocol Breakdown</h3>
        <div className="mt-4 space-y-4">
          {["NFTs", "Wallet", "Kelp", "Aave V3"].map((label) => (
            <div key={label} className="flex items-center gap-4 text-sm">
              <span className="w-24 text-slate-400">{label}</span>
              <div className="h-2 flex-1 rounded-full bg-slate-800">
                <div className="h-2 w-2/3 rounded-full bg-emerald-400"></div>
              </div>
              <span className="w-20 text-right text-slate-300">$12,345</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
