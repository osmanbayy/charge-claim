import {
  BatteryCharging,
  CalendarClock,
  Clock3,
  Gauge,
  ReceiptText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dateTimeFormatter } from '@/lib/constants';
import type { ChargingSession } from '../types/charging-session';
import type {
  Connector,
  Station,
} from '@/features/stations/types/station';

interface ChargingSessionHistoryCardProps {
  session: ChargingSession;
  station: Station | null;
  connector: Connector | null;
}

const endReasonLabels = {
  USER_STOPPED: 'Kullanıcı durdurdu',
  TIME_LIMIT_REACHED: 'Süre tamamlandı',
} as const;

export function ChargingSessionHistoryCard({
  session,
  station,
  connector,
}: ChargingSessionHistoryCardProps) {
  const sessionType =
    session.reservationId === null
      ? 'Anlık şarj'
      : 'Rezervasyonlu şarj';

  const endReasonLabel = session.endReason
    ? endReasonLabels[session.endReason]
    : 'Bitiş bilgisi bulunamadı';

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <div className="h-1 bg-linear-to-r from-slate-500 to-slate-300" />

      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {station?.name ?? 'İstasyon bilgisi bulunamadı'}
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              {connector?.code ??
                `Connector #${session.connectorId}`}
              {connector
                ? ` · ${connector.type === 'TYPE_2'
                  ? 'Type 2'
                  : 'CCS2'
                }`
                : ''}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Oturum #{session.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {sessionType}
            </Badge>

            <Badge
              variant="outline"
              className="border-zinc-200 bg-zinc-50 text-zinc-700"
            >
              Tamamlandı
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="size-4 text-emerald-600" />
              Başlangıç
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {dateTimeFormatter.format(
                new Date(session.startedAt),
              )}
            </p>
          </div>

          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock3 className="size-4 text-emerald-600" />
              Bitiş
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {session.endedAt
                ? dateTimeFormatter.format(
                  new Date(session.endedAt),
                )
                : '—'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50 p-4 text-emerald-950">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="size-4 text-emerald-600" />
              Tüketilen enerji
            </div>

            <p className="mt-2 text-xl font-semibold">
              {session.energyKWh !== null
                ? Number(
                  session.energyKWh,
                ).toLocaleString('tr-TR', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })
                : '0,000'}{' '}
              kWh
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4 text-slate-950">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ReceiptText className="size-4 text-slate-600" />
              Toplam ücret
            </div>

            <p className="mt-2 text-xl font-semibold">
              {session.totalAmount !== null
                ? Number(
                  session.totalAmount,
                ).toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                : '0,00'}{' '}
              TL
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <BatteryCharging className="size-4 text-emerald-600" />
            {endReasonLabel}
          </div>

          <span className="text-muted-foreground">
            {Number(
              session.powerKwSnapshot,
            ).toLocaleString('tr-TR')}{' '}
            kW ·{' '}
            {Number(
              session.pricePerKWhSnapshot,
            ).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            TL/kWh
          </span>
        </div>
      </CardContent>
    </Card>
  );
}