import { NextRequest, NextResponse } from "next/server";
import { createDriverService, listDriversService } from "@backend/services/drivers-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";
import { initializeRepositoriesFromSupabase } from "@backend/repositories";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    await initializeRepositoriesFromSupabase();
    return successResponse(listDriversService(session.user.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    return successResponse(createDriverService(session.user.role, body), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
