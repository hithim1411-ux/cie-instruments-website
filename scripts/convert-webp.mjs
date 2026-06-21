import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const QUALITY = 82;

const dirs = [
  'public/images/products',
  'public/images',
  'public/images/vartech/multimeters',
  'public/clients',
  'public/banners',
];

let totalSaved = 0;

for (const dir of dirs) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const input = join(dir, file);
    const outName = basename(file, ext) + '.webp';
    const output = join(dir, outName);

    try {
      const inSize = (await stat(input)).size;
      await sharp(input).webp({ quality: QUALITY }).toFile(output);
      const outSize = (await stat(output)).size;
      const saved = inSize - outSize;
      totalSaved += saved;
      console.log(`✓ ${input} → ${outName}  (${(saved / 1024).toFixed(0)} KB saved)`);
    } catch (err) {
      console.error(`✗ ${input}: ${err.message}`);
    }
  }
}

console.log(`\nTotal saved: ${(totalSaved / 1024).toFixed(0)} KB`);
