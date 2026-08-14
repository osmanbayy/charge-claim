'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Power, Save, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { useManageStation } from '@/features/stations/hooks/use-manage-station';
import { useStation } from '@/features/stations/hooks/use-stations';
import type { ConnectorType } from '@/features/stations/types/station';

export default function ManageStationPage() {
  const params = useParams<{ id: string }>();
  const stationId = Number(params.id);
  const stationQuery = useStation(stationId);
  const { stationMutation, connectorMutation, statusMutation } = useManageStation(stationId);
  const [code, setCode] = useState('');
  const [type, setType] = useState<ConnectorType>('TYPE_2');
  const [powerKw, setPowerKw] = useState('');
  const [pricePerKWh, setPricePerKWh] = useState('');
  const [maintenanceConnector, setMaintenanceConnector] = useState<{
    id: number;
    code: string;
  } | null>(null);

  async function saveStation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await stationMutation.mutateAsync({
      name: String(form.get('name')),
      district: String(form.get('district')),
      address: String(form.get('address')),
    });
  }

  async function addConnector(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await connectorMutation.mutateAsync({
        code: code.trim(),
        type,
        powerKw: powerKw.trim().replace(',', '.'),
        pricePerKWh: pricePerKWh.trim().replace(',', '.'),
      });

      setCode('');
      setPowerKw('');
      setPricePerKWh('');
    } catch {
      // Mutation errors are displayed globally by Sonner.
    }
  }

  async function confirmMaintenance(): Promise<void> {
    if (maintenanceConnector === null) return;

    try {
      await statusMutation.mutateAsync({
        id: maintenanceConnector.id,
        status: 'MAINTENANCE',
      });
      setMaintenanceConnector(null);
    } catch {
      // Mutation errors are displayed globally by Sonner.
    }
  }

  if (!Number.isInteger(stationId) || stationId < 1) {
    notFound();
  }

  return (
    <div className="flex-1 bg-muted/20">
      <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/staff/stations" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="size-4" />
          İstasyonlara dön
        </Link>
        {stationQuery.isPending ? <Skeleton className="h-96 rounded-3xl" /> : null}

        {stationQuery.data ? (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-[#071f23] px-6 py-8 text-white shadow-2xl sm:px-9">
              <div className="absolute -right-20 -top-28 size-72 rounded-full border border-emerald-300/15" />
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-300">İstasyon kontrol merkezi</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{stationQuery.data.name}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="size-4 text-emerald-300" />
                {stationQuery.data.district} · {stationQuery.data.address}</p>
            </section>

            <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
              <Card className="premium-panel rounded-3xl">
                <CardHeader>
                  <CardTitle>İstasyon bilgileri</CardTitle>
                  <CardDescription>Konumun temel görünen bilgilerini güncelleyin.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={saveStation}>
                    <div className="space-y-2">
                      <Label htmlFor="name">İstasyon adı</Label>
                      <Input id="name" name="name" defaultValue={stationQuery.data.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">İlçe</Label>
                      <Input id="district" name="district" defaultValue={stationQuery.data.district} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Input id="address" name="address" defaultValue={stationQuery.data.address} required />
                    </div>
                    <Button disabled={stationMutation.isPending}>
                      <Save className="size-4" />
                      {stationMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="premium-panel rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Plus className="size-5 text-emerald-600" />Yeni konnektör</CardTitle>
                  <CardDescription>Bu istasyona yeni bir şarj ünitesi ekleyin.</CardDescription>
                </CardHeader>

                <CardContent>
                  <form className="grid gap-4 sm:grid-cols-2" onSubmit={addConnector}>
                    <div className="space-y-2">
                      <Label htmlFor="code">Kod</Label>
                      <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CCS-01" minLength={2} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tip</Label>
                      <select
                        id="type"
                        className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value as ConnectorType)}
                      >
                        <option value="TYPE_2">Type 2</option>
                        <option value="CCS2">CCS2</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="power">Güç (kW)</Label>
                      <Input
                        id="power"
                        inputMode="decimal"
                        value={powerKw}
                        onChange={(e) => setPowerKw(e.target.value)}
                        placeholder="22.00"
                        pattern="^(?!0+(?:[.,]0{1,2})?$)\d{1,4}(?:[.,]\d{1,2})?$"
                        title="En fazla 4 tam ve 2 ondalık basamaklı pozitif bir değer girin."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Fiyat (₺/kWh)</Label>
                      <Input
                        id="price"
                        inputMode="decimal"
                        value={pricePerKWh}
                        onChange={(e) => setPricePerKWh(e.target.value)}
                        placeholder="8.50"
                        pattern="^(?!0+(?:[.,]0{1,2})?$)\d{1,8}(?:[.,]\d{1,2})?$"
                        title="En fazla 8 tam ve 2 ondalık basamaklı pozitif bir değer girin."
                        required
                      />
                    </div>
                    <Button type="submit" className="sm:col-span-2" disabled={connectorMutation.isPending}>
                      <Plus className="size-4" />
                      {connectorMutation.isPending ? 'Ekleniyor...' : 'Konnektör ekle'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-.03em]">Konnektörler</h2>
                <p className="mt-1 text-sm text-muted-foreground">Aktiflik ve bakım durumunu buradan yönetin.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {stationQuery.data.connectors.map((connector) => {
                  const inMaintenance = connector.operationalStatus === 'MAINTENANCE';

                  return <Card key={connector.id} className="rounded-2xl border-white/8">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <Zap className="size-5" />
                        </span>
                        <Badge
                          variant="outline"
                          className={inMaintenance ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}>
                          {inMaintenance ? 'Bakımda' : 'Aktif'}
                        </Badge>
                      </div>
                      <CardTitle className="pt-2">{connector.code}</CardTitle>
                      <CardDescription>{connector.type === 'TYPE_2' ? 'Type 2' : 'CCS2'} · {connector.powerKw} kW · {connector.pricePerKWh} ₺/kWh
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={statusMutation.isPending || (!inMaintenance && connector.currentStatus !== 'AVAILABLE')}
                        onClick={() => {
                          if (inMaintenance) {
                            statusMutation.mutate({
                              id: connector.id,
                              status: 'ACTIVE',
                            });
                            return;
                          }

                          setMaintenanceConnector({
                            id: connector.id,
                            code: connector.code,
                          });
                        }}
                      >
                        <Power className="size-4" />
                        {inMaintenance ? 'Aktifleştir' : 'Bakıma al'}
                      </Button>
                    </CardContent>
                  </Card>;
                })}</div>
            </section>
          </>
        ) : null}

        <ConfirmActionDialog
          open={maintenanceConnector !== null}
          title="Konnektörü bakıma almak istiyor musunuz?"
          description={`${maintenanceConnector?.code ?? 'Seçilen konnektör'} bakımdayken yeni rezervasyon ve şarj işlemleri için kullanılamaz.`}
          confirmLabel="Bakıma al"
          pendingLabel="Bakıma alınıyor..."
          isPending={statusMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setMaintenanceConnector(null);
          }}
          onConfirm={() => void confirmMaintenance()}
        />
      </div>
    </div>
  );
}
