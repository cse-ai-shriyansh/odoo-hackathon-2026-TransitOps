import { NextRequest, NextResponse } from "next/server";
import { completeTripService } from "@/backend/services/trips-service";
import { successResponse } from "@/backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return successResponse(completeTripService(session.user.role, id, body));
  } catch (error) {
    return handleApiError(error);
  }
}
