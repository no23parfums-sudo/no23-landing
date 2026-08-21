/** Persist return path across the unauthenticated Collection / Wishlist / Account / Review gate. */
export const AUTH_RETURN_KEY = "no23.auth.returnTo";

export function storeAuthReturnTo(path: string) {
  if (typeof window === "undefined" || !path) return;
  try {
    sessionStorage.setItem(AUTH_RETURN_KEY, path);
  } catch {
    /* private mode / disabled storage */
  }
}

export function readAuthReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(AUTH_RETURN_KEY);
  } catch {
    return null;
  }
}

export function withReturnTo(href: string, returnTo?: string | null): string {
  if (!returnTo) return href;
  const url = new URL(href, "https://no23.local");
  url.searchParams.set("returnTo", returnTo);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Path + query of the current view, with an optional hash (`#reviews`). Client-only. */
export function currentAuthReturnTo(hash?: string): string {
  if (typeof window === "undefined") return hash ?? "";
  const { pathname, search } = window.location;
  const h = hash
    ? hash.startsWith("#")
      ? hash
      : `#${hash}`
    : "";
  return `${pathname}${search}${h}`;
}
