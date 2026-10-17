// Builds the homepage hero wall: small square thumbnails (background baked in
// from each photo's own studio backdrop) + a manifest the page reads.
// Re-run after adding/removing hero products:  node scripts/gen-hero-tiles.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'));
const outDir = path.join(root, 'public/images/hero');
fs.mkdirSync(outDir, { recursive: true });

const cie = read('products.json').filter((p) => p.brand !== 'vartech');
const vt = (file, slug, label, take) => ({ items: read(file), slug, label, take });
const sections = [
  vt('vartech-multimeters.json', 'multimeters', 'Multimeters', 4),
  vt('vartech-clamp-meters.json', 'clamp-meters', 'Clamp Meters', 3),
  vt('vartech-oscilloscopes.json', 'oscilloscopes', 'Oscilloscopes', 3),
  vt('vartech-function-generators.json', 'function-generators', 'Function Generators', 2),
  vt('vartech-lcr-meters.json', 'lcr-meters', 'LCR Meters', 2),
  vt('vartech-dc-loads.json', 'dc-loads', 'DC Loads', 1),
  vt('vartech-thermometers.json', 'thermometers', 'Thermometers', 1),
  vt('vartech-lux-meters.json', 'lux-meters', 'Lux Meters', 1),
  vt('vartech-calibrators.json', 'calibrators', 'Calibrators', 1),
  vt('vartech-sound-level-meters.json', 'sound-level-meters', 'Sound Level Meters', 1),
  vt('vartech-anemometers.json', 'anemometers', 'Anemometers', 1),
  vt('vartech-dc-power-supplies.json', 'dc-power-supplies', 'DC Power Supplies', 2),
];

const entries = [];
for (const p of cie) {
  const file = p.image && !p.image.startsWith('vartech/') ? p.image : `${p.id}.webp`;
  entries.push({ id: p.id, brand: 'cie', label: p.model, note: p.name,
    href: `/products/${p.categoryId}/${p.id}/`, file: `public/images/products/${file}` });
}
for (const s of sections) {
  // spread picks across the list rather than taking the first few
  const n = s.items.length, step = n / s.take;
  for (let i = 0; i < s.take; i++) {
    const p = s.items[Math.floor(i * step)];
    if (!p?.images?.[0]) continue;
    entries.push({ id: p.id, brand: 'vartech', label: p.model, note: p.name,
      href: `/authorised-dealership/${s.slug}/${p.id}/`, file: `public/images/vartech/${s.slug}/${p.images[0]}` });
  }
}

async function bgOf(file) {
  const { data, info } = await sharp(file).ensureAlpha().extract({ left: 3, top: 3, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const [r, g, b, a] = data;
  return a < 200 ? { r: 241, g: 241, b: 241 } : { r, g, b };
}

const out = [];
for (const e of entries) {
  const abs = path.join(root, e.file);
  if (!fs.existsSync(abs)) { console.warn('missing', e.file); continue; }
  const bg = await bgOf(abs);
  const SIZE = 360, PAD = 22;
  const inner = await sharp(abs).resize({ width: SIZE - PAD * 2, height: SIZE - PAD * 2, fit: 'inside' })
    .flatten({ background: bg }).toBuffer();
  const name = `${e.id}.webp`;
  await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: bg } })
    .composite([{ input: inner, gravity: 'centre' }]).webp({ quality: 78 }).toFile(path.join(outDir, name));
  out.push({ id: e.id, brand: e.brand, label: e.label, note: e.note, href: e.href, src: `/images/hero/${name}` });
}
fs.writeFileSync(path.join(root, 'src/data/hero-tiles.json'), JSON.stringify(out, null, 1));
console.log(out.length, 'tiles', out.filter((x) => x.brand === 'cie').length, 'CIE');
