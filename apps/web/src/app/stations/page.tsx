"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StationCard } from "@/features/stations/components/station-card";
import { useStations } from "@/features/stations/hooks/use-stations";
import { RefreshCw } from "lucide-react";

export default function StationsPage() {
  const {
    data: stations,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useStations();

  return (
    <section className="flex-1">
      <div className="border-b bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            İstanbul Şarj Ağı
          </p>

          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Şehrindeki şarj noktalarını keşfet
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100 sm:text-base">
            Güncel konnektör durumlarını, güçlerini ve
            fiyatlarını tek ekranda görüntüle.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Şarj İstasyonları</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {stations
                ? `${stations.length} istasyon bulundu.`
                : "İstasyonlar yükleniyor..."
              }
            </p>
          </div>

          {isFetching && !isPending ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 animate-spin" />
              Yenileniyor
            </span>
          ) : null}
        </div>

        {isPending ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  className="h-80 rounded-xl"
                />
              ),
            )}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <h2 className="font-semibold">
              İstasyonlar yüklenemedi
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              API bağlantısını kontrol edip tekrar deneyin.
            </p>

            <Button
              className="mt-4"
              onClick={() => void refetch()}
            >
              Tekrar dene
            </Button>
          </div>
        ) : null}

        {stations ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}