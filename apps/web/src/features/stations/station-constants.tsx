import { ConnectorCurrentStatus } from "./types/station";

export const statusLabels: Record<
  ConnectorCurrentStatus,
  string
> = {
  AVAILABLE: "Müsait",
  OCCUPIED: "Kullanımda",
  RESERVED: "Rezerve",
  MAINTENANCE: "Bakımda",
};

export const statusClasses: Record<
  ConnectorCurrentStatus,
  string
> = {
  AVAILABLE:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  OCCUPIED:
    "border-orange-200 bg-orange-50 text-orange-700",
  RESERVED:
    "border-blue-200 bg-blue-50 text-blue-700",
  MAINTENANCE:
    "border-red-200 bg-red-50 text-red-700",
};