import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getApiCoreUrl, getTenantIdFallback } from "@/lib/api/config";

const getTenantId = async () => {
  const host = (await headers()).get("host") ?? "";
  const parts = host.split(".");
  if (parts.length > 1 && parts[0]) return parts[0];
  return getTenantIdFallback();
};

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Access token not found" },
      { status: 401 },
    );
  }

  const tenantId = await getTenantId();

  const res = await fetch(
    `${getApiCoreUrl()}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.message === "string" ? data.message : "Failed to fetch user";
    return NextResponse.json({ message }, { status: res.status });
  }

  return NextResponse.json(data);
}
