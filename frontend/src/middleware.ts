import { NextResponse } from "next/server";

export async function middleware() {
  // For now, we'll disable server-side auth checks and rely on client-side guards
  // This is because Supabase stores sessions in localStorage, not cookies

  return NextResponse.next();
}

export const config = {
  matcher: ["/add-entry/:path*"],
};
