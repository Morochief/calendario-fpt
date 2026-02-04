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
        const errors = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(
            `❌ Variables de entorno inválidas:\n${errors}\n\n` +
            `Por favor crea un archivo .env.local con las variables requeridas.`
        );
    }

    return result.data;
}

export const env = validateEnv();

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;
