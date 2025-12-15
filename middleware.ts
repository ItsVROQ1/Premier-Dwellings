import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/(admin)")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/profile", "/listings", "/inquiries"]
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (requiresAuth && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Routes that require verification
    const verificationRequired = ["/listings/create", "/inquiries/create"]
    const requiresVerification = verificationRequired.some(route => pathname.startsWith(route))
    
    if (requiresVerification && !token?.isVerified) {
      return NextResponse.redirect(new URL("/verify", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/dashboard/profile/:path*",
    "/listings/:path*",
    "/inquiries/:path*"
  ]
}