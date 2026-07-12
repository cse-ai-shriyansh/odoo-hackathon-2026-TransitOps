import { NextRequest, NextResponse } from "next/server";
import { dispatchTripService } from "@backend/services/trips-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const result = await dispatchTripService(session.user.role, id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
