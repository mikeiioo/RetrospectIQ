import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = ["/sign-in", "/sign-up"];

// Optimistic check only: it looks for a session cookie, not a valid session.
// Pages and route handlers verify the session themselves (lib/session.ts).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  if (isAuthPage || getSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signIn = new URL("/sign-in", request.url);
  if (pathname !== "/") signIn.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Skip Better Auth's own endpoints, Next internals, and static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
