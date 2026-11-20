import "server-only";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { fileTypeFromFile } from "file-type";
import { getPrisma } from "@/lib/prisma";
import { isAllowedType, MAX_BYTES, type MediaKindParam } from "./policy";
import { processImage, processVideo } from "./process";
import { publicPath, storedPath, tempDir } from "./storage";

export class UploadError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type MediaItem = {
  id: string;
  kind: MediaKindParam;
  src: string;
  width: number;
  height: number;
  poster: { src: string; width: number; height: number } | null;
  originalName: string;
  bytes: number;
  createdAt: string;
};

// One transcode at a time: ffmpeg and sharp are the heaviest work this container does.
let queue: Promise<unknown> = Promise.resolve();
function serialized<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

function byteLimit(max: number) {
  let received = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      if (received > max) callback(new UploadError(413, "El archivo supera el tamaño máximo"));
      else callback(null, chunk);
    },
  });
}

export async function ingestUpload(input: {
  kind: MediaKindParam;
  body: ReadableStream<Uint8Array>;
  originalName: string;
}): Promise<MediaItem> {
  await mkdir(tempDir(), { recursive: true });
  const temp = path.join(/*turbopackIgnore: true*/ tempDir(), randomUUID());
  const id = randomUUID();
  const outputs: string[] = [];

  try {
    await pipeline(
      Readable.fromWeb(input.body),
      byteLimit(MAX_BYTES[input.kind]),
      createWriteStream(/*turbopackIgnore: true*/ temp),
    );

    const detected = await fileTypeFromFile(temp);
    if (!isAllowedType(input.kind, detected?.mime)) {
      throw new UploadError(
        415,
        input.kind === "image"
          ? "Formato no admitido. Subí una foto JPG, PNG, WebP o AVIF."
          : "Formato no admitido. Subí un video MP4, MOV, WebM o MKV.",
      );
    }

    return await serialized(async () => {
      if (input.kind === "image") {
        const file = `${id}.webp`;
        outputs.push(storedPath(file));
        const image = await processImage(temp, storedPath(file)).catch(() => {
          throw new UploadError(422, "No se pudo procesar la imagen");
        });
        const row = await getPrisma().media.create({
          data: {
            id,
            kind: "IMAGE",
            file,
            width: image.width,
            height: image.height,
            bytes: image.bytes,
            originalName: input.originalName,
          },
        });
        return toMediaItem(row);
      }

      const file = `${id}.mp4`;
      const poster = `${id}-poster.webp`;
      outputs.push(storedPath(file), storedPath(poster));
      const video = await processVideo(temp, {
        video: storedPath(file),
        poster: storedPath(poster),
      }).catch((error: unknown) => {
        console.error("[media] video processing failed", error);
        throw new UploadError(422, "No se pudo procesar el video");
      });
      const row = await getPrisma().media.create({
        data: {
          id,
          kind: "VIDEO",
          file,
          poster,
          width: video.width,
          height: video.height,
          bytes: video.bytes + video.posterBytes,
          durationSec: video.durationSec,
          originalName: input.originalName,
        },
      });
      return toMediaItem(row);
    });
  } catch (error) {
    await Promise.all(outputs.map((file) => rm(file, { force: true })));
    throw error;
  } finally {
    await rm(temp, { force: true });
  }
}

type MediaRow = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  file: string;
  poster: string | null;
  width: number;
  height: number;
  bytes: number;
  originalName: string;
  createdAt: Date;
};

export function toMediaItem(row: MediaRow): MediaItem {
  const size = { width: row.width, height: row.height };
  return {
    id: row.id,
    kind: row.kind === "IMAGE" ? "image" : "video",
    src: publicPath(row.file),
    ...size,
    poster: row.poster ? { src: publicPath(row.poster), ...size } : null,
    originalName: row.originalName,
    bytes: row.bytes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMedia(): Promise<MediaItem[]> {
  const rows = await getPrisma().media.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return rows.map(toMediaItem);
}

export async function deleteMedia(id: string, inUse: (src: string) => boolean): Promise<void> {
  const row = await getPrisma().media.findUnique({ where: { id } });
  if (!row) return;
  const item = toMediaItem(row);
  if (inUse(item.src)) throw new UploadError(409, "El archivo está en uso en el sitio");
  await getPrisma().media.delete({ where: { id } });
  await Promise.all(
    [row.file, row.poster]
      .filter((file): file is string => Boolean(file))
      .map((file) => rm(storedPath(file), { force: true })),
  );
}
