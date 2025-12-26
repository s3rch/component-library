export interface HttpClientConfig {
  timeoutMs: number;
}

export type HttpResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; message: string; details?: unknown };

export class HttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async postJson(url: string, body: unknown): Promise<HttpResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      let payload: string;
      try {
        payload = JSON.stringify(body);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, message: `Failed to serialize request body: ${message}` };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal
      });

      if (res.ok) {
        return { ok: true, status: res.status };
      }

      const details = await safeParseJson(res);
      return { ok: false, status: res.status, message: "Request failed", details };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

async function safeParseJson(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;

  try {
    return await res.json();
  } catch {
    return undefined;
  }
}







