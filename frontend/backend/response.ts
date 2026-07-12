import { NextResponse } from "next/server";
import type { ApiEnvelope, ErrorEnvelope, SuccessEnvelope } from "./types";

export function successResponse<TData>(data: TData, status = 200): NextResponse<ApiEnvelope<TData>> {
  const body: SuccessEnvelope<TData> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status: number, errors?: Record<string, string>): NextResponse<ApiEnvelope<never>> {
  const body: ErrorEnvelope = { success: false, message, errors };
  return NextResponse.json(body, { status });
}
