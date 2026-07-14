import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join, parse } from "path";

const SRC_DIR = join(process.cwd(), "assets/images/source");
const OUT_DIR = join(process.cwd(), "assets/images/optimized");
const WIDTHS = [640, 960, 1280, 1920, 2200];

mkdirSync(OUT_DIR, { recursive: true });

const EXCLUDE = new Set(["logo-mark-source.png"]); // handled by build-logo.mjs instead

const files = readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f) && !EXCLUDE.has(f));

for (const file of files) {
  const { name } = parse(file);
  const input = join(SRC_DIR, file);
  const meta = await sharp(input).metadata();

  for (const width of WIDTHS) {
    if (width > meta.width * 1.05) continue;

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(join(OUT_DIR, `${name}-${width}.webp`));

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 55, effort: 6 })
      .toFile(join(OUT_DIR, `${name}-${width}.avif`));
  }

  // small blur placeholder as base64-able tiny jpg
  await sharp(input)
    .resize({ width: 32 })
    .jpeg({ quality: 40 })
    .toFile(join(OUT_DIR, `${name}-tiny.jpg`));

  console.log(`optimized ${file}`);
}
