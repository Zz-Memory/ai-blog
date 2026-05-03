import { NextRequest, NextResponse } from "next/server";

const VISITOR_CENTER_PATH = "/visitor-center";
const BLOGGER_CENTER_PATH = "/blogger-center";
const EDITOR_PATH = "/editor";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === VISITOR_CENTER_PATH || pathname === BLOGGER_CENTER_PATH || pathname === EDITOR_PATH) {
    const jwt = request.cookies.get("auth_token")?.value;
    if (!jwt) return redirectToHomeWithAuth(request);

    const payload = readJwtPayload(jwt);
    if (!payload || isExpired(payload.exp)) return redirectToHomeWithAuth(request);

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
  matcher: ["/visitor-center", "/blogger-center", "/editor"],
};
