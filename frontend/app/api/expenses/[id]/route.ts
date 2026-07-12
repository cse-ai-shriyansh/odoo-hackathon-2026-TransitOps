import { NextRequest, NextResponse } from "next/server";
import { deleteExpenseService, updateExpenseService } from "@backend/services/expenses-service";
import { successResponse } from "@backend/response";
import { handleApiError, requireSession } from "@/app/api/_utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json();
    const result = await updateExpenseService(session.user.role, id, body);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const result = await deleteExpenseService(session.user.role, id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
