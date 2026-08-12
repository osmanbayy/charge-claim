'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  MapPinned,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveSessionsTable } from '@/features/dashboard/components/active-sessions-table';
import { ConnectorSummaryCards } from '@/features/dashboard/components/connector-summary-cards';
import { StationStatusTable } from '@/features/dashboard/components/station-status-table';
import { StatisticsCards } from '@/features/dashboard/components/statistics-cards';
import { StatisticsFilterForm } from '@/features/dashboard/components/statistics-filter-form';
import { UpcomingReservationsTable } from '@/features/dashboard/components/upcoming-reservations-table';
import { useStaffDashboardLive } from '@/features/dashboard/hooks/use-staff-dashboard-live';
import { useStaffDashboardStatistics } from '@/features/dashboard/hooks/use-staff-dashboard-statistics';
import type { DashboardStatisticsParams } from '@/features/dashboard/types/dashboard';
import { useStations } from '@/features/stations/hooks/use-stations';

function createDefaultStatisticsParams(): DashboardStatisticsParams {
  const currentDate = new Date();

  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 6,
  );

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + 1,
  );

  return {
    startAt: startDate.toISOString(),
    endAt: endDate.toISOString(),
  };
}

export default function StaffPage() {
  const [statisticsParams, setStatisticsParams] =
    useState<DashboardStatisticsParams>(
      createDefaultStatisticsParams,
    );

  const liveQuery = useStaffDashboardLive();

  const statisticsQuery =
    useStaffDashboardStatistics(statisticsParams);

  const stationsQuery = useStations();

  const stations = stationsQuery.data ?? [];

  function handleLiveRefetch(): void {
    void Promise.all([
      liveQuery.refetch(),
      stationsQuery.refetch(),
    ]);
  }

  return (
    <div className="flex-1 bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-emerald-700 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex max-w-2xl flex-col gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck className="size-6" />
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-100">
                  Personel yönetim alanı
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Operasyon dashboard&apos;u
                </h1>

                <p className="mt-3 text-emerald-50/90">
                  Şarj ağının canlı durumunu takip edin,
                  istatistikleri inceleyin ve istasyonları
                  yönetin.
                </p>
              </div>
            </div>

            <Link
              href="/staff/stations"
              className={buttonVariants({
                variant: 'outline',
              })}
            >
              <MapPinned className="size-4" />
              İstasyonları yönet
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-emerald-600" />

                <h2 className="text-2xl font-semibold">
                  Canlı operasyon
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Connector, şarj ve rezervasyon durumu her
                10 saniyede bir yenilenir.
              </p>
            </div>

            {liveQuery.isFetching &&
            !liveQuery.isPending ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="size-4 animate-spin" />
                Yenileniyor
              </span>
            ) : null}
          </div>

          {liveQuery.isPending ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      className="h-32 rounded-xl"
                    />
                  ),
                )}
              </div>

              <Skeleton className="h-80 rounded-xl" />
            </div>
          ) : null}

          {liveQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <h3 className="font-semibold">
                Canlı dashboard yüklenemedi
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                API bağlantısını kontrol edip tekrar deneyin.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={handleLiveRefetch}
              >
                <RefreshCw className="size-4" />
                Tekrar dene
              </Button>
            </div>
          ) : null}

          {liveQuery.data ? (
            <div className="space-y-5">
              <ConnectorSummaryCards
                summary={
                  liveQuery.data.connectorSummary
                }
              />

              <StationStatusTable
                stations={
                  liveQuery.data.stationSummaries
                }
              />

              <div className="grid gap-5 xl:grid-cols-2">
                <ActiveSessionsTable
                  sessions={
                    liveQuery.data.activeSessions
                  }
                  stations={stations}
                />

                <UpcomingReservationsTable
                  reservations={
                    liveQuery.data.upcomingReservations
                  }
                  stations={stations}
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">
              Tarih aralığı istatistikleri
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Rezervasyon, no-show, enerji ve gelir
              metriklerini filtreleyin.
            </p>
          </div>

          <StatisticsFilterForm
            stations={stations}
            isLoading={statisticsQuery.isFetching}
            onSubmit={setStatisticsParams}
          />

          {statisticsQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 7 }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-32 rounded-xl"
                  />
                ),
              )}
            </div>
          ) : null}

          {statisticsQuery.isError ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle>
                  İstatistikler yüklenemedi
                </CardTitle>

                <CardDescription>
                  Tarih aralığını ve API bağlantısını
                  kontrol edin.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  type="button"
                  onClick={() => {
                    void statisticsQuery.refetch();
                  }}
                >
                  <RefreshCw className="size-4" />
                  Tekrar dene
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {statisticsQuery.data ? (
            <StatisticsCards
              statistics={statisticsQuery.data}
            />
          ) : null}
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MapPinned className="size-5" />
              </div>

              <CardTitle>
                İstasyon ve connector yönetimi
              </CardTitle>

              <CardDescription>
                Yeni istasyon ekleyin, connector bilgilerini
                güncelleyin ve bakım durumunu yönetin.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Link
                href="/staff/stations"
                className={buttonVariants({
                  variant: 'outline',
                })}
              >
                Yönetim ekranına git
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}