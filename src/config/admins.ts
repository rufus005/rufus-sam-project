/**
 * Approved admin emails. Only these users can access /admin.
 * Comparison is always case-insensitive.
 */
export const adminEmails: string[] = [
  "rufus090420@gmail.com",
  "rufus090400@gmail.com",
  "dynamicmarketing538@gmail.com",
].map((e) => e.trim().toLowerCase());

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return adminEmails.includes(email.trim().toLowerCase());
};
