import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getTenantIdFallback } from "@/lib/api/config";

const getTenantId = async () => {
  const host = (await headers()).get("host") ?? "";
  const parts = host.split(".");
  if (parts.length > 1 && parts[0]) return parts[0];
  return getTenantIdFallback();
};

export async function PATCH(req: Request) {
  try {
    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Access token not found" },
        { status: 401 }
      );
    }

    const tenantId = await getTenantId();
    const contentType = req.headers.get("content-type") || "";

    let backendBody: BodyInit;
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    };

    // ✅ IMAGE UPLOAD (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const incomingFormData = await req.formData();
      const formData = new FormData();

      // 🔁 rebuild FormData
      for (const [key, value] of incomingFormData.entries()) {
        if (value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const blob = new Blob([buffer], { type: value.type });
          formData.append(key, blob, value.name);
        } else {
          formData.append(key, value);
        }
      }

      backendBody = formData;
      // ❌ DO NOT set Content-Type
    }

    // ✅ JSON UPDATE
    else {
      const json = await req.json();
      backendBody = JSON.stringify(json);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-info/update-user-info`,
      {
        method: "PATCH",
        headers,
        body: backendBody,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update user info" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update user info error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
