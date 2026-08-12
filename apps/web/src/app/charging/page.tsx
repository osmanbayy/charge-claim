"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { ActiveChargingSessionCard } from "@/features/charge-sessions/components/active-charging-session-card";
import { StopChargingSessionDialog } from "@/features/charge-sessions/components/stop-charging-session-dialog";
import { useActiveChargingSession } from "@/features/charge-sessions/hooks/use-active-charging-session";
import { useStopChargingSession } from "@/features/charge-sessions/hooks/use-stop-charging-session";
import { BatteryCharging, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChargingPage() {
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);

  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const canViewCharging = isAuthenticated && user?.role === 'DRIVER';

  const activeSessionQuery = useActiveChargingSession(canViewCharging);

  const stopChargingMutation = useStopChargingSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  const handleStopCharging = (): void => {
    const activeSession = activeSessionQuery.data;
    if (!activeSession) return;

    stopChargingMutation.mutate(activeSession.id, {
      onSuccess: () => setIsStopDialogOpen(false),
    })
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (user?.role !== 'DRIVER') {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <Alert>
          <AlertDescription>
            Şarj sayfası yalnızca sürücü hesapları tarafından kullanılabilir.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="flex-1">
      <div className="border-b bg-emerald-950 text-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <BatteryCharging className="size-4" />
            Sürücü hesabı
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Şarj işlemlerim
          </h1>

          <p className="mt-3 text-sm text-emerald-100">
            Aktif şarj oturumunuzu görüntüleyin ve yönetin.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {activeSessionQuery.isPending ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : null}

        {activeSessionQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <h2 className="font-semibold">
              Aktif şarj bilgisi yüklenemedi
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              API bağlantısını kontrol edip tekrar deneyin.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={() => {
                void activeSessionQuery.refetch();
              }}
            >
              <RefreshCw className="size-4" />
              Tekrar dene
            </Button>
          </div>
        ) : null}

        {!activeSessionQuery.isPending &&
          !activeSessionQuery.isError &&
          activeSessionQuery.data ? (
          <ActiveChargingSessionCard
            session={activeSessionQuery.data}
            isStopping={stopChargingMutation.isPending}
            onStop={() => {
              stopChargingMutation.reset();
              setIsStopDialogOpen(true);
            }}
          />
        ) : null}

        {!activeSessionQuery.isPending &&
          !activeSessionQuery.isError &&
          activeSessionQuery.data === null ? (
          <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
            <BatteryCharging className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-3 font-semibold">
              Aktif şarj oturumunuz yok
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Bir rezervasyondan veya müsait bir connector üzerinden
              şarj başlatabilirsiniz.
            </p>

            <Button
              type="button"
              className="mt-5"
              onClick={() => router.push('/stations')}
            >
              İstasyonları görüntüle
            </Button>
          </div>
        ) : null}
      </div>

      <StopChargingSessionDialog
        open={isStopDialogOpen}
        isStopping={stopChargingMutation.isPending}
        errorMessage={
          stopChargingMutation.isError
            ? 'Şarj oturumu durdurulamadı. Tekrar deneyin.'
            : undefined
        }
        onOpenChange={(open) => {
          setIsStopDialogOpen(open);

          if (!open) {
            stopChargingMutation.reset();
          }
        }}
        onConfirm={handleStopCharging}
      />
    </section>
  );
}