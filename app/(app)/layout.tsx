import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <Nav />
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
