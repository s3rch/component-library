import type { ApiResult } from "../../../shared/lib/apiClient";
import { getApiBaseUrl } from "../../../shared/lib/env";
import type { LoginInput, RegisterInput, RegisterOutput } from "../domain/types";
import { loginApi, registerApi } from "../infrastructure/authApi";

export async function registerUser(input: RegisterInput): Promise<ApiResult<RegisterOutput>> {
  const baseUrl = getApiBaseUrl();
  return registerApi(baseUrl, input);
}

export async function loginUser(input: LoginInput): Promise<ApiResult<{ token: string }>> {
  const baseUrl = getApiBaseUrl();
  return loginApi(baseUrl, input);
}







