import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "assets/images/source/shou-sugi-ban-texture.jpg";
const OUT_DIR = "assets/images/optimized";
const WIDTHS = [640, 960, 1600];

mkdirSync(OUT_DIR, { recursive: true });

for (const width of WIDTHS) {
  const pipeline = sharp(SRC)
    .resize({ width, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6 });

  await pipeline.clone().webp({ quality: 82, effort: 6 }).toFile(`${OUT_DIR}/shou-sugi-ban-texture-${width}.webp`);
  await pipeline.clone().avif({ quality: 62, effort: 6 }).toFile(`${OUT_DIR}/shou-sugi-ban-texture-${width}.avif`);
}

await sharp(SRC).resize({ width: 32 }).jpeg({ quality: 40 }).toFile(`${OUT_DIR}/shou-sugi-ban-texture-tiny.jpg`);

console.log("story texture built (upscaled from 479x640 source — flagged as soft at large sizes)");
