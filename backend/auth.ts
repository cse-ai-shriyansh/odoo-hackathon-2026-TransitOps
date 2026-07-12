import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { AuthSession, UserRole } from "../frontend/types/domain";
import { seededAuthSession } from "../frontend/lib/mock/seed";
import { forbidden, unauthorized } from "./errors";

interface RequestLike {
  cookies: { get(name: string): { value?: string } | undefined };
  headers: { get(name: string): string | null };
}

const SESSION_COOKIE = "transitops-session";

function getEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getSupabaseUrl(): string | null {
  return getEnv("NEXT_PUBLIC_SUPABASE_URL") ?? getEnv("SUPABASE_URL") ?? null;
}

function getSupabaseAnonKey(): string | null {
  return getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_ANON_KEY") ?? null;
}

function getSupabaseServiceRoleKey(): string | null {
  return getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getSupabasePublicClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function canAccessRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role);
}

export async function readSessionFromRequest(request: RequestLike): Promise<AuthSession | null> {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

  if (cookieValue) {
    try {
      const parsed = JSON.parse(cookieValue) as AuthSession;
      return parsed;
    } catch {
      return null;
    }
  }

  const supabase = getSupabaseAdminClient();
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!supabase || !token) {
    return null;
  }

  const { data } = await supabase.auth.getUser(token);

  if (!data.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    accessToken: token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: {
      id: profile.id,
      name: profile.full_name,
      email: data.user.email ?? "",
      role: profile.role as UserRole
    }
  };
}

export async function readSessionFromCookies(): Promise<AuthSession | null> {
  const store = await cookies();
  const cookieValue = store.get(SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  try {
    return JSON.parse(cookieValue) as AuthSession;
  } catch {
    return null;
  }
}

export function serializeSessionCookie(session: AuthSession): string {
  return JSON.stringify(session);
}

export async function loginWithSupabase(email: string, password: string, role: UserRole): Promise<AuthSession> {
  const supabase = getSupabasePublicClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user || !data.session) {
      throw unauthorized("Invalid credentials");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", data.user.id)
      .single();

    if (!profile || profile.role !== role) {
      throw forbidden("Role not permitted");
    }

    return {
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      user: {
        id: profile.id,
        name: profile.full_name,
        email: data.user.email ?? email,
        role: profile.role as UserRole
      }
    };
  }

  if (email !== seededAuthSession.user.email || role !== seededAuthSession.user.role || password.trim().length < 4) {
    throw unauthorized("Invalid credentials");
  }

  return seededAuthSession;
}

export async function logoutFromSupabase(token?: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  if (supabase && token) {
    await supabase.auth.admin.signOut(token);
  }
}
