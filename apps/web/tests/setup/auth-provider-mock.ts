/**
 * Shared `auth-provider` mock for unit tests.
 *
 * The three site-chrome specs each hand-rolled the same mutable fixture, the same
 * `useAuth` factory and the same `signIn()` with the same email — and had already
 * drifted, one of them dropping `email` from the shape so its avatar could never
 * render initials. One fixture, so "signed in" means the same thing in all of
 * them.
 *
 * `vi.mock` factories are hoisted, so import this dynamically:
 *
 * ```ts
 * vi.mock("@/components/providers/auth-provider", async () => {
 *   const { createAuthProviderMock } = await import(
 *     "../../../setup/auth-provider-mock"
 *   );
 *   return createAuthProviderMock();
 * });
 * ```
 */

export const SIGNED_IN_EMAIL = "maria.tavares@example.com";

export const auth: { session: unknown; email: string | null } = {
  session: null,
  email: null,
};

/** Put the fixture in the signed-in state. */
export function signIn(email: string = SIGNED_IN_EMAIL) {
  auth.session = { user: { email } };
  auth.email = email;
}

/** Put the fixture back in the signed-out state — call this from `beforeEach`. */
export function signOut() {
  auth.session = null;
  auth.email = null;
}

export function createAuthProviderMock() {
  return {
    useAuth: () => ({
      session: auth.session,
      user: auth.email ? { id: "u1", email: auth.email } : null,
      loading: false,
    }),
  };
}
