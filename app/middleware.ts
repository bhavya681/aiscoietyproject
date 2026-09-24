import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Authentification Required" }, { status: 401 })
    }
    const JWT_SECRET = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user', JSON.stringify(decoded));
    return NextResponse.next({ request: { headers: requestHeaders, } });
  } catch (error) {
    console.error(error);
    NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
  }
}

export const config = {
  matcher: [
    "/api/users/profile/:path*",
    "/api/users/update/:path*",
    "/api/users/delete/:path*",
    "/api/maintenance/:path*",
    "/api/payments/:path*",
    "/api/invoices/:path*",
  ],
};