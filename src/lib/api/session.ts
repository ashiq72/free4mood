"use client";

import { getTenantIdFallback } from "./config";

export const getClientTenantId = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 1 && parts[0]) return parts[0];
  }
  return getTenantIdFallback();
};

export const getAccessToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

