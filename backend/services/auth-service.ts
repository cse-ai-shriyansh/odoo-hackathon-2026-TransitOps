import type { AuthSession } from "../../frontend/types/domain";
import { loginSchema } from "../validation";
import { loginWithSupabase, logoutFromSupabase, readSessionFromRequest, serializeSessionCookie } from "../auth";
import { badRequest } from "../errors";

interface RequestLike {
  cookies: { get(name: string): { value?: string } | undefined };
  headers: { get(name: string): string | null };
}

export async function getSessionService(request: RequestLike): Promise<AuthSession | null> {
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
