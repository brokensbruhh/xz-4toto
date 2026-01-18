"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/watchlist", label: "Crypto Watchlist" },
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
    <aside className="w-60 shrink-0">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-50">Finance</h2>
        <p className="text-xs text-slate-500">Tracker & Crypto</p>
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-8 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-rose-400/60 hover:text-rose-300"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
