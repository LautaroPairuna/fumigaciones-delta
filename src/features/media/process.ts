import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const run = promisify(execFile);

// Shared 8 GB VPS: no libvips operation cache and one worker thread keep memory flat.
sharp.cache(false);
sharp.concurrency(1);

const IMAGE_MAX_SIDE = 2560;
const VIDEO_MAX_WIDTH = 1280;
const VIDEO_MAX_HEIGHT = 720;
const VIDEO_MAX_SECONDS = 40;
// Decompression-bomb guard: ~50 MP covers any phone camera.
const MAX_INPUT_PIXELS = 50_000_000;

export type ProcessedImage = { width: number; height: number; bytes: number };
export type ProcessedVideo = ProcessedImage & { durationSec: number; posterBytes: number };

export async function processImage(input: string, output: string): Promise<ProcessedImage> {
  const info = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({
      width: IMAGE_MAX_SIDE,
      height: IMAGE_MAX_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80, alphaQuality: 90, effort: 5 })
    .toFile(output);
  return { width: info.width, height: info.height, bytes: info.size };
}

function ffmpeg(): string {
  if (!ffmpegPath) throw new Error("ffmpeg binary not available for this platform");
  return ffmpegPath;
}

export async function processVideo(
  input: string,
  output: { video: string; poster: string },
): Promise<ProcessedVideo> {
  const scale = `scale=w='min(${VIDEO_MAX_WIDTH},iw)':h='min(${VIDEO_MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`;
  // Background loops: no audio track, capped length and frame rate, playable while downloading.
  await run(
    ffmpeg(),
    [
      "-hide_banner",
      "-nostdin",
      "-y",
      "-i",
      input,
      "-t",
      String(VIDEO_MAX_SECONDS),
      "-an",
      "-sn",
      "-dn",
      "-map_metadata",
      "-1",
      "-vf",
      `${scale},fps=fps='min(30,source_fps)'`,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "27",
      "-maxrate",
      "1500k",
      "-bufsize",
      "3000k",
      "-profile:v",
      "high",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-threads",
      "2",
      output.video,
    ],
    { maxBuffer: 16 * 1024 * 1024 },
  );

  // Half a second in skips fade-ins; clips shorter than that use their first frame.
  const grabFrame = (seek: string) =>
    run(
      ffmpeg(),
      [
        "-hide_banner",
        "-nostdin",
        "-ss",
        seek,
        "-i",
        output.video,
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-c:v",
        "png",
        "-",
      ],
      { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
    ).then(({ stdout }) => stdout);
  let frame = await grabFrame("0.5").catch(() => Buffer.alloc(0));
  if (frame.length === 0) frame = await grabFrame("0");
  const poster = await sharp(frame).webp({ quality: 78, effort: 5 }).toFile(output.poster);

  const { stderr } = await run(ffmpeg(), ["-hide_banner", "-nostdin", "-i", output.video]).catch(
    (error: { stderr?: string }) => ({ stderr: error.stderr ?? "" }),
  );
  const duration = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  const durationSec = duration
    ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3])
    : 0;

  return {
    width: poster.width,
    height: poster.height,
    bytes: (await stat(output.video)).size,
    posterBytes: poster.size,
    durationSec,
  };
}
