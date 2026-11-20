export type MediaKindParam = "image" | "video";

export const MAX_BYTES: Record<MediaKindParam, number> = {
  image: 20 * 1024 * 1024,
  video: 300 * 1024 * 1024,
};

const ALLOWED_TYPES: Record<MediaKindParam, ReadonlySet<string>> = {
  image: new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  video: new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-m4v", "video/x-matroska"]),
};

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
};

const STORED_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(-poster)?\.(webp|mp4)$/;

export function isMediaKind(value: string | null): value is MediaKindParam {
  return value === "image" || value === "video";
}

export function checkContentLength(
  header: string | null,
  kind: MediaKindParam,
): { ok: true; length: number } | { ok: false; status: 400 | 411 | 413 } {
  if (header === null || !/^\d+$/.test(header)) return { ok: false, status: 411 };
  const length = Number(header);
  if (length === 0) return { ok: false, status: 400 };
  if (length > MAX_BYTES[kind]) return { ok: false, status: 413 };
  return { ok: true, length };
}

export function isAllowedType(kind: MediaKindParam, mime: string | undefined): boolean {
  return mime !== undefined && ALLOWED_TYPES[kind].has(mime);
}

export function isStoredFileName(name: string): boolean {
  return STORED_NAME.test(name);
}

export function contentTypeFor(name: string): string {
  const extension = name.slice(name.lastIndexOf("."));
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export type RangeResult =
  | { kind: "full" }
  | { kind: "partial"; start: number; end: number }
  | { kind: "invalid" };

export function parseRange(header: string | null, size: number): RangeResult {
  if (!header) return { kind: "full" };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return { kind: "invalid" };
  const [, from = "", to = ""] = match;
  let start: number;
  let end: number;
  if (from === "") {
    if (to === "") return { kind: "invalid" };
    start = Math.max(size - Number(to), 0);
    end = size - 1;
  } else {
    start = Number(from);
    end = to === "" ? size - 1 : Math.min(Number(to), size - 1);
  }
  if (start >= size || start > end) return { kind: "invalid" };
  return { kind: "partial", start, end };
}
