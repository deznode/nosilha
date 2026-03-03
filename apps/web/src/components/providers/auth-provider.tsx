"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/schemas/userProfileSchema";

// 1. Define the context type (now using store values)
type AuthContextType = {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
};

// 2. Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to extract user role from JWT
function extractUserRole(session: Session | null): string | undefined {
  if (!session?.access_token) return undefined;

  try {
    // Decode JWT payload (simple base64 decode)
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    // Extract app role from JWT claims
    // Note: payload.role is Supabase's system role ("authenticated"), not app role
    // See: https://supabase.com/docs/guides/auth/jwt-fields
    return (
      payload.user_role || // Custom hook claim (if configured)
      payload.app_metadata?.role || // App role from user metadata
      payload.app_metadata?.roles?.[0] // Fallback for roles array
    );
  } catch (error) {
    console.warn("Failed to extract role from JWT:", error);
    return undefined;
  }
}

// Helper to create AuthUser from Session
function createAuthUser(session: Session | null): AuthUser | null {
  if (!session) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: extractUserRole(session),
  };
}

// 3. Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, session, isLoading, setUser, setSession, setLoading } =
    useAuthStore();

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(createAuthUser(session));
      setLoading(false);
    });

    // 4. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(createAuthUser(session));
    });

    // 5. Unsubscribe from the listener on cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

  // Provide context value from store
  const value = { session, user, loading: isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. Create the custom hook to access the context
export function useAuth() {
  const context = useContext(AuthContext);
  const storeState = useAuthStore();

  if (context === undefined) {
    return {
      session: storeState.session,
      user: storeState.user,
      loading: storeState.isLoading,
    };
  }

  return context;
}
