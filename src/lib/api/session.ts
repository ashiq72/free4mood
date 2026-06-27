"use client";

import { getTenantIdFromHost } from "./config";

export const getClientTenantId = () => {
  if (typeof window !== "undefined") {
    return getTenantIdFromHost(window.location.host);
  }
  return getTenantIdFromHost("");
};

export const getAccessToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

