/**
 * Simple static admin credentials (client-side gate only).
 * NOTE: visible in source — not real security.
 */
export const ADMIN_EMAIL = "rufus090420@gmail.com";
export const ADMIN_PASSWORD = "Ismail@543";
export const ADMIN_SESSION_KEY = "static_admin_authed";

export const isStaticAdminAuthed = (): boolean =>
  typeof window !== "undefined" &&
  sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
