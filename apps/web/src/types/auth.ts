export type UserRole = "admin" | "driver";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  requiresVerification: true;
  email: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}
