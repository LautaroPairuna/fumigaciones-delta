import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { contentTypeFor, isStoredFileName, parseRange } from "@/features/media/policy";
import { storedPath } from "@/features/media/storage";

const baseHeaders = {
  "Accept-Ranges": "bytes",
  // Names are server-generated UUIDs: a replaced file always gets a new URL.
  "Cache-Control": "public, max-age=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!isStoredFileName(file)) return new Response(null, { status: 404 });

  const filePath = storedPath(file);
  const size = await stat(/*turbopackIgnore: true*/ filePath).then(
    (info) => (info.isFile() ? info.size : null),
    () => null,
  );
  if (size === null) return new Response(null, { status: 404 });

  const headers = { ...baseHeaders, "Content-Type": contentTypeFor(file) };
  const range = parseRange(request.headers.get("range"), size);

  if (range.kind === "invalid") {
    return new Response(null, {
      status: 416,
      headers: { ...headers, "Content-Range": `bytes */${size}` },
    });
  }
  if (range.kind === "full") {
    const stream = createReadStream(/*turbopackIgnore: true*/ filePath);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers,
    });
  }
  // Next drops Content-Length from Route Handler responses; Content-Range carries the size.
  const stream = createReadStream(/*turbopackIgnore: true*/ filePath, {
    start: range.start,
    end: range.end,
  });
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 206,
    headers: { ...headers, "Content-Range": `bytes ${range.start}-${range.end}/${size}` },
  });
}
