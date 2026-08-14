"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BatteryCharging,
  CalendarPlus,
  CheckCircle2,
  MapPin,
  Plug,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvailabilitySearchForm } from "@/features/availability/components/availability-search-form";
import { useAvailability } from "@/features/availability/hooks/use-availability";
import type { AvailabilityQueryParams } from "@/features/availability/types/availability";
import {
  ReservationConfirmationDialog,
  type ReservationSelection,
} from "@/features/reservations/components/reservation-confirm-dialog";
import { useStation } from "../hooks/use-stations";
import type { Connector } from "../types/station";
import { statusClasses, statusLabels } from "../station-constants";
import {
  StartWalkInChargingDialog,
  type WalkInChargingSelection,
} from '@/features/charge-sessions/components/start-walk-in-charging-dialog';
import { useStartWalkInCharging } from '@/features/charge-sessions/hooks/use-start-walk-in-charging';
import type { ReservationDurationMinutes } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface StationDetailProps {
  stationId: number;
}

export function StationDetail({ stationId }: StationDetailProps) {
  const router = useRouter();

  const [reservationConnector, setReservationConnector] = useState<Connector | null>(null);
  const [availabilityParams, setAvailabilityParams] = useState<AvailabilityQueryParams | null>(null);
  const [reservationSelection, setReservationSelection] = useState<ReservationSelection | null>(null);
  const [walkInSelection, setWalkInSelection] = useState<WalkInChargingSelection | null>(null);

  const {
    data: station,
    isPending,
    isError,
  } = useStation(stationId);
  const availabilityQuery = useAvailability(availabilityParams);

  const walkInMutation = useStartWalkInCharging();

  const matchingAvailableStation = availabilityQuery.data?.stations.find(
    (item) => item.id === stationId,
  );
  const matchingAvailableConnector =
    matchingAvailableStation?.connectors.find(
      (item) => item.id === reservationConnector?.id,
    );
  const hasAvailabilityResult =
    availabilityParams !== null &&
    availabilityQuery.data !== undefined &&
    !availabilityQuery.isFetching;
  const isSelectedConnectorUnavailable =
    hasAvailabilityResult && matchingAvailableConnector === undefined;

  function continueToConfirmation(): void {
    if (!matchingAvailableStation || !matchingAvailableConnector) return;

    setReservationSelection({
      station: matchingAvailableStation,
      connector: matchingAvailableConnector,
    });
    setReservationConnector(null);
  }

  function closeAvailabilityDialog(): void {
    setReservationConnector(null);
    setAvailabilityParams(null);
  }

  function openAvailabilityDialog(connector: Connector): void {
    setAvailabilityParams(null);
    setReservationConnector(connector);
  }

  function openWalkInDialog(connector: Connector): void {
    if (!station) return;

    walkInMutation.reset();

    setWalkInSelection({
      station,
      connector,
    });
  }

  function handleWalkInConfirm(
    durationMinutes: ReservationDurationMinutes,
  ): void {
    if (!walkInSelection) return;

    walkInMutation.mutate(
      {
        connectorId: walkInSelection.connector.id,
        durationMinutes,
      },
      {
        onSuccess: () => {
          setWalkInSelection(null);
          router.push('/charging');
        },
      },
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:px-6">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/stations"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        İstasyonlara dön
      </Link>

      <section className="relative isolate overflow-hidden rounded-3xl border border-white/8 bg-[#0d1820] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,oklch(0.66_0.15_166/.2),transparent_22rem)]" />
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <BatteryCharging className="size-6" />
          </span>

          <div>
            <p className="text-sm font-medium text-emerald-200">
              {station.district}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
              {station.name}
            </h1>

            <p className="mt-3 flex items-start gap-2 text-sm text-slate-300">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {station.address}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Plug className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Konnektörler
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {station.connectors.map((connector) => (
            <Card key={connector.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      {connector.code}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {connector.type.replace("_", " ")}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      statusClasses[connector.currentStatus]
                    }
                  >
                    {statusLabels[connector.currentStatus]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Güç
                  </p>
                  <p className="mt-1 font-semibold">
                    {connector.powerKw.replace(".00", "")} kW
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Fiyat
                  </p>
                  <p className="mt-1 font-semibold">
                    {connector.pricePerKWh.replace(".", ",")} TL/kWh
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="col-span-2 border-emerald-200 text-emerald-700"
                  disabled={
                    connector.currentStatus !== 'AVAILABLE'
                  }
                  onClick={() => openWalkInDialog(connector)}
                >
                  <BatteryCharging className="size-4" />

                  {connector.currentStatus === 'AVAILABLE'
                    ? 'Anlık şarj başlat'
                    : 'Anlık şarj kullanılamıyor'}
                </Button>

                <Button
                  type="button"
                  className="col-span-2 bg-emerald-600 hover:bg-emerald-700"
                  disabled={connector.operationalStatus !== "ACTIVE"}
                  onClick={() => openAvailabilityDialog(connector)}
                >
                  <CalendarPlus className="size-4" />
                  {connector.operationalStatus === "ACTIVE"
                    ? "Randevu oluştur"
                    : "Bakım nedeniyle kullanılamıyor"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog
        open={reservationConnector !== null}
        onOpenChange={(open) => {
          if (!open) closeAvailabilityDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Randevu zamanı seçin</DialogTitle>
            <DialogDescription>
              {reservationConnector?.code} konnektörü için başlangıç
              zamanını ve şarj süresini belirleyin.
            </DialogDescription>
          </DialogHeader>

          <AvailabilitySearchForm
            isSearching={availabilityQuery.isFetching}
            showFilters={false}
            onSearch={setAvailabilityParams}
          />

          {isSelectedConnectorUnavailable ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-950">
              <AlertCircle className="size-4" />
              <AlertDescription>
                Bu konnektör seçilen zaman aralığında müsait değil.
                Farklı bir başlangıç zamanı veya süre deneyin.
              </AlertDescription>
            </Alert>
          ) : null}

          {hasAvailabilityResult && matchingAvailableConnector ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3 text-emerald-950">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">Konnektör bu saatte müsait</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Bilgileri kontrol edip rezervasyon onayına geçebilirsiniz.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={continueToConfirmation}
              >
                Rezervasyona devam et
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ReservationConfirmationDialog
        selection={reservationSelection}
        range={availabilityQuery.data?.range ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setReservationSelection(null);
            setAvailabilityParams(null);
          }
        }}
      />

      <StartWalkInChargingDialog
        selection={walkInSelection}
        isStarting={walkInMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setWalkInSelection(null);
            walkInMutation.reset();
          }
        }}
        onConfirm={handleWalkInConfirm}
      />
    </div>
  )
}
