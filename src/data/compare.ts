// Build-time data for the comparison tool (/compare/, product-page widget, listing buttons).
import fs from 'node:fs';
import { u } from '../utils/url';
import type { Group, Item, Row } from '../utils/compareCore';
import products from './products.json';
import vMultimeters from './vartech-multimeters.json';
import vClamp from './vartech-clamp-meters.json';
import vScopes from './vartech-oscilloscopes.json';
import vFg from './vartech-function-generators.json';
import vLcr from './vartech-lcr-meters.json';
import vDcl from './vartech-dc-loads.json';

interface Def { id: string; label: string; blurb: string; cie?: string[]; vt?: { slug: string; data: any[] }; rows: Row[] }

const R = (label: string, re: string): Row => ({ label, re });
const POWER = R('Power', '^(power|battery)');
const DIMS = R('Size and weight', '^(dimensions|weight)');
const WARR = R('Warranty', '^warranty');

const DEFS: Def[] = [
  { id: 'clamp-meters', label: 'Clamp meters', blurb: 'CIE and Vartech clamp multimeters side by side.', cie: ['clamp-meters'], vt: { slug: 'clamp-meters', data: vClamp as any[] },
    rows: [R('Display and ranging', '^(display|ranging)'), R('Jaw opening', '^jaw'), R('AC current', '^ac(\\s&\\sdc)?\\scurrent'), R('DC current', '^dc current'), R('AC voltage', '^ac voltage|^true rms'), R('DC voltage', '^dc voltage'), R('Resistance', '^resistance'), R('Capacitance', '^capacitance'), R('Frequency', '^frequency'), R('Temperature', '^temperature'), R('Safety category', 'safety'), POWER, DIMS, WARR],
     },
  { id: 'multimeters', label: 'Digital multimeters', blurb: 'Compare CIE and Vartech multimeters from pocket models to bench units.', cie: ['multimeters'], vt: { slug: 'multimeters', data: vMultimeters as any[] },
    rows: [R('Display and ranging', '^(display|ranging)'), R('True RMS', 'true.?rms'), R('DC voltage', '^dc voltage|^dcv'), R('AC voltage', '^ac voltage'), R('DC current', '^dc current'), R('AC current', '^ac current'), R('Resistance', '^resistance'), R('Capacitance', '^capacitance'), R('Frequency', '^frequency'), R('Temperature', '^temperature'), POWER, DIMS, WARR],
     },
  { id: 'digital-insulation-testers', label: 'Digital insulation testers', blurb: 'Test voltage, range and accuracy across the digital insulation testers.', cie: ['digital-insulation-testers'],
    rows: [R('Test voltage', '^(insulation test voltage|output voltage)$'), R('Insulation range', '^insulation resistance( range)?$'), R('Ranges by test voltage', '^ranges available'), R('Accuracy', '^(accuracy|insulation accuracy)'), R('Short-circuit current', '^short circuit'), R('DAR and PI', '^(dar|pi)$'), R('Test timer', '^test timer'), R('Display', '^display'), POWER, DIMS, WARR],
     },
  { id: 'hand-driven-insulation-testers', label: 'Hand-driven and motorised insulation testers', blurb: 'The CIE/444, 555, 666 and 777 families, including multirange versions.', cie: ['insulation-testers-hand', 'multirange-insulation-hand', 'motor-operated-insulation', 'multirange-motorised-insulation', 'compact-insulation-testers'],
    rows: [R('Body', '^body'), R('Generator or drive', '^(generator type|drive)'), R('Indicator or display', '^(indicator|display)'), R('Accuracy', '^accuracy'), R('Ranges', '^(range configuration|ranges available|series available)'), R('Continuity range', '^continuity'), R('Weight', '^weight'), R('Dimensions', '^dimensions'), R('Options', '^options$'), R('Ordering', '^ordering$'), WARR],
     },
  { id: 'earth-testers', label: 'Earth testers', blurb: 'Compare the earth resistance testers.', cie: ['earth-tester'], rows: [] },
  { id: 'relay-test-sets', label: 'Relay test sets', blurb: 'Single-phase and three-phase relay test sets.', cie: ['relay-test-sets'], rows: [],
     },
  { id: 'phase-sequence-indicators', label: 'Phase sequence indicators', blurb: 'Compare the two phase sequence indicators.', cie: ['phase-sequence-indicators'], rows: [] },
  { id: 'oscilloscopes', label: 'Oscilloscopes', blurb: 'Vartech analog and digital storage oscilloscopes.', vt: { slug: 'oscilloscopes', data: vScopes as any[] },
    rows: [R('Channels', '^channels'), R('Bandwidth', '^bandwidth'), R('Sampling rate', '^(real-time sampling|sampling)'), R('Sweep time', '^sweep time'), R('Display', '^(display|crt)'), R('Vertical sensitivity', '^vertical sensitivity'), R('Record length', '^record length'), R('Interface', '^interface'), R('Power supply', '^power'), DIMS],
     },
  { id: 'function-generators', label: 'Function generators', blurb: 'Vartech arbitrary waveform and function generators.', vt: { slug: 'function-generators', data: vFg as any[] },
    rows: [R('Channels', '^channels'), R('Waveforms', '^waveforms'), R('Sampling rate', '^sampling'), R('Display', '^display'), R('Interface', '^interface'), R('Power supply', '^power'), DIMS],
     },
  { id: 'lcr-meters', label: 'LCR meters', blurb: 'Vartech LCR meters and the LCR-capable multimeter.', vt: { slug: 'lcr-meters', data: vLcr as any[] },
    rows: [R('Display', '^display'), R('Basic accuracy', '^basic accuracy'), R('Test frequency', '^test frequency'), R('Capacitance', '^capacitance'), R('Inductance', '^inductance'), R('Resistance', '^resistance'), R('Power', '^power'), DIMS],
     },
  { id: 'dc-loads', label: 'DC electronic loads', blurb: 'Compare the Vartech EL-600 series.', vt: { slug: 'dc-loads', data: vDcl as any[] }, rows: [],
     },
];

/** products.json category -> compare group */
const CATEGORY_GROUP: Record<string, string> = {
  'clamp-meters': 'clamp-meters', multimeters: 'multimeters', 'digital-insulation-testers': 'digital-insulation-testers',
  'insulation-testers-hand': 'hand-driven-insulation-testers', 'multirange-insulation-hand': 'hand-driven-insulation-testers',
  'motor-operated-insulation': 'hand-driven-insulation-testers', 'multirange-motorised-insulation': 'hand-driven-insulation-testers',
  'compact-insulation-testers': 'hand-driven-insulation-testers',
  'earth-tester': 'earth-testers', 'relay-test-sets': 'relay-test-sets', 'phase-sequence-indicators': 'phase-sequence-indicators',
  'vartech-clamp-meters': 'clamp-meters', 'vartech-multimeters': 'multimeters', 'vartech-oscilloscopes': 'oscilloscopes',
  'vartech-function-generators': 'function-generators', 'vartech-lcr-meters': 'lcr-meters', 'vartech-dc-loads': 'dc-loads',
};
// A couple of SKUs use a different id in products.json than in the vartech-*.json files
const ID_ALIAS: Record<string, string> = { 'v-8222h-lcr': 'v-8222h', 'ss-5150ds1bfg': 'ss-5150ds1b-fg' };

const exists = (p: string) => fs.existsSync(`${process.cwd()}/public${p}`);
const trim = (specs: any[]) => (specs || []).map((s: any) => ({ l: String(s.label), v: String(s.value) }));
// Ranges, options and ordering notes live outside `specs` on CIE products; include them so nothing shown on the product page is missing here.
const extras = (p: any) => {
  const out: { l: string; v: string }[] = [];
  const tables = (p.specTables || []).map((t: any) => (t.rows || []).map((r: any) => {
    const cells = (t.columns || []).map((_: any, i: number) => r['col' + i]).filter(Boolean);
    const [a, b, ...rest] = cells;
    return `${a}: ${b ?? ''}` + rest.map((c: string, i: number) => ` (${t.columns[i + 2]}: ${c})`).join('');
  }).join(' | ')).filter(Boolean);
  if (tables.length) out.push({ l: 'Ranges available', v: tables.join(' | ') });
  if (p.options && p.options.length) out.push({ l: 'Options', v: p.options.join(' | ') });
  if (p.orderNote) out.push({ l: 'Ordering', v: String(p.orderNote) });
  return out;
};

let built: Group[] | null = null;
export function getGroups(): Group[] {
  if (built) return built;
  built = DEFS.map(d => {
    const items: Item[] = [];
    for (const catId of d.cie ?? []) {
      for (const p of (products as any[]).filter(x => x.categoryId === catId)) {
        const f = (p.images && p.images[0]) || `${p.id}.webp`;
        items.push({ id: p.id, brand: 'CIE', model: p.model, name: p.name, cat: catId, href: u(`/products/${catId}/${p.id}/`), img: exists(`/images/products/${f}`) ? u(`/images/products/${f}`) : '', specs: [...trim(p.specs), ...extras(p)] });
      }
    }
    if (d.vt) {
      for (const p of d.vt.data) {
        const f = p.images && p.images[0];
        items.push({ id: p.id, brand: 'Vartech', model: p.model, name: p.name, cat: `vartech-${d.vt.slug}`, href: u(`/authorised-dealership/${d.vt.slug}/${p.id}/`), img: f && exists(`/images/vartech/${d.vt.slug}/${f}`) ? u(`/images/vartech/${d.vt.slug}/${f}`) : '', specs: trim(p.specs) });
      }
    }
    return { id: d.id, label: d.label, blurb: d.blurb, rows: d.rows, items };
  }).filter(g => g.items.length >= 2);
  return built;
}

/** Find the compare group + item for a product shown on a listing or detail page. */
export function compareRef(categoryId: string, id: string): { group: Group; item: Item } | null {
  const gid = CATEGORY_GROUP[categoryId];
  if (!gid) return null;
  const group = getGroups().find(g => g.id === gid);
  if (!group) return null;
  const item = group.items.find(i => i.id === (ID_ALIAS[id] ?? id));
  return item ? { group, item } : null;
}
export const compareGroupForCategory = (categoryId: string) => CATEGORY_GROUP[categoryId];
