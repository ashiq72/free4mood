import { proxyAuthenticatedStream } from "@/lib/api/stream.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyAuthenticatedStream(request, "/notifications/stream");
}
