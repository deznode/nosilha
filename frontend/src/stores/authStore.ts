import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import type { AuthUser } from "@/schemas/userProfileSchema";

/**
 * Zustand store for authentication state management.
 * Replaces component-level auth state and prop drilling.
 * Persists user session data to localStorage.
 */

interface AuthState {
  // State
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: true,

        // Actions
        setUser: (user) => set({ user }),
        setSession: (session) => set({ session }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () =>
          set({
            user: null,
            session: null,
            isLoading: false,
          }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          // Only persist user data, not session (security)
          user: state.user,
        }),
      }
    ),
    {
      name: "AuthStore",
    }
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.user !== null);
