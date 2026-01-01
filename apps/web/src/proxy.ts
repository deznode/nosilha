import { NextResponse } from "next/server";

export async function proxy() {
  // For now, we'll disable server-side auth checks and rely on client-side guards
  // This is because Supabase stores sessions in localStorage, not cookies

  return NextResponse.next();
}

export const config = {
  matcher: ["/contribute/directory/:path*"],
};
