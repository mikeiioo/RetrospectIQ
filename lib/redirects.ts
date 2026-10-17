export const DEFAULT_REDIRECT = "/dashboard";

/**
 * Only allow same-site relative paths as post-auth redirect targets.
 * Browsers strip tabs/newlines and treat "\" like "/", so "/\t/evil.com" or
 * "/\\evil.com" would otherwise become a protocol-relative off-site URL.
 */
export function safeRedirectPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(path)
  ) {
    return DEFAULT_REDIRECT;
  }
  return path;
}
