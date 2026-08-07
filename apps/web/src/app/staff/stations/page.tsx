"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  MapPin,
  Plus,
  PlugZap,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStations } from "@/features/stations/hooks/use-stations";
import { cn } from "@/lib/utils";

export default function StaffStationsPage() {
  const {
    data: stations,
    isLoading,
    isError,
    refetch,
  } = useStations();

  return (
    <div className="flex-1 bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Personel yönetimi
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              İstasyonlar
            </h1>

            <p className="mt-2 text-muted-foreground">
              İstanbul’daki şarj istasyonlarını ve connector’larını yönetin.
            </p>
          </div>

          <Link
            href="/staff/stations/new"
            className={cn(
              buttonVariants(),
              "bg-emerald-600 hover:bg-emerald-700 text-white",
            )}
          >
            <Plus data-icon="inline-start" className="size-4" />
            Yeni istasyon
          </Link>
        </section>

        {isLoading && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>

                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </section>
        )}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle />

            <AlertDescription className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <span>İstasyonlar yüklenirken bir hata oluştu.</span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                <RefreshCw data-icon="inline-start" className="size-4" />
                Tekrar dene
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && stations?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <MapPin className="size-10 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                Henüz istasyon bulunmuyor
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                İlk şarj istasyonunu oluşturarak başlayabilirsiniz.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && stations && stations.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {
              stations.map((station) => {
                const availableConnectorCount =
                  station.connectors.filter((connector) => connector.currentStatus === 'AVAILABLE').length;

                return (
                  <Card key={station.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{station.name}</CardTitle>

                          <CardDescription className="mt-1">{station.district}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                        </div>

                        <div className="flex items-center gap-2">
                          <PlugZap className="size-4 text-emerald-700" />

                          <span>
                            {station.connectors.length} konnektör
                          </span>

                          <Badge variant={"outline"} className="ml-auto text-emerald-700">
                            {availableConnectorCount} müsait
                          </Badge>
                        </div>
                      </div>

                      <Link
                        href={`/staff/stations/${station.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "mt-6 w-full"
                        )}
                      >
                        İstasyonu yönet
                        <ArrowRight data-icon="inline-end" className="size-4" />
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            }
          </section>
        )}
      </div>
    </div>
  )
}