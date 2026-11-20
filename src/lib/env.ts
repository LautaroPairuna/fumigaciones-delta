import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^mysql$/ }),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  UPLOADS_DIR: z.string().min(1),
});

let cached: z.infer<typeof schema> | undefined;

// Read on first use, not at import time: `next build` imports server modules without runtime env.
export function env() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid environment variables: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
