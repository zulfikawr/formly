// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  console.log("Middleware checking path:", request.nextUrl.pathname);
  console.log("Token exists:", !!token);

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute) {
    if (!token) {
      console.log("No token found, redirecting to signin");
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log("Token verified successfully:", payload);
      return NextResponse.next();
    } catch (error) {
      console.log("Token verification failed:", error);
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
