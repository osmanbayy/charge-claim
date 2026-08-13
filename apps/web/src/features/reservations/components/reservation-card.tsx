/* eslint-disable react-hooks/purity */
import type { Connector, Station } from "@/features/stations/types/station";
import type { Reservation } from "../types/reservation";
import { dateTimeFormatter, MILLISECONDS_PER_MINUTE, type ReservationStatus } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock3, MapPin, Plug, XCircle, BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReservationCardProps {
  reservation: Reservation;
  station: Station | null;
  connector: Connector | null;
  onCancel: () => void;
  onStartCharging: () => void;
}

const statusLabels: Record<ReservationStatus, string> = {
  CONFIRMED: 'Onaylandı',
  IN_PROGRESS: 'Devam ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal edildi',
  NO_SHOW: 'Katılım olmadı',
};

const statusClasses: Record<ReservationStatus, string> = {
  CONFIRMED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  IN_PROGRESS: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  COMPLETED: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  CANCELLED: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  NO_SHOW: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
};

export function ReservationCard({
  reservation,
  station,
  connector,
  onCancel,
  onStartCharging,
}: ReservationCardProps) {
  const durationMinutes = Math.round(
    (new Date(reservation.endAt).getTime() -
      new Date(reservation.startAt).getTime()) / MILLISECONDS_PER_MINUTE,
  );

  const canCancel =
    reservation.status === 'CONFIRMED' &&
    new Date(reservation.startAt).getTime() > Date.now();

  const currentTime = Date.now();

  const canStartCharging =
    reservation.status === 'CONFIRMED' &&
    new Date(reservation.startAt).getTime() <= currentTime &&
    currentTime < new Date(reservation.noShowDeadlineAt).getTime();

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1 bg-linear-to-r from-emerald-600 to-teal-500" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">
              {station?.name ?? 'İstasyon bilgisi bulunamadı'}
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              Rezervasyon #{reservation.id}
            </p>
          </div>

          <Badge
            variant="outline"
            className={statusClasses[reservation.status]}
          >
            {statusLabels[reservation.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {station ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />

            <span>
              {station.district} · {station.address}
            </span>
          </div>
        ) : null}

        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="size-4 text-emerald-600" />
              Başlangıç
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {dateTimeFormatter.format(
                new Date(reservation.startAt),
              )}
            </p>
          </div>

          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock3 className="size-4 text-emerald-600" />
              Bitiş
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {dateTimeFormatter.format(
                new Date(reservation.endAt),
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-950 px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-sm">
            <Plug className="size-4 text-emerald-300" />

            <span className="font-medium">
              {connector?.code ??
                `Connector #${reservation.connectorId}`}
            </span>

            {connector ? (
              <span className="text-emerald-200">
                {connector.type === 'TYPE_2'
                  ? 'Type 2'
                  : 'CCS2'}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100">
              {durationMinutes} dakika
            </span>

            <div className="flex items-center gap-2">
              {canStartCharging ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={onStartCharging}
                >
                  <BatteryCharging className="size-4" />
                  Şarjı başlat
                </Button>
              ) : null}

              {canCancel ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={onCancel}
                >
                  <XCircle className="size-4" />
                  İptal et
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
