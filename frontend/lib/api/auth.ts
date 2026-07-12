import type { AuthSession, UserRole } from "@/types/domain";
import { apiRequest } from "./client";

export interface LoginInput {
  email: string;
  password: string;
  role: UserRole;
}

export async function getSession(): Promise<AuthSession | null> {
  const response = await apiRequest<AuthSession>({ method: "GET", path: "/auth/session" });
  return response.data;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await apiRequest<AuthSession, LoginInput>({
    method: "POST",
    path: "/auth/session",
    body: input
  });

  return response.data;
}

export async function logout(): Promise<{ success: true }> {
  return { success: true };
}
