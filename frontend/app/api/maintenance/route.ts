import { NextRequest, NextResponse } from "next/server";
import { createMaintenanceService, listMaintenanceService } from "@/backend/services/maintenance-service";
import { successResponse } from "@/backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    return successResponse(listMaintenanceService(session.user.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    return successResponse(createMaintenanceService(session.user.role, body), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
