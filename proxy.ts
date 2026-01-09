import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect all routes except internal Next.js files and public assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};