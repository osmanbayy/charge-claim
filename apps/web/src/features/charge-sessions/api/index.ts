import { apiClient } from "@/lib/api/client";
import type { ChargingSession, StartChargingFromReservationInput, StartWalkInChargingInput } from "../types/charging-session";

export async function startChargingFromReservation(
  input: StartChargingFromReservationInput,
): Promise<ChargingSession> {
  const response = await apiClient.post<ChargingSession>('/charging-sessions/from-reservation', input);
  return response.data;
}

export async function startWalkInCharging(
  input: StartWalkInChargingInput,
): Promise<ChargingSession> {
  const response = await apiClient.post<ChargingSession>('/charging-sessions/walk-in', input);
  return response.data;
}

export async function stopChargingSession(
  sessionId: number,
): Promise<ChargingSession> {
  const response = await apiClient.patch<ChargingSession>(`/charging-sessions/${sessionId}/stop`);
  return response.data;
}

export async function getActiveChargingSession(): Promise<ChargingSession | null> {
  const response = await apiClient.get<ChargingSession | null>('/charging-sessions/active');
  return response.data;
}

export async function getChargingSessions(): Promise<ChargingSession[]> {
  const response = await apiClient.get<ChargingSession[]>('/charging-sessions');
  return response.data;
}