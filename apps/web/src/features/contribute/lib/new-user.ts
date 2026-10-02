/**
 * Whether a just-verified Supabase user was created by this sign-in, rather
 * than an existing account. Supabase sets `created_at` and
 * `last_sign_in_at` within a few milliseconds of each other for a brand new
 * account, so a gap under 10 seconds is treated as "new". This selects A2
 * ("account created") in the post-submit confirmation.
 */
const NEW_USER_WINDOW_MS = 10_000;

export function isNewUser(
  user: { created_at?: string; last_sign_in_at?: string } | null | undefined
): boolean {
  if (!user?.created_at || !user?.last_sign_in_at) return false;

  const createdAt = Date.parse(user.created_at);
  const lastSignInAt = Date.parse(user.last_sign_in_at);
  if (Number.isNaN(createdAt) || Number.isNaN(lastSignInAt)) return false;

  return Math.abs(lastSignInAt - createdAt) < NEW_USER_WINDOW_MS;
}
