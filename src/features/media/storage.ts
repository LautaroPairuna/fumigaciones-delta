import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import { isStoredFileName } from "./policy";

let logged = false;

export function uploadsDir(): string {
  const dir = path.resolve(/*turbopackIgnore: true*/ env().UPLOADS_DIR);
  if (!logged) {
    logged = true;
    console.info(`[uploads] ${dir} exists: ${existsSync(/*turbopackIgnore: true*/ dir)}`);
  }
  return dir;
}

export function storedPath(name: string): string {
  if (!isStoredFileName(name)) throw new Error(`Invalid stored file name: ${name}`);
  return path.join(/*turbopackIgnore: true*/ uploadsDir(), name);
}

export function tempDir(): string {
  return path.join(/*turbopackIgnore: true*/ uploadsDir(), ".tmp");
}

export function publicPath(name: string): string {
  return `/uploads/${name}`;
}
