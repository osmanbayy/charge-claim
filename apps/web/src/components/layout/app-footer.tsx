export function AppFooter() {
  return (
    <footer className="border-t border-white/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-bold tracking-tight text-foreground">
          Charge<span className="text-emerald-600">Claim</span>
        </p>
        <p>İstanbul elektrikli araç şarj ağı.</p>
      </div>
    </footer>
  );
}
