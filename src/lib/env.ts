/**
 * Environment Variable Validation
 * Validates all required environment variables at build/runtime
 * Provides type-safe access to environment configuration
 */
import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url({
        message: 'NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida'
    }),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
        message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida'
    }),
});

// Validate environment variables
function validateEnv() {
    const result = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    if (!result.success) {
        console.warn('⚠️ Variables de entorno faltantes o inválidas. Usando valores por defecto para build.');
        // Return mock values for build time to prevent crash
        return {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key',
        };
    }

    return result.data;
}

export const env = validateEnv();

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;
