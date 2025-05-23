import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authRoutes = ["/auth"];
const protectedRoutes = ["/dashboard"];

const middleware = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
};

export default middleware;

export const config = {
  matcher: ["/auth", "/dashboard/:path*"],
};
