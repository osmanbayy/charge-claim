'use client';

import { useState } from 'react';
import { CalendarSearch, RefreshCw, Map, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilitySearchForm } from '@/features/availability/components/availability-search-form';
import { AvailableStationCard } from '@/features/availability/components/available-station-card';
import { useAvailability } from '@/features/availability/hooks/use-availability';
import type { AvailabilityQueryParams } from '@/features/availability/types/availability';
import { StationCard } from '@/features/stations/components/station-card';
import { useStations } from '@/features/stations/hooks/use-stations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StationMap } from '@/features/stations/components/station-map';

type StationViewMode = 'list' | 'map';

export default function StationsPage() {
  const [availabilityParams, setAvailabilityParams] =
    useState<AvailabilityQueryParams | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<StationViewMode>('list');

  const stationsQuery = useStations();
  const availabilityQuery = useAvailability(availabilityParams);

  const isAvailabilityMode = availabilityParams !== null;

  const isPending = isAvailabilityMode
    ? availabilityQuery.isPending
    : stationsQuery.isPending;

  const isError = isAvailabilityMode
    ? availabilityQuery.isError
    : stationsQuery.isError;

  const isFetching = isAvailabilityMode
    ? availabilityQuery.isFetching
    : stationsQuery.isFetching;

  function handleAvailabilitySearch(
    params: AvailabilityQueryParams,
  ): void {
    setAvailabilityParams(params);
    setIsSearchDialogOpen(false);
  }

  function handleRefetch(): void {
    if (isAvailabilityMode) {
      void availabilityQuery.refetch();
      return;
    }

    void stationsQuery.refetch();
  }

  const hasVisibleStations = isAvailabilityMode
    ? (availabilityQuery.data?.stations.length ?? 0) > 0
    : (stationsQuery.data?.length ?? 0) > 0;

  const visibleStations = isAvailabilityMode
    ? (availabilityQuery.data?.stations ?? [])
    : (stationsQuery.data ?? []);

  return (
    <section className="flex-1 bg-muted/30">
      <div className="bg-emerald-700 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-emerald-100">
            İstanbul şarj ağı
          </p>

          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Şarj noktalarını keşfet
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100 sm:text-base">
            Tarih, saat ve konnektör özelliklerini seçerek uygun
            şarj noktalarını görüntüle.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isAvailabilityMode
                  ? 'Müsait istasyonlar'
                  : 'İstasyonlar'}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isAvailabilityMode && availabilityQuery.data
                  ? `${availabilityQuery.data.summary.availableStationCount} istasyon ve ${availabilityQuery.data.summary.availableConnectorCount} konnektör uygun.`
                  : null}

                {!isAvailabilityMode && stationsQuery.data
                  ? `${stationsQuery.data.length} istasyon bulundu.`
                  : null}

                {isPending ? 'İstasyonlar yükleniyor...' : null}
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
              {isFetching && !isPending ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin" />
                  Yenileniyor
                </span>
              ) : null}

              <div
                role="group"
                aria-label="İstasyon görünümü"
                className="inline-flex rounded-lg border bg-background p-1"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid className="size-4" />
                  <span className="hidden sm:inline">Liste</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  aria-pressed={viewMode === 'map'}
                  onClick={() => setViewMode('map')}
                >
                  <Map className="size-4" />
                  <span className="hidden sm:inline">Harita</span>
                </Button>
              </div>

              <Dialog
                open={isSearchDialogOpen}
                onOpenChange={setIsSearchDialogOpen}
              >
                <DialogTrigger render={<Button />}>
                  <CalendarSearch className="size-4" />
                  Müsaitlik sorgula
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Müsaitlik sorgula</DialogTitle>

                    <DialogDescription>
                      İstanbul saatine göre tarih, süre ve konnektör
                      filtrelerini seçin.
                    </DialogDescription>
                  </DialogHeader>

                  <AvailabilitySearchForm
                    isSearching={availabilityQuery.isFetching}
                    onSearch={handleAvailabilitySearch}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isPending ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-80 rounded-xl"
                />
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <h2 className="font-semibold">
                İstasyonlar yüklenemedi
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                API bağlantısını ve seçtiğiniz değerleri kontrol
                edip tekrar deneyin.
              </p>

              <Button
                className="mt-4"
                onClick={handleRefetch}
              >
                Tekrar dene
              </Button>
            </div>
          ) : null}

          {viewMode === 'list' && !isAvailabilityMode && stationsQuery.data ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stationsQuery.data.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                />
              ))}
            </div>
          ) : null}

          {viewMode === 'list' &&
            isAvailabilityMode &&
            availabilityQuery.data &&
            availabilityQuery.data.stations.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {availabilityQuery.data.stations.map((station) => (
                <AvailableStationCard
                  key={station.id}
                  station={station}
                />
              ))}
            </div>
          ) : null}

          {viewMode === 'map' &&
            !isPending &&
            !isError &&
            hasVisibleStations ? (
            <StationMap stations={visibleStations} />
          ) : null}

          {isAvailabilityMode &&
            availabilityQuery.data &&
            availabilityQuery.data.stations.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <h2 className="font-semibold">
                Uygun istasyon bulunamadı
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Farklı bir saat, süre veya konnektör filtresi
                deneyin.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}