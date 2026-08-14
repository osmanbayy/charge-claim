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
import { buttonVariants } from '@/components/ui/button';
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

  return (
    <div className="flex-1 bg-muted/20">
      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="mac-hero relative isolate overflow-hidden rounded-[20px] px-6 py-12 text-white sm:px-10 lg:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_20%,oklch(0.7_0.16_165/.3),transparent_24rem)]" />
          <div className="absolute inset-0 -z-10 opacity-[.05] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[64px_64px]" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex max-w-2xl flex-col gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                <ShieldCheck className="size-6" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-300">
                  Personel yönetim alanı
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">
                  Operasyon dashboard&apos;u
                </h1>

                <p className="mt-4 max-w-xl leading-7 text-slate-300">
                  Şarj ağının canlı durumunu takip edin,
                  istatistikleri inceleyin ve istasyonları
                  yönetin.
                </p>
              </div>
            </div>

            <Link
              href="/staff/stations"
              className={buttonVariants()}
            >
              <MapPinned className="size-4" />
              İstasyonları yönet
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-emerald-600" />

                <h2 className="text-2xl font-semibold tracking-[-.03em]">
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

        <section className="space-y-6 rounded-3xl border border-white/8 bg-white/2.5 p-5 shadow-[0_24px_70px_-45px_black] backdrop-blur-xl sm:p-7">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-.03em]">
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

          {statisticsQuery.data ? (
            <StatisticsCards
              statistics={statisticsQuery.data}
            />
          ) : null}
        </section>

        <section>
          <Card className="overflow-hidden rounded-3xl border-emerald-400/15 bg-card shadow-[0_20px_60px_-42px_black]">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
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
