'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BatteryCharging,
  History,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/providers/auth-provider';
import { ActiveChargingSessionCard } from '@/features/charge-sessions/components/active-charging-session-card';
import { ChargingSessionHistoryCard } from '@/features/charge-sessions/components/charging-session-history-card';
import { StopChargingSessionDialog } from '@/features/charge-sessions/components/stop-charging-session-dialog';
import { getChargingErrorMessage } from '@/features/charge-sessions/error-utils';
import { useActiveChargingSession } from '@/features/charge-sessions/hooks/use-active-charging-session';
import { chargingSessionKeys, useChargingSessions } from '@/features/charge-sessions/hooks/use-charging-sessions';
import { useStopChargingSession } from '@/features/charge-sessions/hooks/use-stop-charging-session';
import { useStations } from '@/features/stations/hooks/use-stations';
import { useQueryClient } from '@tanstack/react-query';
import { reservationQueryKeys } from '@/features/reservations/hooks/use-reservations';
import { availabilityQueryKeys } from '@/features/availability/hooks/use-availability';

export default function ChargingPage() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const previousActiveSessionId = useRef<number | null | undefined>(undefined);

  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const canViewCharging =
    isAuthenticated && user?.role === 'DRIVER';

  const activeSessionQuery =
    useActiveChargingSession(canViewCharging);

  const chargingSessionsQuery =
    useChargingSessions(canViewCharging);

  const stationsQuery = useStations();

  const stopChargingMutation =
    useStopChargingSession();

  const activeSession = activeSessionQuery.data;

  const activeStation =
    activeSession
      ? stationsQuery.data?.find((station) =>
        station.connectors.some(
          (connector) =>
            connector.id ===
            activeSession.connectorId,
        ),
      ) ?? null
      : null;

  const activeConnector =
    activeSession
      ? activeStation?.connectors.find(
        (connector) =>
          connector.id ===
          activeSession.connectorId,
      ) ?? null
      : null;

  const completedSessions =
    chargingSessionsQuery.data?.filter(
      (session) => session.status === 'COMPLETED',
    ) ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (activeSessionQuery.isPending) return;

    const currentActiveSessionId =
      activeSessionQuery.data?.id ?? null;

    const previousSessionId =
      previousActiveSessionId.current;

    const sessionWasCompleted =
      typeof previousSessionId === 'number' &&
      currentActiveSessionId === null;

    previousActiveSessionId.current =
      currentActiveSessionId;

    if (!sessionWasCompleted) return;

    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: chargingSessionKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: reservationQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: availabilityQueryKeys.all,
      }),
    ]);
  }, [
    activeSessionQuery.data,
    activeSessionQuery.isPending,
    queryClient,
  ]);

  function handleStopCharging(): void {
    if (!activeSession) return;

    stopChargingMutation.mutate(activeSession.id, {
      onSuccess: () => {
        setIsStopDialogOpen(false);
      },
    });
  }

  function handleChargingRefetch(): void {
    void Promise.all([
      activeSessionQuery.refetch(),
      chargingSessionsQuery.refetch(),
      stationsQuery.refetch(),
    ]);
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
            Şarj sayfası yalnızca sürücü hesapları
            tarafından kullanılabilir.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="flex-1">
      <div className="relative isolate overflow-hidden border-b border-white/8 bg-[#0d1820] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,oklch(0.65_0.14_166/.18),transparent_24rem)]" />
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <BatteryCharging className="size-4" />
            Sürücü hesabı
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">
            Şarj işlemlerim
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            Aktif şarj oturumunuzu yönetin ve geçmiş
            tüketimlerinizi görüntüleyin.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-8 sm:px-6">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Aktif şarj
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Devam eden şarj oturumunuzun kalan süresini
              takip edin.
            </p>
          </div>

          {activeSessionQuery.isPending ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : null}

          {activeSessionQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <h3 className="font-semibold">
                Aktif şarj bilgisi yüklenemedi
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                API bağlantısını kontrol edip tekrar deneyin.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={handleChargingRefetch}
              >
                <RefreshCw className="size-4" />
                Tekrar dene
              </Button>
            </div>
          ) : null}

          {!activeSessionQuery.isPending &&
            !activeSessionQuery.isError &&
            activeSession ? (
            <ActiveChargingSessionCard
              session={activeSession}
              station={activeStation}
              connector={activeConnector}
              isStopping={
                stopChargingMutation.isPending
              }
              onStop={() => {
                stopChargingMutation.reset();
                setIsStopDialogOpen(true);
              }}
            />
          ) : null}

          {!activeSessionQuery.isPending &&
            !activeSessionQuery.isError &&
            activeSession === null ? (
            <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
              <BatteryCharging className="mx-auto size-10 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                Aktif şarj oturumunuz yok
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Bir rezervasyondan veya müsait bir connector
                üzerinden şarj başlatabilirsiniz.
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() =>
                  router.push('/stations')
                }
              >
                İstasyonları görüntüle
              </Button>
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <History className="size-5 text-emerald-600" />

                <h2 className="text-xl font-semibold">
                  Şarj geçmişi
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Tamamlanan şarj oturumlarınızın enerji ve
                ücret bilgileri.
              </p>
            </div>

            {completedSessions.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {completedSessions.length} tamamlanan oturum
              </span>
            ) : null}
          </div>

          {chargingSessionsQuery.isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-80 w-full rounded-xl"
                  />
                ),
              )}
            </div>
          ) : null}

          {chargingSessionsQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <h3 className="font-semibold">
                Şarj geçmişi yüklenemedi
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                API bağlantısını kontrol edip tekrar deneyin.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={() => {
                  void chargingSessionsQuery.refetch();
                }}
              >
                <RefreshCw className="size-4" />
                Tekrar dene
              </Button>
            </div>
          ) : null}

          {!chargingSessionsQuery.isPending &&
            !chargingSessionsQuery.isError &&
            completedSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
              <History className="mx-auto size-10 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                Henüz tamamlanan şarj oturumunuz yok
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Tamamladığınız şarj oturumları burada
                görüntülenecek.
              </p>
            </div>
          ) : null}

          {!chargingSessionsQuery.isPending &&
            !chargingSessionsQuery.isError &&
            completedSessions.length > 0 ? (
            <div className="space-y-4">
              {completedSessions.map((session) => {
                const station =
                  stationsQuery.data?.find((item) =>
                    item.connectors.some(
                      (connector) =>
                        connector.id === session.connectorId,
                    ),
                  ) ?? null;

                const connector =
                  station?.connectors.find((item) => item.id === session.connectorId) ?? null;

                return (
                  <ChargingSessionHistoryCard
                    key={session.id}
                    session={session}
                    station={station}
                    connector={connector}
                  />
                )
              })}
            </div>
          ) : null}
        </section>
      </div>

      <StopChargingSessionDialog
        open={isStopDialogOpen}
        isStopping={
          stopChargingMutation.isPending
        }
        errorMessage={
          stopChargingMutation.isError
            ? getChargingErrorMessage(
              stopChargingMutation.error,
              'Şarj oturumu durdurulamadı. Tekrar deneyin.',
            )
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
