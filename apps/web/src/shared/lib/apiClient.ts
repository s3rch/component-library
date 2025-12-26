export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function apiGetJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<ApiResult<T>> {
  return requestJson<T>(baseUrl, path, { method: "GET", ...init });
}

export async function apiPostJson<T>(
  baseUrl: string,
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const headers = mergeHeaders(init?.headers, { "Content-Type": "application/json" });
  return requestJson<T>(baseUrl, path, { method: "POST", ...init, headers, body: safeJsonStringify(body) });
}

export async function apiGetBlob(
  baseUrl: string,
  path: string,
  init?: RequestInit
): Promise<ApiResult<{ blob: Blob; headers: Headers }>> {
  const url = buildUrl(baseUrl, path);
  try {
    const res = await fetch(url, { method: "GET", ...init });
    if (!res.ok) {
      const error = await toApiError(res);
      return { ok: false, error };
    }
    const blob = await res.blob();
    return { ok: true, data: { blob, headers: res.headers } };
  } catch (err: unknown) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

async function requestJson<T>(baseUrl: string, path: string, init: RequestInit): Promise<ApiResult<T>> {
  const url = buildUrl(baseUrl, path);
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const error = await toApiError(res);
      return { ok: false, error };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { ok: false, error: { status: res.status, message: "Expected JSON response" } };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err: unknown) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const status = res.status;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const details = (await res.json()) as unknown;
      const message = extractMessage(details) ?? `Request failed (${status})`;
      return { status, message, details };
    } catch {
      return { status, message: `Request failed (${status})` };
    }
  }

  try {
    const text = await res.text();
    const message = text.trim().length > 0 ? text : `Request failed (${status})`;
    return { status, message };
  } catch {
    return { status, message: `Request failed (${status})` };
  }
}

function extractMessage(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const record = details as Record<string, unknown>;
  const msg = record.message;
  return typeof msg === "string" ? msg : undefined;
}

function buildUrl(baseUrl: string, path: string): string {
  const safeBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const safePath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(safePath, safeBase).toString();
}

function mergeHeaders(
  a: HeadersInit | undefined,
  b: Record<string, string>
): HeadersInit {
  const merged = new Headers(a);
  for (const [k, v] of Object.entries(b)) merged.set(k, v);
  return merged;
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to serialize JSON body: ${message}`);
  }
}







