export function AppFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#101214]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-bold tracking-tight text-foreground">
          Charge<span className="text-emerald-300">Claim</span>
        </p>
        <p>İstanbul elektrikli araç şarj ağı.</p>
      </div>
    </footer>
  );
}
