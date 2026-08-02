import type { Telemetry, Vehicle } from "../types/vehicle";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchVehicles(): Promise<Vehicle[]> {
  return getJson<Vehicle[]>("/vehicles");
}

export function fetchVehicle(id: string): Promise<Vehicle> {
  return getJson<Vehicle>(`/vehicles/${id}`);
}

export function fetchTelemetry(id: string): Promise<Telemetry> {
  return getJson<Telemetry>(`/vehicles/${id}/telemetry`);
}
