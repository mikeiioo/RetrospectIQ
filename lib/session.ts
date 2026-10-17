import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// Deduplicated per request so the layout and page share one session lookup.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image };
});

/** For server components: redirects to sign-in when there is no session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** For route handlers: returns the user, or a 401 response to send back. */
export async function requireApiUser(): Promise<
  { user: SessionUser; response?: never } | { user?: never; response: Response }
> {
  const user = await getSessionUser();
  if (!user) {
    return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

/** Only allow same-site relative paths as post-auth redirect targets. */
export function safeRedirectPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return "/";
  }
  return path;
}
