"use client";

import { jwtDecode, JwtPayload } from "jwt-decode";
import { assertSuccess, requestJson } from "./client";
import { getApiCoreUrl, getTenantIdFallback } from "./config";
import type { ApiResponse } from "./types";
import type { IUser } from "@/shared/types/user";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface ForgotPasswordPayload {
  phone: string;
  newPassword: string;
  confirmPassword: string;
}

type LoginData = {
  accessToken: string;
  [key: string]: unknown;
};

type AuthTokenPayload = IUser & JwtPayload;

const getClientTenantId = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 1 && parts[0]) return parts[0];
  }
  return getTenantIdFallback();
};

const setClientCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, "path=/", "samesite=lax"];
  if (typeof maxAgeSeconds === "number" && maxAgeSeconds > 0) {
    parts.push(`max-age=${maxAgeSeconds}`);
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    parts.push("secure");
  }
  document.cookie = parts.join("; ");
};

const clearClientCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

const getTokenMaxAge = (token: string) => {
  try {
    const decoded = jwtDecode<AuthTokenPayload>(token);
    if (!decoded?.exp) return undefined;
    const seconds = decoded.exp - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : undefined;
  } catch {
    return undefined;
  }
};

export const loginUser = async (
  payload: LoginPayload
): Promise<ApiResponse<LoginData>> => {
  const tenantId = getClientTenantId();
  const data = await requestJson<ApiResponse<LoginData>>(
    `${getApiCoreUrl()}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  assertSuccess(data, "Login failed!");

  if (data.data?.accessToken) {
    setClientCookie("accessToken", data.data.accessToken, getTokenMaxAge(data.data.accessToken));
  }

  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<null>> => {
  const tenantId = getClientTenantId();
  const data = await requestJson<ApiResponse<null>>(
    `${getApiCoreUrl()}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify(payload),
    },
  );

  return assertSuccess(data, "Password reset failed");
};

export const logout = () => {
  clearClientCookie("accessToken");
};
