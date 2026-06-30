"use client";

import { jwtDecode, JwtPayload } from "jwt-decode";
import { assertSuccess, requestJson } from "./client";
import { getApiCoreUrl, getTenantIdFromHost } from "./config";
import type { ApiResponse } from "./types";
import type { IUser } from "@/shared/types/user";
import { getAccessToken } from "./session";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type VerificationData = {
  developmentCode?: string;
} | null;

type LoginData = {
  accessToken: string;
  [key: string]: unknown;
};

type AuthTokenPayload = IUser & JwtPayload;

export const decodeAccessTokenUser = (token: string): IUser | null => {
  try {
    const decoded = jwtDecode<AuthTokenPayload>(token);
    if (!decoded?.userId) return null;
    if (decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

const getClientTenantId = () => {
  if (typeof window !== "undefined") {
    return getTenantIdFromHost(window.location.host);
  }
  return getTenantIdFromHost("");
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
  const decoded = decodeAccessTokenUser(token);
  if (!decoded?.exp) return undefined;
  const seconds = decoded.exp - Math.floor(Date.now() / 1000);
  return seconds > 0 ? seconds : undefined;
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

export const logout = () => {
  clearClientCookie("accessToken");
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ApiResponse<null>> => {
  const token = getAccessToken();
  if (!token) throw new Error("Access token not found");

  const data = await requestJson<ApiResponse<null>>(
    `${getApiCoreUrl()}/auth/change-password`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-tenant-id": getClientTenantId(),
      },
      body: JSON.stringify(payload),
    },
  );

  return assertSuccess(data, "Failed to change password");
};

export const verifyEmail = async (
  email: string,
  code: string,
): Promise<ApiResponse<null>> => {
  const data = await requestJson<ApiResponse<null>>(
    `${getApiCoreUrl()}/auth/verify-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": getClientTenantId(),
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
    },
  );
  return assertSuccess(data, "Email verification failed");
};

export const resendEmailVerification = async (
  email: string,
): Promise<ApiResponse<VerificationData>> => {
  const data = await requestJson<ApiResponse<VerificationData>>(
    `${getApiCoreUrl()}/auth/resend-verification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": getClientTenantId(),
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
  );
  return assertSuccess(data, "Verification code could not be resent");
};
