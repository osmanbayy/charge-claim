import { apiClient } from "@/lib/api/client";
import type { CreateReservationInput, Reservation } from "../types/reservation";

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  const response = await apiClient.post<Reservation>(
    "/reservations",
    input,
  );

  return response.data;
}

export async function getReservations(): Promise<Reservation[]> {
  const response = await apiClient.get<Reservation[]>("/reservations");

  return response.data;
}

export async function cancelReservation(reservationId: number): Promise<Reservation> {
  const response = await apiClient.patch<Reservation>(`/reservations/${reservationId}/cancel`);

  return response.data;
}