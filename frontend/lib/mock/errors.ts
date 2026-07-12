import type { ApiErrorPayload } from "@/types/domain";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export function validationError(details: Record<string, string>): ApiError {
  return new ApiError(422, {
    message: "Validation failed.",
    code: "VALIDATION_ERROR",
    details
  });
}

export function businessRuleError(message: string, details?: Record<string, string>): ApiError {
  return new ApiError(409, {
    message,
    code: "BUSINESS_RULE_VIOLATION",
    details
  });
}
