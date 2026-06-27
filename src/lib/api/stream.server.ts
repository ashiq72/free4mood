import { cookies, headers } from "next/headers";
import { getApiUrl, getTenantIdFromHost } from "./config";

export const proxyAuthenticatedStream = async (
  request: Request,
  backendPath: string,
) => {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) {
    return Response.json({ message: "Access token not found" }, { status: 401 });
  }

  const host = (await headers()).get("host") || "";
  const tenantId = getTenantIdFromHost(host);

  try {
    const backendResponse = await fetch(
      `${getApiUrl()}${backendPath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
        cache: "no-store",
        signal: request.signal,
      },
    );

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ||
          "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json(
      { message: "Unable to connect to the event stream" },
      { status: 502 },
    );
  }
};
