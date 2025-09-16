import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'public', 'assets');

// Mapping to desired original formats
const targetExtMap = new Map([
  ['constructionCalcSS', 'png'],
  ['portfolioSS', 'png'],
  ['galadeerSS', 'jpg'],
  ['severenceSS', 'png'],
  ['solitaireSS', 'jpg'],
  ['lebronSS', 'png'],
  ['IMG_3641', 'jpeg'],
]);

const ensureDir = async (p) => {
  await fs.mkdir(p, { recursive: true });
};

const convertOne = async (svgPath) => {
  const base = path.basename(svgPath, '.svg');
  const targetExt = targetExtMap.get(base) || 'png';
  const outPath = path.join(assetsDir, `${base}.${targetExt}`);

  const width = 1200; // upscale while keeping 16:9
  try {
    const buf = await fs.readFile(svgPath);
    const image = sharp(buf, { density: 300 });
    const pipeline = image.resize({ width, withoutEnlargement: false, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

    if (targetExt === 'png') await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
    else if (targetExt === 'jpg' || targetExt === 'jpeg') await pipeline.jpeg({ quality: 90 }).toFile(outPath);
    else if (targetExt === 'webp') await pipeline.webp({ quality: 90 }).toFile(outPath);
    else await pipeline.toFile(outPath);

    console.log(`Converted ${path.basename(svgPath)} -> ${path.basename(outPath)}`);
  } catch (err) {
    console.error('Failed to convert', svgPath, err);
  }
};

const main = async () => {
  await ensureDir(assetsDir);
  // find svg placeholders
  const svgs = await globby(['*.svg', '**/*.svg'], { cwd: assetsDir, absolute: true });
  if (svgs.length === 0) {
    console.log('No SVG files found in public/assets');
    return;
  }
  for (const svg of svgs) {
    await convertOne(svg);
  }
};

main().catch((e) => { console.error(e); process.exit(1); });
