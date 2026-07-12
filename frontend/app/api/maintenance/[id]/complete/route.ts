import { NextRequest, NextResponse } from "next/server";
import { completeMaintenanceService } from "@backend/services/maintenance-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const result = await completeMaintenanceService(session.user.role, id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
