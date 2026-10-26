import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth/cookies";
import { loginPath } from "@/lib/auth/return-to";

import { ApiError } from "./api-error";
import { withQuery } from "./endpoints";
import { backendDownload, fileNameFromDisposition } from "./server-api-client";
import { clientIpFrom } from "./server-headers";

interface CsvExportOptions {
  /** API route from `API_ROUTES`. */
  route: string;
  /** The only query parameters forwarded to the API. Everything else is dropped. */
  allowedParams: readonly string[];
  /** Used when the API sends no file name. */
  fallbackFileName: string;
}

const MAX_PARAM_LENGTH = 100;

/**
 * Streams one CSV export from the API to the browser. The browser asks with a plain link; this
 * reads the HttpOnly access cookie (the proxy has already renewed it), forwards a whitelisted set
 * of query parameters (plus `X-Security-Key` and the browser's `X-Client-Ip`), and passes the file
 * and its `Content-Disposition` through. There is deliberately no generic catch-all proxy.
 */
export async function streamCsvExport(
  request: NextRequest,
  options: CsvExportOptions,
): Promise<Response> {
  const accessToken = request.cookies.get(AUTH_COOKIE.access)?.value;
  if (!accessToken) return signInAgain(request);

  const query: Record<string, string> = {};
  for (const key of options.allowedParams) {
    const value = request.nextUrl.searchParams.get(key)?.trim();
    if (value) query[key] = value.slice(0, MAX_PARAM_LENGTH);
  }

  try {
    const upstream = await backendDownload(withQuery(options.route, query), {
      accessToken,
      signal: request.signal,
      clientIp: clientIpFrom(request.headers),
    });
    const requestId = upstream.headers.get("x-request-id");
    const fileName =
      safeFileName(fileNameFromDisposition(upstream.headers.get("content-disposition"))) ??
      options.fallbackFileName;
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...(requestId ? { "X-Request-Id": requestId } : {}),
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.kind === "unauthorized") return signInAgain(request);
    const status = error instanceof ApiError && error.status >= 400 ? error.status : 502;
    const message =
      error instanceof ApiError ? error.message : "The export couldn't be downloaded. Try again.";
    const requestId = error instanceof ApiError ? error.requestId : undefined;
    return new Response(`${message}${requestId ? `\nRequest ID ${requestId}` : ""}\n`, {
      status,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

/** Back to sign in, then to the page the export link was on. */
function signInAgain(request: NextRequest): Response {
  return NextResponse.redirect(new URL(loginPath(refererPath(request)), request.url));
}

function refererPath(request: NextRequest): string | null {
  const referer = request.headers.get("referer");
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return url.origin === request.nextUrl.origin ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}

/** Keeps a file name to plain characters so it cannot break the header. */
function safeFileName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
  return cleaned || undefined;
}
