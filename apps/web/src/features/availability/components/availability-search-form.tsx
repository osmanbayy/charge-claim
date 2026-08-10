'use client';

import { useState, type SubmitEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AvailabilityQueryParams } from '../types/availability';
import { DISTRICT_OPTIONS, DURATION_OPTIONS, MILLISECONDS_PER_MINUTE } from '@/lib/constants';
import type { ConnectorType } from '@/features/stations/types/station';

interface AvailabilitySearchFormProps {
  isSearching: boolean;
  onSearch: (params: AvailabilityQueryParams) => void;
  showFilters?: boolean;
}

export function AvailabilitySearchForm({
  isSearching,
  onSearch,
  showFilters = true,
}: AvailabilitySearchFormProps) {
  const [startAtLocal, setStartAtLocal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [district, setDistrict] = useState('ALL');
  const [connectorType, setConnectorType] = useState<ConnectorType | 'ALL'>('ALL');
  const [minPowerKw, setMinPowerKw] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();

    const startAt = new Date(`${startAtLocal}:00+03:00`);

    if (Number.isNaN(startAt.getTime())) return;

    const durationMilliseconds = Number(durationMinutes) * MILLISECONDS_PER_MINUTE;

    const endAt = new Date(startAt.getTime() + durationMilliseconds);

    const parsedMinPowerKw = minPowerKw.trim() === '' ? undefined : Number(minPowerKw);

    onSearch({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      district: district === 'ALL' ? undefined : district,
      connectorType: connectorType === 'ALL' ? undefined : connectorType,
      minPowerKw:
        parsedMinPowerKw !== undefined && Number.isFinite(parsedMinPowerKw)
          ? parsedMinPowerKw
          : undefined,
    })
  }

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      {/* Start at filter: required */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="availability-start-at">Başlangıç tarihi ve saati</Label>

        <Input
          id='availability-start-at'
          type='datetime-local'
          value={startAtLocal}
          onChange={(event) => setStartAtLocal(event.target.value)}
          step={1800}
          required
        />

        <p className="text-xs text-muted-foreground">İstanbul saatine göre seçin.</p>
      </div>

      {/* Duration time filter: required */}
      <div className="space-y-2">
        <Label htmlFor='availability-duration'>Süre</Label>

        <Select
          value={durationMinutes}
          onValueChange={(value) => {
            if (typeof value === 'string')
              setDurationMinutes(value);
          }}
        >
          <SelectTrigger
            id='availability-duration'
            className="h-9 w-full"
          >
            <SelectValue>
              {durationMinutes} dakika
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {DURATION_OPTIONS.map((duration) => (
              <SelectItem
                key={duration}
                value={String(duration)}
              >
                {duration} dakika
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showFilters ? (
        <>
      {/* District filter */}
      <div className="space-y-2">
        <Label htmlFor="availability-district">İlçe</Label>

        <Select
          value={district}
          onValueChange={(value) => {
            if (typeof value === 'string') setDistrict(value);
          }}
        >
          <SelectTrigger
            id="availability-district"
            className="h-9 w-full"
          >
            <SelectValue>
              {district === 'ALL' ? 'Tüm ilçeler' : district}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Tüm ilçeler</SelectItem>

            {DISTRICT_OPTIONS.map((districtOption) => (
              <SelectItem
                key={districtOption}
                value={districtOption}
              >
                {districtOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Connector type filter */}
      <div className="space-y-2">
        <Label htmlFor="availability-connector-type">Konnektör</Label>

        <Select
          value={connectorType}
          onValueChange={(value) => {
            if (
              value === 'ALL' ||
              value === 'TYPE_2' ||
              value === 'CCS2'
            ) setConnectorType(value);
          }}
        >
          <SelectTrigger
            id="availability-connector-type"
            className="h-9 w-full"
          >
            <SelectValue>
              {connectorType === 'ALL'
                ? 'Tüm tipler'
                : connectorType.replace('_', ' ')}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Tüm tipler</SelectItem>
            <SelectItem value="TYPE_2">Type 2</SelectItem>
            <SelectItem value="CCS2">CCS2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Min power filter */}
      <div className="space-y-2">
        <Label htmlFor='availability-min-power'>Minimum güç</Label>

        <Input
          id="availability-min-power"
          type="number"
          value={minPowerKw}
          onChange={(event) => setMinPowerKw(event.target.value)}
          placeholder="Örn. 22"
          min={1}
          step={1}
        />
      </div>
        </>
      ) : null}

      <Button
        type='submit'
        className="md:col-span-2"
        disabled={isSearching || startAtLocal === ''}
      >
        <Search className='size-4' />
        {isSearching ? 'Aranıyor...' : 'Müsaitlik Ara'}
      </Button>
    </form>
  )
}
