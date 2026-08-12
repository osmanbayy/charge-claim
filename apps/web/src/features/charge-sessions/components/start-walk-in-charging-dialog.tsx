'use client';

import { useState } from 'react';
import {
  BatteryCharging,
  Clock3,
  PlugZap,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DURATION_OPTIONS,
  type ReservationDurationMinutes,
} from '@/lib/constants';
import type {
  Connector,
  Station,
} from '@/features/stations/types/station';

export interface WalkInChargingSelection {
  station: Station;
  connector: Connector;
}

interface StartWalkInChargingDialogProps {
  selection: WalkInChargingSelection | null;
  isStarting: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    durationMinutes: ReservationDurationMinutes,
  ) => void;
}

export function StartWalkInChargingDialog({
  selection,
  isStarting,
  errorMessage,
  onOpenChange,
  onConfirm,
}: StartWalkInChargingDialogProps) {
  const [durationMinutes, setDurationMinutes] = useState<ReservationDurationMinutes>(30);

  return (
    <Dialog
      open={selection !== null}
      onOpenChange={(open) => {
        if (!isStarting) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BatteryCharging className="size-5" />
          </div>

          <DialogTitle>
            Anlık şarjı başlat
          </DialogTitle>

          <DialogDescription>
            Rezervasyon oluşturmadan seçilen connector’da
            şarj oturumu başlatılacak.
          </DialogDescription>
        </DialogHeader>

        {selection ? (
          <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
            <div>
              <p className="font-medium">
                {selection.station.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {selection.station.district}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-card p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <PlugZap className="size-4 text-emerald-600" />
                  {selection.connector.code}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {selection.connector.type === 'TYPE_2'
                    ? 'Type 2'
                    : 'CCS2'}
                </p>
              </div>

              <div className="rounded-lg bg-card p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="size-4 text-emerald-600" />
                  {Number(
                    selection.connector.powerKw,
                  ).toLocaleString('tr-TR')}{' '}
                  kW
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {Number(
                    selection.connector.pricePerKWh,
                  ).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  TL/kWh
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="walk-in-duration"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Clock3 className="size-4 text-emerald-600" />
            Planlanan süre
          </label>

          <Select
            value={String(durationMinutes)}
            onValueChange={(value) => {
              setDurationMinutes(
                Number(value) as ReservationDurationMinutes,
              );
            }}
            disabled={isStarting}
          >
            <SelectTrigger id="walk-in-duration">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {DURATION_OPTIONS.map((duration) => (
                <SelectItem
                  key={duration}
                  value={String(duration)}
                >
                  {duration} dakika
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={isStarting}
              />
            }
          >
            Vazgeç
          </DialogClose>

          <Button
            type="button"
            disabled={isStarting || selection === null}
            onClick={() => {
              onConfirm(durationMinutes);
            }}
          >
            <BatteryCharging className="size-4" />

            {isStarting
              ? 'Şarj başlatılıyor...'
              : 'Şarjı başlat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}