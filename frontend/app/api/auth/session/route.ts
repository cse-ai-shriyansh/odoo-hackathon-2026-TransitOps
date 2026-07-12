import { NextRequest, NextResponse } from "next/server";
import { loginService, getSessionService, sessionCookieValue } from "@backend/services/auth-service";
import { successResponse, errorResponse } from "@backend/response";
import { handleApiError } from "@/app/api/_utils";
import { BackendError } from "@backend/errors";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSessionService(request);

    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    return successResponse(session);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const session = await loginService(body);
    const response = successResponse(session);

    response.cookies.set("transitops-session", sessionCookieValue(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt)
    });

    return response;
  } catch (error) {
    if (error instanceof BackendError) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return handleApiError(error);
  }
}
