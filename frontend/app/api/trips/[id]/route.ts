import { NextRequest, NextResponse } from "next/server";
import { deleteTripService, updateTripService } from "@backend/services/trips-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    return successResponse(updateTripService(session.user.role, id, body));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    return successResponse(deleteTripService(session.user.role, id));
  } catch (error) {
    return handleApiError(error);
  }
}
