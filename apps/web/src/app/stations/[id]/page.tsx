import { notFound } from "next/navigation";
import { StationDetail } from "@/features/stations/components/station-detail";

interface StationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StationDetailPage({
  params,
}: StationDetailPageProps) {
  const { id } = await params;
  const stationId = Number(id);

  if (!Number.isInteger(stationId) || stationId < 1) {
    notFound();
  }

  return <StationDetail stationId={stationId} />;
}