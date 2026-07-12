import { NextRequest, NextResponse } from "next/server";
import { cancelTripService } from "@backend/services/trips-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    return successResponse(cancelTripService(session.user.role, id));
  } catch (error) {
    return handleApiError(error);
  }
}
