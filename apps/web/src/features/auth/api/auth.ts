import { apiClient } from "@/lib/api/client";
import type { AuthUser, LoginInput, LoginResponse, RegisterInput } from "../types/auth";

export async function register(registerInput: RegisterInput): Promise<AuthUser> {
  const response = await apiClient.post<AuthUser>("/auth/register", registerInput);

  return response.data;
}

export async function login(loginInput: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", loginInput);

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/auth/me");

  return response.data;
}