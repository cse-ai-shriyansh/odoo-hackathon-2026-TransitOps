import { NextRequest, NextResponse } from "next/server";
import { logoutService } from "@/backend/services/auth-service";
import { successResponse } from "@/backend/response";
import { handleApiError } from "@/app/api/_utils";
import { readSessionFromRequest } from "@/backend/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await readSessionFromRequest(request);
    await logoutService(session?.accessToken);

    const response = successResponse({ success: true as const });
    response.cookies.set("transitops-session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0)
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
