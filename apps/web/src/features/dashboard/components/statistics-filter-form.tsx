'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Station } from '@/features/stations/types/station';
import type { DashboardStatisticsParams } from '../types/dashboard';

const ALL_STATIONS_VALUE = 'all';

interface StatisticsFilterFormProps {
  stations: Station[];
  isLoading: boolean;
  onSubmit: (
    params: DashboardStatisticsParams,
  ) => void;
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createInitialStartDate(): string {
  const date = new Date();

  date.setDate(date.getDate() - 6);

  return formatDateInputValue(date);
}

function createInitialEndDate(): string {
  return formatDateInputValue(new Date());
}

export function StatisticsFilterForm({
  stations,
  isLoading,
  onSubmit,
}: StatisticsFilterFormProps) {
  const [startDate, setStartDate] = useState(
    createInitialStartDate,
  );

  const [endDate, setEndDate] = useState(
    createInitialEndDate,
  );

  const [stationId, setStationId] =
    useState(ALL_STATIONS_VALUE);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const startAt = new Date(
      `${startDate}T00:00:00+03:00`,
    );

    const endAt = new Date(
      `${endDate}T00:00:00+03:00`,
    );

    endAt.setDate(endAt.getDate() + 1);

    const selectedStation =
      stationId === ALL_STATIONS_VALUE
        ? null
        : stations.find(
            (station) =>
              station.id === Number(stationId),
          ) ?? null;

    onSubmit({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      stationId:
        selectedStation?.id,
      district:
        selectedStation?.district,
    });
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-card p-5 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="statistics-start-date">
          Başlangıç tarihi
        </Label>

        <Input
          id="statistics-start-date"
          type="date"
          value={startDate}
          max={endDate}
          required
          disabled={isLoading}
          onChange={(event) => {
            setStartDate(event.target.value);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="statistics-end-date">
          Bitiş tarihi
        </Label>

        <Input
          id="statistics-end-date"
          type="date"
          value={endDate}
          min={startDate}
          required
          disabled={isLoading}
          onChange={(event) => {
            setEndDate(event.target.value);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="statistics-station">
          İstasyon
        </Label>

        <Select
          value={stationId}
          disabled={isLoading}
          onValueChange={(value) => {
            setStationId(
              value ?? ALL_STATIONS_VALUE,
            );
          }}
        >
          <SelectTrigger id="statistics-station">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_STATIONS_VALUE}>
              Tüm istasyonlar
            </SelectItem>

            {stations.map((station) => (
              <SelectItem
                key={station.id}
                value={String(station.id)}
              >
                {station.name} — {station.district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
      >
        <Filter className="size-4" />

        {isLoading
          ? 'Hesaplanıyor...'
          : 'İstatistikleri getir'}
      </Button>
    </form>
  );
}