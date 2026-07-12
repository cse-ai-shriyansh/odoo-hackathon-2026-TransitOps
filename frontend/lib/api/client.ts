import { ApiError } from "@/lib/mock/errors";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method: RequestMethod;
  path: string;
  body?: TBody;
}

export interface ApiResponse<TData> {
  data: TData;
  meta?: Record<string, string | number>;
}

function mapStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    default:
      return "HTTP_ERROR";
  }
}

async function parseResponse<TData>(response: Response): Promise<ApiResponse<TData>> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as { success?: boolean; data?: TData; message?: string; errors?: Record<string, string> }) : null;

  if (!response.ok) {
    throw new ApiError(response.status, {
      message: payload?.message ?? "Request failed.",
      code: mapStatusToCode(response.status),
      details: payload?.errors
    });
  }

  return { data: (payload?.data ?? null) as TData };
}

function buildUrl(path: string): string {
  return path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest<TData, TBody = unknown>(options: RequestOptions<TBody>): Promise<ApiResponse<TData>> {
  const response = await fetch(buildUrl(options.path), {
    method: options.method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  return parseResponse<TData>(response);
}
