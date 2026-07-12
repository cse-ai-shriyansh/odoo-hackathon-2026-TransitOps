import { NextRequest, NextResponse } from "next/server";
import { getReportsService } from "@/backend/services/reports-service";
import { successResponse } from "@/backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";
import { forbidden } from "@/backend/errors";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!(["admin", "financial_analyst"] as const).includes(session.user.role as "admin" | "financial_analyst")) {
      throw forbidden("Insufficient permissions");
    }

    return successResponse(getReportsService());
  } catch (error) {
    return handleApiError(error);
  }
}
