// design-sync shim for `@/lib/supabase-client`.
//
// The real module reads NEXT_PUBLIC_SUPABASE_* from process.env at module
// scope. esbuild only defines process.env.NODE_ENV for the bundle, so the
// remaining references would blow up with "process is not defined" the moment
// any component transitively importing it is loaded — which includes
// DirectoryCard (via BookmarkButton -> auth-provider).
//
// This mirrors the stub client the real module already ships behind
// NEXT_PUBLIC_SUPABASE_USE_STUB, so previews render the signed-out state.
//
// Wired via compilerOptions.paths in .design-sync/tsconfig.sync.json.

import type { SupabaseClient } from "@supabase/supabase-js";

const subscription = { unsubscribe: () => {} };
const noSession = async () => ({ data: { session: null }, error: null });

export const supabase = {
  auth: {
    getSession: noSession,
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription } }),
    signOut: async () => ({ error: null }),
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signInWithOAuth: async () => ({ data: { url: null, provider: "" }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      upload: async () => ({ data: null, error: null }),
    }),
  },
} as unknown as SupabaseClient;

export default supabase;
export const createClient = () => supabase;
