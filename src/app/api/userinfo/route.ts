import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(req: Request) {
  try {
    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Access token not found" },
        { status: 401 }
      );
    }

    const tenantId = "free4mood";

    // ✅ Read JSON body
    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-info/update-user-info`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        body: JSON.stringify(body),
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
