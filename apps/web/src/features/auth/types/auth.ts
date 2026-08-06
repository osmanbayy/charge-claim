export const USER_ROLES = ["DRIVER", "STAFF"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}