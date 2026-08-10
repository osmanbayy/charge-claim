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
import { CalendarDays, RefreshCw } from "lucide-react";
import {
  ReservationCancellationDialog,
  type CancellationSelection,
} from '@/features/reservations/components/reservation-cancel-dialog';

export default function ReservationsPage() {
  const router = useRouter();

  const [cancellationSelection, setCancellationSelection] = useState<CancellationSelection | null>(null);

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const canViewReservations = isAuthenticated && user?.role === 'DRIVER';

  const reservationsQuery = useReservations(canViewReservations);

  const stationsQuery = useStations();

  const isPending = reservationsQuery.isPending || stationsQuery.isPending;

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
      <div className="border-b bg-emerald-950 text-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <CalendarDays className="size-4" />
            Sürücü hesabı
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Rezervasyonlarım
          </h1>

          <p className="mt-3 text-sm text-emerald-100">
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

        {reservationsQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <h2 className="font-semibold">
              Rezervasyonlar yüklenemedi
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              API bağlantısını kontrol edip tekrar deneyin.
            </p>

            <Button
              className="mt-4"
              onClick={() => void reservationsQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Tekrar dene
            </Button>
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

        {reservationsQuery.data &&
          reservationsQuery.data.length > 0 ? (
          <div className="space-y-4">
            {reservationsQuery.data.map((reservation) => {
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
                />
              );
            })}
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
    </section>
  );
}