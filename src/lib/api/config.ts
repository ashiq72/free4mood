const DEFAULT_TENANT_ID = "free4mood";

export const getTenantIdFallback = () =>
  process.env.NEXT_PUBLIC_TENANT_ID ?? DEFAULT_TENANT_ID;

export const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url;
};

export const getApiCoreUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_CORE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_CORE_URL is not set");
  return url;
};
