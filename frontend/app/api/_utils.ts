import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AuthSession } from "@/types/domain";
import { readSessionFromRequest } from "@backend/auth";
import { BackendError } from "@backend/errors";
import { errorResponse } from "@backend/response";

export async function requireSession(request: NextRequest): Promise<AuthSession> {
  const session = await readSessionFromRequest(request);

  if (!session) {
    throw new BackendError(401, "Unauthorized", "UNAUTHORIZED");
  }

  return session;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof BackendError) {
    return errorResponse(error.message, error.status, error.errors);
  }

  console.error("TransitOps backend error", error);
  return errorResponse("Internal server error", 500);
}
