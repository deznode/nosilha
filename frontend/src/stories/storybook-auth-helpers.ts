import type { Session, User } from "@supabase/supabase-js";
import type { AuthUser } from "@/schemas/userProfileSchema";
import { useAuthStore } from "@/stores/authStore";

const baseUserId = "11111111-2222-3333-4444-555555555555";

export function createMockSupabaseUser(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString();
  return {
    id: baseUserId,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    aud: "authenticated",
    confirmation_sent_at: now,
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    new_phone: undefined,
    invited_at: undefined,
    action_link: undefined,
    email: "diaspora@nosilha.org",
    phone: "",
    created_at: now,
    confirmed_at: now,
    email_confirmed_at: now,
    phone_confirmed_at: undefined,
    last_sign_in_at: now,
    role: "authenticated",
    updated_at: now,
    factors: [],
    identities: [],
    ...overrides,
  };
}

export function createMockSession(overrides: Partial<Session> = {}): Session {
  const baseUser = createMockSupabaseUser({ email: overrides.user?.email });
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "mock-refresh-token",
    user: overrides.user ?? baseUser,
    provider_token: undefined,
    provider_refresh_token: undefined,
    ...overrides,
  } as Session;
}

export function createMockAuthUser(
  overrides: Partial<AuthUser> = {}
): AuthUser {
  return {
    id: overrides.id ?? baseUserId,
    email: overrides.email ?? "diaspora@nosilha.org",
    role: overrides.role ?? "MEMBER",
  };
}

export function setAuthState({
  session = null,
  user = null,
  isLoading = false,
}: {
  session?: Session | null;
  user?: AuthUser | null;
  isLoading?: boolean;
}) {
  useAuthStore.setState((state) => ({
    ...state,
    session,
    user,
    isLoading,
  }));
}
