import { execFile } from "node:child_process";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  checkContentLength,
  contentTypeFor,
  isAllowedType,
  isStoredFileName,
  MAX_BYTES,
  parseRange,
} from "./policy";
import { processImage, processVideo } from "./process";

describe("checkContentLength", () => {
  it("rejects a missing or non-numeric length", () => {
    expect(checkContentLength(null, "image")).toEqual({ ok: false, status: 411 });
    expect(checkContentLength("abc", "image")).toEqual({ ok: false, status: 411 });
  });

  it("rejects an empty body and one above the limit for its kind", () => {
    expect(checkContentLength("0", "image")).toEqual({ ok: false, status: 400 });
    expect(checkContentLength(String(MAX_BYTES.image + 1), "image")).toEqual({
      ok: false,
      status: 413,
    });
  });

  it("accepts a video size that would be too big for an image", () => {
    expect(checkContentLength(String(MAX_BYTES.image + 1), "video")).toEqual({
      ok: true,
      length: MAX_BYTES.image + 1,
    });
  });
});

describe("isAllowedType", () => {
  it("accepts common photo and video formats for their own kind only", () => {
    expect(isAllowedType("image", "image/jpeg")).toBe(true);
    expect(isAllowedType("image", "image/png")).toBe(true);
    expect(isAllowedType("video", "video/quicktime")).toBe(true);
    expect(isAllowedType("video", "image/jpeg")).toBe(false);
    expect(isAllowedType("image", "video/mp4")).toBe(false);
  });

  it("rejects formats that can carry scripts", () => {
    expect(isAllowedType("image", "image/svg+xml")).toBe(false);
    expect(isAllowedType("image", "text/html")).toBe(false);
    expect(isAllowedType("image", undefined)).toBe(false);
  });
});

describe("isStoredFileName", () => {
  it("accepts only server-generated names", () => {
    expect(isStoredFileName("0f8fad5b-d9cb-469f-a165-70867728950e.webp")).toBe(true);
    expect(isStoredFileName("0f8fad5b-d9cb-469f-a165-70867728950e-poster.webp")).toBe(true);
    expect(isStoredFileName("0f8fad5b-d9cb-469f-a165-70867728950e.mp4")).toBe(true);
  });

  it("rejects traversal and arbitrary names", () => {
    expect(isStoredFileName("../.env")).toBe(false);
    expect(isStoredFileName("..%2F.env")).toBe(false);
    expect(isStoredFileName("foto.webp")).toBe(false);
    expect(isStoredFileName("0f8fad5b-d9cb-469f-a165-70867728950e.html")).toBe(false);
  });
});

describe("contentTypeFor", () => {
  it("maps stored extensions to their media type", () => {
    expect(contentTypeFor("a.webp")).toBe("image/webp");
    expect(contentTypeFor("a.mp4")).toBe("video/mp4");
  });
});

describe("parseRange", () => {
  it("returns the whole file when there is no Range header", () => {
    expect(parseRange(null, 1000)).toEqual({ kind: "full" });
  });

  it("parses closed, open-ended and suffix ranges", () => {
    expect(parseRange("bytes=0-99", 1000)).toEqual({ kind: "partial", start: 0, end: 99 });
    expect(parseRange("bytes=900-", 1000)).toEqual({ kind: "partial", start: 900, end: 999 });
    expect(parseRange("bytes=-100", 1000)).toEqual({ kind: "partial", start: 900, end: 999 });
  });

  it("clamps the end to the file size", () => {
    expect(parseRange("bytes=500-5000", 1000)).toEqual({ kind: "partial", start: 500, end: 999 });
  });

  it("rejects unsatisfiable or multiple ranges", () => {
    expect(parseRange("bytes=1000-", 1000)).toEqual({ kind: "invalid" });
    expect(parseRange("bytes=5-1", 1000)).toEqual({ kind: "invalid" });
    expect(parseRange("bytes=0-1,5-9", 1000)).toEqual({ kind: "invalid" });
  });
});

describe("processing", () => {
  let dir = "";

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "delta-media-"));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true, maxRetries: 5 });
  });

  it("converts a large photo to a WebP no wider than 2560 px", async () => {
    const input = path.join(dir, "photo.jpg");
    await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#3a7" } })
      .jpeg({ quality: 95 })
      .toFile(input);

    const result = await processImage(input, path.join(dir, "photo.webp"));

    expect(result).toMatchObject({ width: 2560, height: 1920 });
    const meta = await sharp(path.join(dir, "photo.webp")).metadata();
    expect(meta.format).toBe("webp");
    expect(result.bytes).toBe((await stat(path.join(dir, "photo.webp"))).size);
  });

  it("keeps transparency and never enlarges small images", async () => {
    const input = path.join(dir, "cutout.png");
    await sharp({
      create: { width: 300, height: 600, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .png()
      .toFile(input);

    const result = await processImage(input, path.join(dir, "cutout.webp"));

    expect(result).toMatchObject({ width: 300, height: 600 });
    expect((await sharp(path.join(dir, "cutout.webp")).metadata()).hasAlpha).toBe(true);
  });

  it("transcodes a video to a silent 1280 px H.264 MP4 with a WebP poster", async () => {
    if (!ffmpegPath) throw new Error("ffmpeg-static binary missing");
    const input = path.join(dir, "clip.mov");
    await promisify(execFile)(ffmpegPath, [
      "-hide_banner",
      "-f",
      "lavfi",
      "-i",
      "testsrc=size=1920x1080:rate=60:duration=2",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      "-shortest",
      "-c:v",
      "mpeg4",
      "-c:a",
      "aac",
      input,
    ]);

    const result = await processVideo(input, {
      video: path.join(dir, "clip.mp4"),
      poster: path.join(dir, "clip-poster.webp"),
    });

    expect(result).toMatchObject({ width: 1280, height: 720 });
    expect(result.durationSec).toBeCloseTo(2, 0);
    const { stderr } = await promisify(execFile)(ffmpegPath, [
      "-hide_banner",
      "-i",
      path.join(dir, "clip.mp4"),
    ]).catch((error: { stderr: string }) => ({ stderr: error.stderr }));
    expect(stderr).toMatch(/Video: h264/);
    expect(stderr).toMatch(/30 fps/);
    expect(stderr).not.toMatch(/Audio:/);
    expect((await sharp(path.join(dir, "clip-poster.webp")).metadata()).width).toBe(1280);
  }, 60_000);

  it("makes a poster for clips shorter than half a second", async () => {
    if (!ffmpegPath) throw new Error("ffmpeg-static binary missing");
    const input = path.join(dir, "short.mp4");
    await promisify(execFile)(ffmpegPath, [
      "-hide_banner",
      "-f",
      "lavfi",
      "-i",
      "testsrc=size=640x360:rate=30:duration=0.3",
      "-c:v",
      "libx264",
      input,
    ]);
    const result = await processVideo(input, {
      video: path.join(dir, "short-out.mp4"),
      poster: path.join(dir, "short-poster.webp"),
    });
    expect(result).toMatchObject({ width: 640, height: 360 });
  }, 60_000);

  it("rejects a file that is not really an image", async () => {
    const input = path.join(dir, "fake.jpg");
    await (await import("node:fs/promises")).writeFile(input, "<html>not an image</html>");
    await expect(processImage(input, path.join(dir, "fake.webp"))).rejects.toThrow();
  });
});
