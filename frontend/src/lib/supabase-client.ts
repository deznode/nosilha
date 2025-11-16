import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const allowStubClient =
  process.env.STORYBOOK === "true" ||
  process.env.NEXT_PUBLIC_SUPABASE_USE_STUB === "true";

function createStubClient(): SupabaseClient {
  const noop = async () => ({ data: { session: null }, error: null });
  const subscription = { unsubscribe: () => {} };

  return {
    auth: {
      getSession: noop,
      onAuthStateChange: () => ({ data: { subscription } }),
      signOut: noop,
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
    },
  } as unknown as SupabaseClient;
}

function getClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production" && !allowStubClient) {
      throw new Error(
        "Supabase URL or anonymous key is not defined. Please check your .env.local file."
      );
    }

    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "Supabase environment variables are missing. Using a stub client for Storybook/tests."
      );
    }

    return createStubClient();
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = getClient();
