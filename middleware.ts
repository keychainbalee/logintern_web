import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/overview/:path*",
    "/input/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
