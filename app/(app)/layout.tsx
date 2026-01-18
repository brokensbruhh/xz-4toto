import Nav from "@/components/Nav";

const tabs = ["Overview", "Holdings", "Transactions", "PnL", "Simulator"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-10">
        <Nav />
        <div className="flex-1 space-y-6">
          <header className="card flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3 text-slate-100">
              <h1 className="text-lg font-semibold">Portfolio</h1>
              <span className="text-xs text-slate-500">Alex Svanevik</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                Protocols
              </button>
              <button className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                Feedback
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-6 border-b border-slate-800 px-2 text-sm font-medium">
            {tabs.map((tab) => (
              <span
                key={tab}
                className={`pb-3 ${
                  tab === "Overview"
                    ? "border-b-2 border-emerald-400 text-emerald-300"
                    : "text-slate-400"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
