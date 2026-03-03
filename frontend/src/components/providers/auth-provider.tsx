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
};

// 2. Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // While the initial session is loading, you might want to show a loader
  // or return null to prevent layout shifts. For this example, we proceed.
  const value = { session };

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
