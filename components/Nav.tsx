"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const primaryItems = [
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/signals", label: "Signals", icon: "📡" },
  { href: "/smart-money", label: "Smart Money", icon: "✨", badge: "NEW" },
  { href: "/profiler", label: "Profiler", icon: "🧭" },
];

const secondaryItems = [
  { href: "/tokens", label: "Tokens", icon: "💠" },
  { href: "/nfts", label: "NFTs", icon: "🖼️" },
  { href: "/contracts", label: "Hot Contracts", icon: "🔥" },
  { href: "/chains", label: "Chains", icon: "⛓️", badge: "NEW" },
  { href: "/research", label: "Research", icon: "📚" },
];

const portfolioItems = [
  { href: "/portfolio", label: "Portfolio", icon: "📊", badge: "BETA" },
  { href: "/alerts", label: "Smart Alerts", icon: "🚨" },
  { href: "/segments", label: "Smart Segments", icon: "🧩" },
  { href: "/watchlist", label: "Watchlists", icon: "⭐" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0">
      <div className="card flex h-full flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            ✳️
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Alex Svanevik</p>
            <p className="text-xs text-slate-500">************</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {primaryItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Explorer
          </p>
          <nav className="mt-3 space-y-1">
            {secondaryItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Portfolio
          </p>
          <nav className="mt-3 space-y-1">
            {portfolioItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active || item.href === "/portfolio"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
          <p className="px-3 font-semibold uppercase tracking-[0.2em]">History</p>
          <div className="mt-3 px-3">
            <button className="flex w-full items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/80">
              Quick access
              <span>⌄</span>
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-rose-400/60 hover:text-rose-300"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
