const DEFAULT_TENANT_ID = "free4mood";

export const getTenantIdFallback = () =>
  process.env.NEXT_PUBLIC_TENANT_ID ?? DEFAULT_TENANT_ID;

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const isLocalOrIpHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

export const getTenantIdFromHost = (host: string) => {
  const rawHost = host.split(",")[0]?.trim().toLowerCase() || "";
  let hostname = rawHost;
  try {
    hostname = new URL(`http://${rawHost}`).hostname.replace(/^\[|\]$/g, "");
  } catch {
    hostname = rawHost.split(":")[0];
  }

  if (!hostname || isLocalOrIpHost(hostname)) {
    return getTenantIdFallback();
  }

  const parts = hostname.split(".");
  return parts.length > 2 && parts[0] && parts[0] !== "www"
    ? parts[0]
    : getTenantIdFallback();
};

export const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const normalizedUrl = trimTrailingSlash(url);
  return normalizedUrl.endsWith("/social")
    ? normalizedUrl
    : `${normalizedUrl}/social`;
};

export const getApiCoreUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_CORE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_CORE_URL is not set");
  return trimTrailingSlash(url);
};
