import Link from "next/link";
import { ArrowRight, MapPinned, PlugZap, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StaffPage() {
  return (
    <div className="flex-1 bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <section className="rounded-2xl bg-emerald-700 px-6 py-10 text-white sm:px-10">
          <div className="flex max-w-2xl flex-col gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="size-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-emerald-100">
                Personel yönetim alanı
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Charge Claim yönetimi
              </h1>

              <p className="mt-3 text-emerald-50/90">
                İstasyonları ve bu istasyonlara bağlı şarj connector’larını
                buradan yönetebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MapPinned className="size-5" />
              </div>

              <CardTitle>İstasyon yönetimi</CardTitle>

              <CardDescription>
                İstasyonları listeleyin, yeni istasyon ekleyin ve mevcut
                bilgileri güncelleyin.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Link
                href="/staff/stations"
                className={buttonVariants({ variant: "outline" })}
              >
                İstasyonları yönet
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <PlugZap className="size-5" />
              </div>

              <CardTitle>Connector yönetimi</CardTitle>

              <CardDescription>
                İstasyonlara connector ekleyin ve mevcut connector bilgilerini
                güncelleyin.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Link
                href="/staff/stations"
                className={buttonVariants({ variant: "outline" })}
              >
                Connector’ları yönet
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}