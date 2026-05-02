import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      username: auth.user.username,
      role: auth.user.role,
    },
  });
}
