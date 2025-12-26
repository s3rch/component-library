import type { TrackInput, TrackingEvent } from "../domain/trackingEvent";
import { HttpClient } from "../infrastructure/httpClient";

export interface TrackingConfig {
  apiBaseUrl: string;
  enabled?: boolean;
  appId?: string;
  sessionId: string;
  flushIntervalMs?: number;
  maxQueueSize?: number;
}

export interface TrackingServiceStatus {
  enabled: boolean;
  sessionId: string;
}

export interface TrackingServiceApi {
  track(input: TrackInput): Promise<void>;
  flush(): Promise<void>;
  getStatus(): TrackingServiceStatus;
}

export class TrackingService implements TrackingServiceApi {
  private readonly http: HttpClient;
  private readonly apiBaseUrl: string;
  private readonly enabled: boolean;
  private readonly appId: string | undefined;
  private readonly sessionId: string;
  private readonly maxQueueSize: number;

  private queue: TrackingEvent[] = [];
  private isFlushing = false;
  private failureCount = 0;
  private nextAllowedFlushAt = 0;

  constructor(config: TrackingConfig) {
    this.apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl);
    this.enabled = config.enabled ?? true;
    this.appId = config.appId;
    this.sessionId = config.sessionId;
    this.maxQueueSize = config.maxQueueSize ?? 100;

    this.http = new HttpClient({ timeoutMs: 5000 });
  }

  getStatus(): TrackingServiceStatus {
    return { enabled: this.enabled, sessionId: this.sessionId };
  }

  async track(input: TrackInput): Promise<void> {
    if (!this.enabled) return;

    try {
      const timestamp = new Date().toISOString();
      const ctx =
        typeof this.appId === "string"
          ? { appId: this.appId, sessionId: this.sessionId }
          : { sessionId: this.sessionId };
      const metadata = buildSafeMetadata(input.metadata, ctx);

      const event: TrackingEvent = {
        component: input.component,
        variant: input.variant,
        action: input.action,
        timestamp,
        ...(typeof metadata !== "undefined" ? { metadata } : {})
      };

      this.queue.push(event);
      if (this.queue.length > this.maxQueueSize) {
        this.queue = this.queue.slice(-this.maxQueueSize);
      }
    } catch {
      // Never let tracking crash the UI.
    }
  }

  async flush(): Promise<void> {
    if (!this.enabled) return;
    if (this.isFlushing) return;
    if (this.queue.length === 0) return;

    const now = Date.now();
    if (now < this.nextAllowedFlushAt) return;

    this.isFlushing = true;
    try {
      while (this.queue.length > 0) {
        const next = this.queue[0];
        const res = await this.http.postJson(`${this.apiBaseUrl}/api/components/track`, next);

        if (res.ok) {
          this.queue.shift();
          this.failureCount = 0;
          this.nextAllowedFlushAt = 0;
          continue;
        }

        this.failureCount += 1;
        const backoffMs = Math.min(30_000, 1000 * 2 ** (this.failureCount - 1));
        this.nextAllowedFlushAt = Date.now() + backoffMs;
        break;
      }
    } catch {
      // Never throw.
    } finally {
      this.isFlushing = false;
    }
  }
}

export function normalizeBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
}

export function generateSessionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const SENSITIVE_KEYS = new Set([
  "value",
  "password",
  "pass",
  "pwd",
  "token",
  "secret",
  "authorization",
  "cookie"
]);

function buildSafeMetadata(
  input: Record<string, unknown> | undefined,
  ctx: { appId?: string; sessionId: string }
): Record<string, unknown> | undefined {
  const safeUser = typeof input === "undefined" ? undefined : toJsonSafeRecord(input);

  const context: Record<string, unknown> = { sessionId: ctx.sessionId };
  if (typeof ctx.appId === "string") context.appId = ctx.appId;

  const merged: Record<string, unknown> = {};
  if (safeUser && Object.keys(safeUser).length > 0) Object.assign(merged, safeUser);
  merged.__tracking = context;

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function toJsonSafeRecord(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const seen = new WeakSet<object>();

  for (const [k, v] of Object.entries(value)) {
    if (isSensitiveKey(k)) continue;
    const converted = toJsonSafeValue(v, seen);
    if (typeof converted !== "undefined") {
      out[k] = converted;
    }
  }

  return out;
}

function toJsonSafeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol")
    return undefined;

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value
      .map((item) => toJsonSafeValue(item, seen))
      .filter((item) => typeof item !== "undefined");
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) return undefined;
    seen.add(obj);

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (isSensitiveKey(k)) continue;
      const converted = toJsonSafeValue(v, seen);
      if (typeof converted !== "undefined") out[k] = converted;
    }
    return out;
  }

  return undefined;
}

function isSensitiveKey(key: string): boolean {
  const lowered = key.toLowerCase();
  return SENSITIVE_KEYS.has(lowered) || lowered.includes("password") || lowered.includes("token");
}


