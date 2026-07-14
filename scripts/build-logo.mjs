import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "assets/images/source/logo-mark-source.png";
mkdirSync("assets", { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info; // channels === 4 (RGBA) after ensureAlpha

const out = Buffer.alloc(width * height * 4);
const LOW = 32; // luminance at/below this -> fully transparent
const HIGH = 85; // luminance at/above this -> fully opaque

for (let i = 0; i < width * height; i++) {
  const r = data[i * channels];
  const g = data[i * channels + 1];
  const b = data[i * channels + 2];
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  let alpha = ((lum - LOW) / (HIGH - LOW)) * 255;
  alpha = Math.max(0, Math.min(255, alpha));
  out[i * 4] = r;
  out[i * 4 + 1] = g;
  out[i * 4 + 2] = b;
  out[i * 4 + 3] = alpha;
}

const transparentBuffer = await sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();

const trimmed = sharp(transparentBuffer).trim({ threshold: 10 });

await trimmed.clone().resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/logo-mark-512.png");
await trimmed.clone().resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/logo-mark-256.png");
await trimmed.clone().resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/logo-mark-128.png");

// Favicons (transparent — reads fine in both light/dark browser chrome)
await trimmed.clone().resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/favicon-32.png");
await trimmed.clone().resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/favicon-16.png");
await trimmed.clone().resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile("assets/favicon-512.png");

// Apple touch icon: flatten onto black with padding — iOS doesn't handle transparency well
const trimmedBuf = await trimmed.clone().png().toBuffer();
await sharp(trimmedBuf)
  .resize(132, 132, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#000000" })
  .flatten({ background: "#000000" })
  .png()
  .toFile("assets/apple-touch-icon.png");

console.log("logo mark built");
