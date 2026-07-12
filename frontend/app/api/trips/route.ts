import { NextRequest, NextResponse } from "next/server";
import { createTripService, listTripsService } from "@/backend/services/trips-service";
import { successResponse } from "@/backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    return successResponse(listTripsService(session.user.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    return successResponse(createTripService(session.user.role, body), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
