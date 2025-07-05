"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

// 1. Define the context type
type AuthContextType = {
  session: Session | null;
  user: {
    id: string;
    email: string | undefined;
    role?: string;
  } | null;
  loading: boolean;
};

// 2. Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to extract user role from JWT
function extractUserRole(session: Session | null): string | undefined {
  if (!session?.access_token) return undefined;
  
  try {
    // Decode JWT payload (simple base64 decode)
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload.user_role || payload.role;
  } catch (error) {
    console.warn('Failed to extract role from JWT:', error);
    return undefined;
  }
}

// 3. Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 4. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 5. Unsubscribe from the listener on cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Create user object with role information
  const user = session ? {
    id: session.user.id,
    email: session.user.email,
    role: extractUserRole(session)
  } : null;

  // While the initial session is loading, you might want to show a loader
  // or return null to prevent layout shifts. For this example, we proceed.
  const value = { session, user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. Create the custom hook to access the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
