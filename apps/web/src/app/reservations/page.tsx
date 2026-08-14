"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useReservations } from "@/features/reservations/hooks/use-reservations";
import { useStations } from "@/features/stations/hooks/use-stations";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReservationCard } from "@/features/reservations/components/reservation-card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import {
  ReservationCancellationDialog,
  type CancellationSelection,
} from '@/features/reservations/components/reservation-cancel-dialog';
import type { Reservation } from '@/features/reservations/types/reservation';
import { useStartChargingFromReservation } from "@/features/charge-sessions/hooks/use-start-charging-from-reservation";
import { StartReservationChargingDialog } from "@/features/charge-sessions/components/start-reservation-charging-dialog";

interface StartChargingSelection {
  reservation: Reservation;
  stationName: string;
}

export default function ReservationsPage() {
  const router = useRouter();

  const [cancellationSelection, setCancellationSelection] = useState<CancellationSelection | null>(null);
  const [activeTab, setActiveTab] = useState<'confirmed' | 'cancelled'>('confirmed');
  const [startChargingSelection, setStartChargingSelection] = useState<StartChargingSelection | null>(null);

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const startChargingMutation = useStartChargingFromReservation();

  const canViewReservations = isAuthenticated && user?.role === 'DRIVER';

  const reservationsQuery = useReservations(canViewReservations);

  const stationsQuery = useStations();

  const isPending = reservationsQuery.isPending || stationsQuery.isPending;

  const confirmedReservations =
    reservationsQuery.data?.filter(
      (reservation) => reservation.status !== 'CANCELLED',
    ) ?? [];
  const cancelledReservations =
    reservationsQuery.data?.filter(
      (reservation) => reservation.status === 'CANCELLED',
    ) ?? [];
  const visibleReservations =
    activeTab === 'confirmed'
      ? confirmedReservations
      : cancelledReservations;

  const handleStartCharging = (): void => {
    if (!startChargingSelection) return;

    startChargingMutation.mutate(
      {
        reservationId: startChargingSelection.reservation.id,
      },
      {
        onSuccess: () => {
          setStartChargingSelection(null);
          router.push('/charging');
        }
      }
    )
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-52 w-full rounded-xl" />
      </div>
    );
  }

  if (user?.role !== 'DRIVER') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Alert>
          <AlertDescription>
            Rezervasyonlarım sayfası yalnızca sürücü
            hesapları tarafından kullanılabilir.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="flex-1">
      <div className="mac-hero relative isolate overflow-hidden border-x-0 border-t-0 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,oklch(0.65_0.14_166/.18),transparent_24rem)]" />
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <CalendarDays className="size-4" />
            Sürücü hesabı
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">
            Rezervasyonlarım
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            Gelecek ve geçmiş şarj rezervasyonlarınızı
            görüntüleyin.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-64 rounded-xl"
              />
            ))}
          </div>
        ) : null}

        {reservationsQuery.data?.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <CalendarDays className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-3 font-semibold">
              Henüz rezervasyonunuz yok
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              İstasyonlar sayfasından uygun bir konnektör
              seçerek ilk rezervasyonunuzu oluşturabilirsiniz.
            </p>

            <Button
              className="mt-5"
              onClick={() => router.push('/stations')}
            >
              İstasyonları görüntüle
            </Button>
          </div>
        ) : null}

        {reservationsQuery.data && reservationsQuery.data.length > 0 ? (
          <div>
            <div
              className="mb-6 grid grid-cols-2 rounded-xl border bg-muted/40 p-1"
              role="tablist"
              aria-label="Rezervasyon durumları"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'confirmed'}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'confirmed'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setActiveTab('confirmed')}
              >
                <CheckCircle2 className="size-4" />
                Onaylananlar
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                  {confirmedReservations.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'cancelled'}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'cancelled'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setActiveTab('cancelled')}
              >
                <XCircle className="size-4" />
                İptal Edilenler
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                  {cancelledReservations.length}
                </span>
              </button>
            </div>

            {visibleReservations.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
                {activeTab === 'confirmed' ? (
                  <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
                ) : (
                  <XCircle className="mx-auto size-10 text-red-500" />
                )}
                <h2 className="mt-3 font-semibold">
                  {activeTab === 'confirmed'
                    ? 'Onaylanan rezervasyon bulunmuyor'
                    : 'İptal edilen rezervasyon bulunmuyor'}
                </h2>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleReservations.map((reservation) => {
                  const station =
                    stationsQuery.data?.find((item) =>
                      item.connectors.some(
                        (connector) =>
                          connector.id === reservation.connectorId,
                      ),
                    ) ?? null;

                  const connector =
                    station?.connectors.find(
                      (item) =>
                        item.id === reservation.connectorId,
                    ) ?? null;

                  return (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      station={station}
                      connector={connector}
                      onCancel={() => {
                        setCancellationSelection({
                          reservation,
                          stationName: station?.name ?? 'Bilinmeyen istasyon'
                        })
                      }}
                      onStartCharging={() => {
                        startChargingMutation.reset();
                        setStartChargingSelection({
                          reservation,
                          stationName: station?.name ?? 'Bilinmeyen istasyon'
                        })
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <ReservationCancellationDialog
        selection={cancellationSelection}
        onOpenChange={(open) => {
          if (!open) {
            setCancellationSelection(null);
          }
        }}
      />

      <StartReservationChargingDialog
        reservation={
          startChargingSelection?.reservation ?? null
        }
        stationName={
          startChargingSelection?.stationName ?? ''
        }
        isStarting={startChargingMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setStartChargingSelection(null);
            startChargingMutation.reset();
          }
        }}
        onConfirm={handleStartCharging}
      />
    </section>
  );
}
