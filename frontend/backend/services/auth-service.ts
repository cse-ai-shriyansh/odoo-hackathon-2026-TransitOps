import type { AuthSession } from "@/types/domain";
import { loginSchema } from "../validation";
import { loginWithSupabase, logoutFromSupabase, readSessionFromRequest, serializeSessionCookie } from "../auth";
import type { NextRequest } from "next/server";
import { badRequest } from "../errors";

export async function getSessionService(request: NextRequest): Promise<AuthSession | null> {
  return readSessionFromRequest(request);
}

export async function loginService(body: unknown): Promise<AuthSession> {
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const session = await loginWithSupabase(parsed.data.email, parsed.data.password, parsed.data.role);
  return session;
}

export async function logoutService(token?: string): Promise<void> {
  await logoutFromSupabase(token);
}

export function sessionCookieValue(session: AuthSession): string {
  return serializeSessionCookie(session);
}
