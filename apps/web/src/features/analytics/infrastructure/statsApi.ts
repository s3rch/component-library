import type { ApiResult } from "../../../shared/lib/apiClient";
import { apiGetJson } from "../../../shared/lib/apiClient";
import type { TrackingStatsDto } from "../domain/types";

export async function fetchStats(baseUrl: string): Promise<ApiResult<TrackingStatsDto>> {
  return apiGetJson<TrackingStatsDto>(baseUrl, "/api/components/stats");
}







