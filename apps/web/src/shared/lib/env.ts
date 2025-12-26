export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  const base = typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "http://localhost:4000";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}







