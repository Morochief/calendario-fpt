/**
 * Supabase Client Singleton
 * Ensures only one instance of the Supabase client is created
 * Uses validated environment variables for type safety
 */
import { createBrowserClient } from '@supabase/ssr';
import { env } from './env';

// Type for the Supabase client
type SupabaseClientType = ReturnType<typeof createBrowserClient>;

// Singleton instance
let supabaseInstance: SupabaseClientType | null = null;

/**
 * Get or create the Supabase client instance
 * Uses the Singleton pattern to prevent multiple client instances
 */
export function createClient(): SupabaseClientType {
    if (!supabaseInstance) {
        supabaseInstance = createBrowserClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return supabaseInstance;
}

/**
 * Reset the client instance (useful for testing or logout)
 */
export function resetClient(): void {
    supabaseInstance = null;
}

// Default export for convenience
export default createClient;
