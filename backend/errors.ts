export class BackendError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors?: Record<string, string>;

  constructor(status: number, message: string, code: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function badRequest(message: string, errors?: Record<string, string>): BackendError {
  return new BackendError(400, message, "BAD_REQUEST", errors);
}

export function unauthorized(message = "Unauthorized"): BackendError {
  return new BackendError(401, message, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden"): BackendError {
  return new BackendError(403, message, "FORBIDDEN");
}

export function notFound(message = "Not found"): BackendError {
  return new BackendError(404, message, "NOT_FOUND");
}

export function conflict(message: string, errors?: Record<string, string>): BackendError {
  return new BackendError(409, message, "CONFLICT", errors);
}

export function validationError(message: string, errors: Record<string, string>): BackendError {
  return new BackendError(422, message, "VALIDATION_ERROR", errors);
}
