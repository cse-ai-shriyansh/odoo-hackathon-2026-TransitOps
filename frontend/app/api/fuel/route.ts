import { NextRequest, NextResponse } from "next/server";
import { createFuelLogService, listFuelLogsService } from "@/backend/services/fuel-service";
import { successResponse } from "@/backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    return successResponse(listFuelLogsService(session.user.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    return successResponse(createFuelLogService(session.user.role, body), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
