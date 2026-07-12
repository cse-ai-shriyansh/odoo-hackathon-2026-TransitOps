import { NextRequest, NextResponse } from "next/server";
import { getDashboardService } from "@backend/services/dashboard-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireSession(request);
    return successResponse(getDashboardService());
  } catch (error) {
    return handleApiError(error);
  }
}
