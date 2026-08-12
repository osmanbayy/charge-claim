'use client';

import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  Clock3,
  PlugZap,
  Square,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dateTimeFormatter } from '@/lib/constants';
import type { ChargingSession } from '../types/charging-session';
import {
  calculateRemainingTime,
  formatRemainingTime,
} from '../utils';

interface ActiveChargingSessionCardProps {
  session: ChargingSession;
  isStopping: boolean;
  errorMessage?: string;
  onStop: () => void;
}

export function ActiveChargingSessionCard({
  session,
  isStopping,
  errorMessage,
  onStop,
}: ActiveChargingSessionCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const remainingTime = calculateRemainingTime(session.plannedEndAt, currentTime);

  return (
    <Card className="overflow-hidden border-emerald-200 shadow-sm">
      <div className="h-1 bg-linear-to-r from-emerald-600 to-teal-500" />

      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Aktif şarj oturumu
            </p>

            <CardTitle className="mt-1">
              Connector #{session.connectorId}
            </CardTitle>
          </div>

          <Badge className="bg-emerald-600 text-white">
            <BatteryCharging className="size-3.5" />
            Şarj ediliyor
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl bg-emerald-950 px-6 py-7 text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-200">
            <Clock3 className="size-4" />
            Kalan süre
          </div>

          <p className="mt-2 font-mono text-4xl font-semibold tracking-wider">
            {formatRemainingTime(remainingTime)}
          </p>

          {remainingTime.isExpired ? (
            <p className="mt-3 text-sm text-amber-200">
              Oturum tamamlanıyor...
            </p>
          ) : null}
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="size-4 text-emerald-600" />
              Connector gücü
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {Number(session.powerKwSnapshot).toLocaleString(
                'tr-TR',
              )}{' '}
              kW
            </p>
          </div>

          <div className="bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <PlugZap className="size-4 text-emerald-600" />
              Tarife
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {Number(
                session.pricePerKWhSnapshot,
              ).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              TL/kWh
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Planlanan bitiş:{' '}
          <span className="font-medium text-foreground">
            {dateTimeFormatter.format(
              new Date(session.plannedEndAt),
            )}
          </span>
        </div>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={isStopping || remainingTime.isExpired}
          onClick={onStop}
        >
          <Square className="size-4" />

          {isStopping
            ? 'Şarj durduruluyor...'
            : 'Şarjı durdur'}
        </Button>
      </CardContent>
    </Card>
  )
}