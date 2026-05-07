import { NextResponse } from "next/server";
import {
  AUTH_JWT_COOKIE,
  AUTH_SESSION_COOKIE,
  createJwtPayload,
  hashSessionToken,
  setAuthCookies,
  signJwt,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get("returnTo") || "/";
    const sessionToken = request.headers.get("cookie")?.match(/(?:^|;\s*)session_token=([^;]+)/)?.[1];

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/?auth=login", url.origin));
    }

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: hashSessionToken(sessionToken) },
      include: { user: true },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      const response = NextResponse.redirect(new URL("/?auth=login", url.origin));
      response.headers.append("Set-Cookie", `${AUTH_JWT_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
      response.headers.append("Set-Cookie", `${AUTH_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
      return response;
    }

    const jwt = signJwt(createJwtPayload(session.user, session.id));
    const response = NextResponse.redirect(new URL(returnTo, url.origin));
    setAuthCookies(response, jwt, sessionToken);
    return response;
  } catch (error) {
    console.error("Refresh failed:", error);
    return NextResponse.json({ message: "刷新失败，请重新登录。" }, { status: 500 });
  }
}
