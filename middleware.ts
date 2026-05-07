import { NextRequest, NextResponse } from "next/server";

const VISITOR_CENTER_PATH = "/visitor-center";
const BLOGGER_CENTER_PATH = "/blogger-center";
const EDITOR_PATH = "/editor";
const AUTH_REFRESH_PATH = "/api/auth/refresh";

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function readJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as { role?: "VISITOR" | "BLOGGER"; exp?: number };
  } catch {
    return null;
  }
}

function isExpired(exp?: number) {
  return !exp || exp * 1000 < Date.now();
}

function redirectToHomeWithAuth(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "auth=login";
  return NextResponse.redirect(url);
}

function redirectToRefresh(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = AUTH_REFRESH_PATH;
  url.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const jwt = request.cookies.get("auth_token")?.value;
  const sessionToken = request.cookies.get("session_token")?.value;
  const shouldAttemptRefresh = !jwt || !readJwtPayload(jwt) || isExpired(readJwtPayload(jwt)?.exp);

  if (shouldAttemptRefresh) {
    if (sessionToken) {
      return redirectToRefresh(request);
    }
    if (pathname === VISITOR_CENTER_PATH || pathname === BLOGGER_CENTER_PATH || pathname === EDITOR_PATH) {
      return redirectToHomeWithAuth(request);
    }
  }

  if (pathname === VISITOR_CENTER_PATH || pathname === BLOGGER_CENTER_PATH || pathname === EDITOR_PATH) {
    const payload = readJwtPayload(jwt!);
    if (!payload) return redirectToHomeWithAuth(request);

    if (payload.role === "VISITOR") {
      if (pathname === BLOGGER_CENTER_PATH || pathname === EDITOR_PATH) {
        const url = request.nextUrl.clone();
        url.pathname = VISITOR_CENTER_PATH;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (payload.role === "BLOGGER") {
      if (pathname === VISITOR_CENTER_PATH) {
        const url = request.nextUrl.clone();
        url.pathname = BLOGGER_CENTER_PATH;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/article/:path*", "/visitor-center", "/blogger-center", "/editor"],
};
