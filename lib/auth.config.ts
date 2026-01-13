import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/auth');
      
      // If user is logged in, don't let them see signin/signup
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      // Allow all other public routes by default
      return true;
    },
  },
  providers: [], // Leave empty - we add database-heavy providers in auth.ts
  trustHost: true,
} satisfies NextAuthConfig;