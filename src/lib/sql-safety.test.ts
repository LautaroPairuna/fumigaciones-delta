import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const SCANNED = ["src", "scripts"];
const SKIPPED = new Set(["generated", "node_modules"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIPPED.has(entry.name) ? [] : sourceFiles(full);
    return /\.(ts|tsx|mjs)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [full] : [];
  });
}

const files = SCANNED.flatMap((dir) => sourceFiles(path.join(ROOT, dir)));

// Every form value reaches MySQL through Prisma's parameterized queries. These guards keep it
// that way: string-built SQL is the only way user input could become part of a query.
describe("SQL injection guards", () => {
  it("never uses Prisma's unsafe raw query APIs", () => {
    const offenders = files.filter((file) =>
      /\$(queryRawUnsafe|executeRawUnsafe)\b/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("never interpolates values into SQL passed to a driver", () => {
    const offenders = files.filter((file) =>
      /\.(query|execute)\(\s*`[^`]*\$\{/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("scans the application code", () => {
    expect(files.some((file) => file.endsWith(path.join("features", "admin", "actions.ts")))).toBe(
      true,
    );
  });
});
