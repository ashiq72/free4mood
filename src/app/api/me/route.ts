import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTenantIdFallback } from "@/lib/api/config";

const getTenantId = async () => {
  const host = (await headers()).get("host") ?? "";
  const parts = host.split(".");
  if (parts.length > 1 && parts[0]) return parts[0];
  return getTenantIdFallback();
};

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;
  const tenantId = await getTenantId();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user-info/me`,
    {
      headers: {
        Authorization: `${token}`,
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed" }, { status: 401 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
