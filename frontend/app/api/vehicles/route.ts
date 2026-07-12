import { NextRequest, NextResponse } from "next/server";
import { createVehicleService, listVehiclesService } from "@backend/services/vehicles-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";
import { initializeRepositoriesFromSupabase } from "@backend/repositories";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    await initializeRepositoriesFromSupabase();
    return successResponse(await listVehiclesService(session.user.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const vehicle = await createVehicleService(session.user.role, body);
    return successResponse(vehicle, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
