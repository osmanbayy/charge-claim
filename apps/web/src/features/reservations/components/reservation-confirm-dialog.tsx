'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AlertCircle,
  CalendarDays,
  CircleCheck,
  LoaderCircle,
  LogIn,
  MapPin,
  Plug,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  AvailableConnector,
  AvailableStation,
} from '@/features/availability/types/availability';
import { useAuth } from '@/features/auth/providers/auth-provider';
import { useCreateReservation } from '../hooks/use-create-reservation';
import { MILLISECONDS_PER_MINUTE, DURATION_OPTIONS, type ReservationDurationMinutes, dateTimeFormatter } from '@/lib/constants';

interface ApiErrorResponse {
  message?: string | string[];
}

export interface ReservationSelection {
  station: AvailableStation;
  connector: AvailableConnector;
}

interface ReservationRange {
  startAt: string;
  endAt: string;
}

interface ReservationConfirmationDialogProps {
  selection: ReservationSelection | null;
  range: ReservationRange | null;
  onOpenChange: (open: boolean) => void;
}

function isReservationDurationMinutes(
  value: number,
): value is ReservationDurationMinutes {
  return DURATION_OPTIONS.some(
    (duration) => duration === value,
  );
}

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return 'Rezervasyon oluşturulamadı. Tekrar deneyin.';
  }

  const responseMessage = error.response?.data.message;

  const message = Array.isArray(responseMessage)
    ? responseMessage.join(' ')
    : responseMessage;

  if (error.response?.status === 409) {
    return (
      message ??
      'Bu konnektör seçilen zaman aralığında artık müsait değil.'
    );
  }

  if (error.response?.status === 401) {
    return 'Rezervasyon oluşturmak için giriş yapmalısınız.';
  }

  return message ?? 'Rezervasyon oluşturulamadı. Tekrar deneyin.';
}

export function ReservationConfirmationDialog({
  selection,
  range,
  onOpenChange,
}: ReservationConfirmationDialogProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const createReservation = useCreateReservation();

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [createdReservationId, setCreatedReservationId] =
    useState<number | null>(null);

  if (selection === null || range === null) {
    return null;
  }

  const selectedRange = range

  const { station, connector } = selection;

  function handleDialogOpenChange(open: boolean): void {
    if (!open) {
      setErrorMessage(null);
      setCreatedReservationId(null);
      createReservation.reset();
    }

    onOpenChange(open);
  }

  async function handleConfirm(): Promise<void> {
    setErrorMessage(null);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const durationMinutes =
      (new Date(selectedRange.endAt).getTime() -
        new Date(selectedRange.startAt).getTime()) /
      MILLISECONDS_PER_MINUTE;

    if (!isReservationDurationMinutes(durationMinutes)) {
      setErrorMessage(
        'Seçilen rezervasyon süresi geçerli değil.',
      );
      return;
    }

    try {
      const reservation =
        await createReservation.mutateAsync({
          connectorId: connector.id,
          startAt: selectedRange.startAt,
          durationMinutes,
        });

      setCreatedReservationId(reservation.id);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    }
  }

  if (createdReservationId !== null) {
    return (
      <Dialog
        open
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <div className="py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CircleCheck className="size-8" />
            </div>

            <DialogHeader className="mt-4">
              <DialogTitle>
                Rezervasyon oluşturuldu
              </DialogTitle>

              <DialogDescription>
                Rezervasyon numaranız: #{createdReservationId}
              </DialogDescription>
            </DialogHeader>

            <Button
              type="button"
              className="mt-6"
              onClick={() => handleDialogOpenChange(false)}
            >
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onOpenChange={handleDialogOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rezervasyonu onayla</DialogTitle>

          <DialogDescription>
            Seçtiğiniz istasyon, konnektör ve zaman aralığını
            kontrol edin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="font-semibold">
              {station.name}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {station.district}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {station.address}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Plug className="size-4 text-emerald-600" />
                {connector.code}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {connector.type === 'TYPE_2'
                  ? 'Type 2'
                  : 'CCS2'}
              </p>

              <div className="mt-1 flex items-center gap-1 text-sm">
                <Zap className="size-4 text-amber-500" />
                {Number(connector.powerKw).toLocaleString(
                  'tr-TR',
                )}{' '}
                kW
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="size-4 text-emerald-600" />
                Zaman aralığı
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {dateTimeFormatter.format(
                  new Date(selectedRange.startAt),
                )}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {dateTimeFormatter.format(
                  new Date(selectedRange.endAt),
                )}
              </p>
            </div>
          </div>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />

              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={createReservation.isPending}
              onClick={() => handleDialogOpenChange(false)}
            >
              Vazgeç
            </Button>

            <Button
              type="button"
              disabled={
                isLoading || createReservation.isPending
              }
              onClick={() => void handleConfirm()}
            >
              {createReservation.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Oluşturuluyor
                </>
              ) : isAuthenticated ? (
                'Rezervasyonu onayla'
              ) : (
                <>
                  <LogIn className="size-4" />
                  Giriş yaparak devam et
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}