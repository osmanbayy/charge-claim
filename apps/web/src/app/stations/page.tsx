'use client';

import { useState } from 'react';
import { CalendarSearch, RefreshCw, Map, LayoutGrid, ArrowDown, Zap, ShieldCheck, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilitySearchForm } from '@/features/availability/components/availability-search-form';
import { AvailableStationCard } from '@/features/availability/components/available-station-card';
import { useAvailability } from '@/features/availability/hooks/use-availability';
import type { AvailabilityQueryParams, AvailableConnector, AvailableStation } from '@/features/availability/types/availability';
import { StationCard } from '@/features/stations/components/station-card';
import { useStationPage, useStations } from '@/features/stations/hooks/use-stations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StationMap } from '@/features/stations/components/station-map';
import { ReservationConfirmationDialog, type ReservationSelection } from '@/features/reservations/components/reservation-confirm-dialog';
import { PaginationControls } from '@/features/stations/components/pagination-control';

type StationViewMode = 'list' | 'map';
const STATION_PAGE_SIZE = 10;

export default function StationsPage() {
  const [availabilityParams, setAvailabilityParams] =
    useState<AvailabilityQueryParams | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<StationViewMode>('list');
  const [reservationSelection, setReservationSelection] = useState<ReservationSelection | null>(null);
  const [page, setPage] = useState(1);

  const isAvailabilityMode = availabilityParams !== null;

  const paginatedStationsQuery = useStationPage(
    page,
    STATION_PAGE_SIZE,
    !isAvailabilityMode && viewMode === 'list',
  );

  const mapStationsQuery = useStations(
    !isAvailabilityMode && viewMode === 'map',
  );

  const availabilityQuery = useAvailability(availabilityParams);

  const normalStationsQuery =
    viewMode === 'list'
      ? paginatedStationsQuery
      : mapStationsQuery;

  const isPending = isAvailabilityMode
    ? availabilityQuery.isPending
    : normalStationsQuery.isPending;

  const isError = isAvailabilityMode
    ? availabilityQuery.isError
    : normalStationsQuery.isError;

  const isFetching = isAvailabilityMode
    ? availabilityQuery.isFetching
    : normalStationsQuery.isFetching;

  function handleAvailabilitySearch(
    params: AvailabilityQueryParams,
  ): void {
    setAvailabilityParams(params);
    setIsSearchDialogOpen(false);
  }

  const hasVisibleStations = isAvailabilityMode
    ? (availabilityQuery.data?.stations.length ?? 0) > 0
    : (mapStationsQuery.data?.length ?? 0) > 0;

  const visibleStations = isAvailabilityMode
    ? (availabilityQuery.data?.stations ?? [])
    : (mapStationsQuery.data ?? []);

  const totalStationCount =
    viewMode === 'list'
      ? paginatedStationsQuery.data?.meta.totalItems
      : mapStationsQuery.data?.length;

  function handleReservationSelection(
    station: AvailableStation,
    connector: AvailableConnector,
  ): void {
    setReservationSelection({ station, connector });
  }

  function handleStationPageChange(nextPage: number): void {
    setPage(nextPage);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const stationsSection =
          document.getElementById('stations');

        if (!stationsSection) {
          return;
        }

        const headerOffset = 96;

        const targetPosition =
          stationsSection.getBoundingClientRect().top +
          window.scrollY -
          headerOffset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  return (
    <section className="flex-1">
      <div className="station-hero relative isolate overflow-hidden border-b border-white/10 text-white shadow-[0_35px_90px_-48px_black]">
        <div className="absolute right-[9%] top-1/2 -z-10 size-105 -translate-y-1/2 rounded-full border border-white/8 shadow-[inset_0_0_80px_rgb(52_211_153/.035)]" />
        <div className="absolute right-[15%] top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full border border-emerald-200/12" />
        <div className="absolute right-[21%] top-1/2 -z-10 size-40 -translate-y-1/2 rounded-full border border-emerald-200/15 bg-emerald-300/[.025] backdrop-blur-sm" />
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-18 sm:px-6 sm:py-24 lg:grid-cols-[1fr_360px] lg:items-end lg:px-8 lg:py-28">
          <div>
            <p className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.2em] text-emerald-200">
              <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-emerald-300" /> İstanbul şarj ağı
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">
              Şehrin enerjisi<br /><span className="bg-linear-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">sana hazır.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Tarih, saat ve konnektör özelliklerini seçerek uygun
              şarj noktalarını görüntüle.
            </p>
            <a href="#stations" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition-colors hover:text-white">İstasyonları keşfet <ArrowDown className="size-4" /></a>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/6 p-3 shadow-2xl backdrop-blur-xl lg:grid-cols-1">
            {[{ icon: Zap, label: 'Anlık durum', text: 'Canlı bağlantı' }, { icon: Clock3, label: 'Planlı şarj', text: 'Kolay rezervasyon' }, { icon: ShieldCheck, label: 'Güvenli ağ', text: 'Doğrulanmış istasyonlar' }].map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-black/10 p-4 sm:flex-row sm:items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><Icon className="size-5" /></span>
                <div><p className="text-sm font-semibold">{label}</p><p className="mt-0.5 text-xs text-slate-400">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="stations" className="mx-auto w-full max-w-7xl space-y-8 scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div>
          <div className="premium-panel mb-8 flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-.03em]">
                {isAvailabilityMode
                  ? 'Müsait istasyonlar'
                  : 'İstasyonlar'}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isAvailabilityMode && availabilityQuery.data
                  ? `${availabilityQuery.data.summary.availableStationCount} istasyon ve ${availabilityQuery.data.summary.availableConnectorCount} konnektör uygun.`
                  : null}

                {!isAvailabilityMode && totalStationCount !== undefined
                  ? `${totalStationCount} istasyon bulundu.`
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
                className="inline-flex rounded-xl border border-border/70 bg-muted/60 p-1"
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

          {viewMode === 'list' && !isAvailabilityMode && paginatedStationsQuery.data ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedStationsQuery.data.items.map((station) => (
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
                  onReserve={handleReservationSelection}
                />
              ))}
            </div>
          ) : null}

          {viewMode === 'list' &&
            !isAvailabilityMode &&
            paginatedStationsQuery.data ? (
            <PaginationControls
              currentPage={page}
              totalPages={
                paginatedStationsQuery.data.meta.totalPages
              }
              hasPreviousPage={
                paginatedStationsQuery.data.meta.hasPreviousPage
              }
              hasNextPage={
                paginatedStationsQuery.data.meta.hasNextPage
              }
              disabled={paginatedStationsQuery.isFetching}
              onPageChange={handleStationPageChange}
            />
          ) : null}

          {viewMode === 'list' &&
            !isAvailabilityMode &&
            paginatedStationsQuery.data?.items.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <h2 className="font-semibold">
                İstasyon bulunamadı
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Henüz görüntülenecek bir istasyon bulunmuyor.
              </p>
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

      <ReservationConfirmationDialog
        selection={reservationSelection}
        range={availabilityQuery.data?.range ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setReservationSelection(null);
          }
        }}
      />
    </section>
  );
}
