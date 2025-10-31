"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

export async function convertImageToWebP(
  file: File,
  quality: number = 80,
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  await ffmpeg.writeFile("input", await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    "input",
    "-c:v",
    "libwebp",
    "-quality",
    quality.toString(),
    "output.webp",
  ]);

  const data = (await ffmpeg.readFile("output.webp")) as unknown as Uint8Array;

  await ffmpeg.deleteFile("input");
  await ffmpeg.deleteFile("output.webp");

  const ab = (data.buffer as ArrayBuffer).slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  return new Blob([ab], { type: "image/webp" });
}

export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 80,
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  await ffmpeg.writeFile("input", await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    "input",
    "-vf",
    `scale='min(${maxWidth},iw)':min'(${maxHeight},ih)':force_original_aspect_ratio=decrease`,
    "-c:v",
    "libwebp",
    "-quality",
    quality.toString(),
    "output.webp",
  ]);

  const data = (await ffmpeg.readFile("output.webp")) as unknown as Uint8Array;

  await ffmpeg.deleteFile("input");
  await ffmpeg.deleteFile("output.webp");

  const ab = (data.buffer as ArrayBuffer).slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  return new Blob([ab], { type: "image/webp" });
}
