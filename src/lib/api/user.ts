import { assertSuccess, requestJson } from "./client";
import { getApiCoreUrl, getTenantIdFallback } from "./config";
import type { ApiResponse } from "./types";
import type { IFormInput } from "@/features/auth/types";

export async function createUser(
  payload: IFormInput
): Promise<ApiResponse<unknown>> {
  const tenantId = getTenantIdFallback();
  const data = await requestJson<ApiResponse<unknown>>(
    `${getApiCoreUrl()}/users/create-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify(payload),
    }
  );
  return assertSuccess(data, "Failed to create user");
}

export const getMe = async <T = unknown>(): Promise<ApiResponse<T>> => {
  const data = await requestJson<ApiResponse<T>>("/api/me", {
    cache: "no-store",
  });
  return assertSuccess(data, "Failed to fetch user");
};

export const updateUser = async (
  data: FormData | Record<string, unknown>
): Promise<ApiResponse<unknown>> => {
  const isFormData = data instanceof FormData;

  const result = await requestJson<ApiResponse<unknown>>("/api/userinfo", {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  return assertSuccess(result, "Failed to update user info");
};
