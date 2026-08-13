"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, MapPinned } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStation } from "@/features/stations/hooks/use-create-station";

export default function NewStationPage() {
  const router = useRouter();
  const createStation = useCreateStation();

  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await createStation.mutateAsync({
        name,
        district,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      router.push("/staff/stations");
    } catch {
      setErrorMessage(
        "İstasyon oluşturulamadı. Alanları kontrol edip tekrar deneyin.",
      );
    }
  }

  return (
    <div className="flex-1 bg-muted/10">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Link
          href="/staff/stations"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft data-icon="inline-start" className="size-4" />
          İstasyonlara dön
        </Link>

        <Card className="rounded-3xl border-white/8 bg-card/90">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <MapPinned className="size-5" />
            </div>

            <CardTitle className="text-2xl">Yeni istasyon</CardTitle>

            <CardDescription>
              İstanbul’da hizmet verecek şarj istasyonunun temel bilgilerini
              girin.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">İstasyon adı</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Kadıköy Şarj İstasyonu"
                  maxLength={150}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="Kadıköy"
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Caferağa Mahallesi, Kadıköy/İstanbul"
                  maxLength={255}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Enlem</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="40.9909"
                    min={-90}
                    max={90}
                    step="any"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Boylam</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="29.0288"
                    min={-180}
                    max={180}
                    step="any"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/staff/stations"
                  className={buttonVariants({ variant: "outline" })}
                >
                  İptal
                </Link>

                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={createStation.isPending}
                >
                  {createStation.isPending
                    ? "İstasyon oluşturuluyor..."
                    : "İstasyonu oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
