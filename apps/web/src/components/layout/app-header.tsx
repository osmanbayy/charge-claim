"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BatteryCharging,
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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/stations"
          className="flex items-center gap-2 font-semibold text-emerald-700"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100">
            <BatteryCharging className="size-5" />
          </span>

          <span className="hidden sm:inline">Charge Claim</span>
        </Link>

        <nav className="flex items-center gap-2">
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