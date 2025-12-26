import type { LoginInput, LoginOutput, RegisterInput, RegisterOutput } from "../domain/types";
import { apiPostJson, type ApiResult } from "../../../shared/lib/apiClient";

export async function registerApi(baseUrl: string, input: RegisterInput): Promise<ApiResult<RegisterOutput>> {
  return apiPostJson<RegisterOutput>(baseUrl, "/api/auth/register", input);
}

export async function loginApi(baseUrl: string, input: LoginInput): Promise<ApiResult<LoginOutput>> {
  return apiPostJson<LoginOutput>(baseUrl, "/api/auth/login", input);
}







