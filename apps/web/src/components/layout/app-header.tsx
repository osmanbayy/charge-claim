import { BatteryCharging } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/stations"
          className="flex items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BatteryCharging className="size-5" />
          </span>

          <span className="text-lg font-semibold tracking-tight">
            Charge Claim
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/stations"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:block"
          >
            İstasyonlar
          </Link>

          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Giriş yap
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Kayıt ol
          </Link>
        </nav>
      </div>
    </header>
  );
}