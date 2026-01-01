import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;
  const tenantId = "free4mood";

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
