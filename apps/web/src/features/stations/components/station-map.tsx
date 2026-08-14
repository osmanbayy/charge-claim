'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plug } from 'lucide-react';
import Map, {
  Marker,
  NavigationControl,
  Popup,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { buttonVariants } from '@/components/ui/button';

const ISTANBUL_LONGITUDE = 29.01;
const ISTANBUL_LATITUDE = 41.04;

interface MappableConnector {
  id: number;
}

interface MappableStation {
  id: number;
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: MappableConnector[];
}

interface StationMapProps {
  stations: readonly MappableStation[];
}

export function StationMap({
  stations,
}: StationMapProps) {
  const [selectedStationId, setSelectedStationId] =
    useState<number | null>(null);

  const selectedStation = stations.find(
    (station) => station.id === selectedStationId,
  );

  return (
    <div className="h-105 overflow-hidden rounded-3xl border border-white/8 shadow-[0_24px_70px_-35px_black] sm:h-130">
      <Map
        initialViewState={{
          longitude: ISTANBUL_LONGITUDE,
          latitude: ISTANBUL_LATITUDE,
          zoom: 9.5,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/dark"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <NavigationControl
          position="top-right"
          showCompass={false}
        />

        {stations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.longitude}
            latitude={station.latitude}
            anchor="bottom"
          >
            <button
              type="button"
              aria-label={`${station.name} istasyonunu göster`}
              className="rounded-full text-emerald-600 drop-shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedStationId(station.id);
              }}
            >
              <MapPin
                className="size-9 fill-emerald-600 text-white"
                strokeWidth={1.75}
              />
            </button>
          </Marker>
        ))}

        {selectedStation ? (
          <Popup
            className="station-map-popup"
            longitude={selectedStation.longitude}
            latitude={selectedStation.latitude}
            anchor="bottom"
            offset={38}
            closeOnClick={false}
            onClose={() => setSelectedStationId(null)}
          >
            <div className="min-w-52 space-y-2 p-1 text-foreground">
              <div>
                <h3 className="font-semibold">
                  {selectedStation.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {selectedStation.district}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                {selectedStation.address}
              </p>

              <div className="flex items-center gap-1.5 text-sm">
                <Plug className="size-4 text-emerald-600" />

                <span>
                  {selectedStation.connectors.length} konnektör
                </span>
              </div>

              <Link
                href={`/stations/${selectedStation.id}`}
                className={buttonVariants({
                  size: 'sm',
                  className: 'w-full',
                })}
              >
                İstasyonu görüntüle
              </Link>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
