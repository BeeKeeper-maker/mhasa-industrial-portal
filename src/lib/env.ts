// ============================================================================
// Environment Variable Validation (Zod)
// Use this in server-side code only. Importing it will throw at boot if any
// required env var is missing or malformed — fail-fast behavior.
// ============================================================================

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
