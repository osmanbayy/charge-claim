"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BatteryCharging,
  CalendarDays,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  function handleLogout(): void {
    logout();
    router.push("/stations");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#10101a]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/stations"
          className="group flex items-center gap-2.5 font-bold tracking-tight text-foreground"
        >
          <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-[#082b2d] text-emerald-300 shadow-[0_12px_30px_-12px_oklch(0.3_0.1_180/.8)] transition-transform group-hover:-translate-y-0.5">
            <span className="absolute inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
            <BatteryCharging className="size-5" />
          </span>

          <span className="hidden text-[16px] text-white sm:inline">Charge<span className="text-emerald-300">Claim</span><span className="ml-2 rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-emerald-300">İstanbul</span></span>
        </Link>

        <nav className="flex items-center gap-1.5 rounded-2xl border border-white/8 bg-white/[.035] p-1.5 shadow-sm backdrop-blur-xl">
          <Link
            href={"/stations"}
            className={buttonVariants({ variant: "ghost" })}
          >
            İstasyonlar
          </Link>

          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              {user.role === 'DRIVER' ? (
                <>
                  <Link
                    href="/reservations"
                    className={buttonVariants({
                      variant: 'ghost',
                    })}
                  >
                    <CalendarDays
                      data-icon="inline-start"
                      className="size-4"
                    />

                    <span className="hidden md:inline">
                      Rezervasyonlarım
                    </span>
                  </Link>

                  <Link
                    href="/charging"
                    className={buttonVariants({
                      variant: 'ghost',
                    })}
                  >
                    <BatteryCharging
                      data-icon="inline-start"
                      className="size-4"
                    />

                    <span className="hidden md:inline">
                      Şarj İşlemlerim
                    </span>
                  </Link>
                </>
              ) : null}

              {user.role === "STAFF" && (
                <Link
                  href="/staff"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  <ShieldCheck data-icon="inline-start" className="size-4" />
                  <span className="hidden md:inline">Yönetim</span>
                </Link>
              )}

              <div className="hidden items-center gap-2 lg:flex">
                <span className="max-w-40 truncate text-sm font-medium">
                  {user.name}
                </span>

                <Badge
                  variant={user.role === "STAFF" ? "default" : "secondary"}
                  className={
                    user.role === "STAFF"
                      ? "bg-emerald-600 text-white"
                      : undefined
                  }
                >
                  {user.role === "STAFF" ? "Personel" : "Sürücü"}
                </Badge>
              </div>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Çıkış yap</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                <LogIn data-icon="inline-start" className="size-4" />
                <span className="hidden sm:inline">Giriş yap</span>
              </Link>

              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                <UserPlus data-icon="inline-start" className="size-4" />
                <span className="hidden sm:inline">Kayıt ol</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
