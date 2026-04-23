/**
 * Predefined admin emails. Only these users can access /admin.
 * Comparison is always case-insensitive.
 */
export const adminEmails: string[] = [
  "rufus090420@gmail.com",
  "dynamicunuversal08@gmail.com",
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
};
