import { NextResponse, type NextRequest } from "next/server";

import { clientIpFrom } from "@/lib/api/server-headers";
import { AUTH_COOKIE, setSessionCookies } from "@/lib/auth/cookies";
import { DESK_PATH_HEADER, LOGIN_PATH, loginPath, returnToFromUrl } from "@/lib/auth/return-to";
import {
  createRefreshCoordinator,
  decideProxyAction,
  requestRefresh,
} from "@/lib/auth/session-refresh";

const rotate = createRefreshCoordinator({ refresh: requestRefresh });

/**
 * Keeps the desk session alive before any page renders (Next 16 proxy, Node.js runtime).
 *
 * - Fresh access cookie: continue (the layout still checks it with `GET /auth/me`).
 * - Access cookie missing or expiring within 60 s, refresh cookie present: rotate once (shared
 *   with concurrent requests carrying the same refresh token), set both cookies on the response
 *   and on the request the page sees. The refresh call carries `X-Security-Key` and the browser's
 *   `X-Client-Ip`, read straight from `request.headers`.
 * - No usable session on a protected page: redirect to `/login?returnTo=<this page>`.
 *
 * `/login` passes through too, so someone returning with only a refresh cookie is signed in again
 * and the login page sends them on. Server Action calls are never redirected: the service answers
 * `unauthorized` and the client sends the tablet to sign in (see lib/api/query-client.ts).
 */
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === LOGIN_PATH;
  const isServerAction = request.headers.has("next-action");
  const returnTo = returnToFromUrl(request.nextUrl);
  const refreshToken = request.cookies.get(AUTH_COOKIE.refresh)?.value;
  const action = decideProxyAction({
    route: isLogin ? "login" : "protected",
    accessToken: request.cookies.get(AUTH_COOKIE.access)?.value,
    refreshToken,
    now: Date.now(),
  });

  if (action === "login") {
    return isServerAction ? continueRequest(request, null) : redirectToLogin(request, returnTo);
  }
  if (action === "continue" || !refreshToken) {
    return continueRequest(request, isLogin ? null : returnTo);
  }

  const outcome = await rotate(refreshToken, clientIpFrom(request.headers));
  if (!outcome.ok) {
    // Cookies are left alone: if another instance won a race for this token, its response carries
    // the new pair and clearing here could overwrite it. Signing in replaces them anyway.
    if (isLogin || isServerAction) return continueRequest(request, null);
    return redirectToLogin(request, returnTo);
  }

  // Let this request's server components, Server Actions and Route Handlers see the new tokens.
  request.cookies.set(AUTH_COOKIE.access, outcome.tokens.accessToken);
  request.cookies.set(AUTH_COOKIE.refresh, outcome.tokens.refreshToken);
  const response = continueRequest(request, isLogin ? null : returnTo);
  setSessionCookies(response.cookies, outcome.tokens);
  return response;
}

function redirectToLogin(request: NextRequest, returnTo: string) {
  return NextResponse.redirect(new URL(loginPath(returnTo), request.url));
}

/** Continues, telling server components which page was asked for (for `requireUser`). */
function continueRequest(request: NextRequest, returnTo: string | null) {
  const headers = new Headers(request.headers);
  if (returnTo) headers.set(DESK_PATH_HEADER, returnTo);
  else headers.delete(DESK_PATH_HEADER);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Every page, Server Action and the CSV export handlers; not framework assets or files with an
     * extension (brand images, icons). `/login` is included on purpose (see above).
     */
    "/((?!_next/|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
