import type { Telemetry, Vehicle } from "../types/vehicle";
import type {
  AuthResponse,
  MessageResponse,
  RegisterResponse,
} from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Thrown by postJson on a non-2xx response; carries the parsed error body. */
export class ApiError extends Error {
  status: number;
  body: Record<string, unknown> | null;

  constructor(
    status: number,
    message: string,
    body: Record<string, unknown> | null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? (data as { error?: string }).error
        : null) ?? `API ${res.status}: ${path}`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return postJson<AuthResponse>("/auth/login", { email, password });
}

export function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return postJson<RegisterResponse>("/auth/register", {
    name,
    email,
    password,
  });
}

export function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  return postJson<AuthResponse>("/auth/verify-otp", { email, otp });
}

export function resendOtp(email: string): Promise<MessageResponse> {
  return postJson<MessageResponse>("/auth/resend-otp", { email });
}

export function requestPasswordReset(email: string): Promise<MessageResponse> {
  return postJson<MessageResponse>("/auth/forgot-password", { email });
}

export function resetPassword(
  email: string,
  otp: string,
  password: string,
): Promise<AuthResponse> {
  return postJson<AuthResponse>("/auth/reset-password", {
    email,
    otp,
    password,
  });
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
