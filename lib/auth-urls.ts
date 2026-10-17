type Env = Record<string, string | undefined>;

export type AuthBaseURL =
  | string
  | { allowedHosts: string[]; protocol: "https"; fallback?: string }
  | undefined;

/**
 * Vercel previews are served from per-deployment hosts that can't be known in
 * advance, so trust exactly this deployment's own hosts (not all of *.vercel.app,
 * which anyone can deploy to). Everywhere else, BETTER_AUTH_URL (or the request
 * origin when unset) applies.
 */
export function authBaseURL(env: Env = process.env): AuthBaseURL {
  if (env.VERCEL_ENV === "preview") {
    const hosts = [env.VERCEL_URL, env.VERCEL_BRANCH_URL].filter((host): host is string => Boolean(host));
    if (hosts.length > 0) {
      // Without a fallback, a request on any other host makes every session lookup throw (500).
      const fallback = env.BETTER_AUTH_URL || `https://${hosts[0]}`;
      return { allowedHosts: hosts, protocol: "https", fallback };
    }
  }
  // Undefined lets Better Auth read BETTER_AUTH_URL itself.
  return undefined;
}

/** Trust both the www and apex forms of the configured site URL. */
export function authTrustedOrigins(env: Env = process.env): string[] {
  if (!env.BETTER_AUTH_URL) return [];
  try {
    const url = new URL(env.BETTER_AUTH_URL);
    if (url.hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return [url.origin];
    const alternate = url.hostname.startsWith("www.") ? url.hostname.slice(4) : `www.${url.hostname}`;
    return [url.origin, `${url.protocol}//${alternate}${url.port ? `:${url.port}` : ""}`];
  } catch {
    return [];
  }
}
