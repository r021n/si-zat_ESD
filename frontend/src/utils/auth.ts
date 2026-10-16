import type { User } from "../types/auth";

export function isAdmin(user: User | { status?: string; email?: string } | null | undefined): boolean {
  if (!user) return false;
  const status = (user.status || "").toLowerCase();
  const email = (user.email || "").toLowerCase();
  return status === "admin" || email.includes("admin");
}
