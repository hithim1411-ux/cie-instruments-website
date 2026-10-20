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
import vSound from './vartech-sound-level-meters.json';
import vAnemo from './vartech-anemometers.json';
import vLux from './vartech-lux-meters.json';
import vThermo from './vartech-thermometers.json';
import vCal from './vartech-calibrators.json';
import vPsu from './vartech-dc-power-supplies.json';
import vSolder from './vartech-soldering-stations.json';
import vRework from './vartech-rework-stations.json';
import vIrons from './vartech-soldering-irons.json';
import vMag from './vartech-magnifiers.json';

interface Def { id: string; label: string; blurb: string; cie?: string[]; vt?: { slug: string; data: any[]; only?: string[] }[]; rows: Row[]; start?: string[] }

const R = (label: string, re: string): Row => ({ label, re });
const POWER = R('Power', '^(power|battery)');
const DIMS = R('Size and weight', '^(dimensions|weight)');
const WARR = R('Warranty', '^warranty');

const DEFS: Def[] = [
  { id: 'clamp-meters', label: 'Clamp meters', blurb: 'CIE and Vartech clamp multimeters side by side.', cie: ['clamp-meters'], vt: [{ slug: 'clamp-meters', data: vClamp as any[] }],
    rows: [R('Display and ranging', '^(display|ranging)'), R('Jaw opening', '^jaw'), R('AC current', '^ac(\\s&\\sdc)?\\scurrent'), R('DC current', '^dc current'), R('AC voltage', '^ac voltage|^true rms'), R('DC voltage', '^dc voltage'), R('Resistance', '^resistance'), R('Capacitance', '^capacitance'), R('Frequency', '^frequency'), R('Temperature', '^temperature'), R('Safety category', 'safety'), POWER, DIMS, WARR],
     },
  { id: 'multimeters', label: 'Digital multimeters', blurb: 'Compare CIE and Vartech multimeters from pocket models to bench units.', cie: ['multimeters'], vt: [{ slug: 'multimeters', data: vMultimeters as any[] }],
    rows: [R('Display and ranging', '^(display|ranging)'), R('True RMS', 'true.?rms'), R('DC voltage', '^dc voltage|^dcv'), R('AC voltage', '^ac voltage'), R('DC current', '^dc current'), R('AC current', '^ac current'), R('Resistance', '^resistance'), R('Capacitance', '^capacitance'), R('Frequency', '^frequency'), R('Temperature', '^temperature'), POWER, DIMS, WARR],
     },
  { id: 'insulation-testers', label: 'Insulation testers (analog and digital)', blurb: 'Analog hand-driven and motor-operated testers alongside the digital insulation testers.',
    cie: ['insulation-testers-hand', 'multirange-insulation-hand', 'motor-operated-insulation', 'multirange-motorised-insulation', 'compact-insulation-testers', 'digital-insulation-testers'],
    start: ['cie-444', 'dit-2500'],
    rows: [R('Type', '^type$'), R('Body', '^body'), R('Generator or drive', '^(generator type|drive)'), R('Test voltage', '^(insulation test voltage|output voltage)$'), R('Ranges', '^(insulation resistance( range)?|range configuration|ranges available|series available)$'), R('Continuity range', '^continuity'), R('Accuracy', '^(accuracy|insulation accuracy)'), R('Indicator or display', '^(indicator|display)'), R('Scale length', '^scale length'), R('Short-circuit current', '^short circuit'), R('DAR and PI', '^(dar|pi)$'), R('Test timer', '^test timer'), R('Power', '^(power|battery)'), R('Weight', '^weight'), R('Dimensions', '^dimensions'), R('Options', '^options$'), R('Ordering', '^ordering$'), WARR] },
  { id: 'earth-testers', label: 'Earth testers (analog and digital)', blurb: 'The analog CIE/222M and the digital DET-2000.', cie: ['earth-tester'], rows: [R('Type', '^type$'), R('Body', '^body'), R('Generator or power', '^(generator type|power)'), R('Terminals', '^(terminal types|terminals)'), R('Display', '^display'), R('Scale length', '^scale length'), R('Accuracy', '^accuracy'), R('Ranges', '^(range configuration|ranges available)'), R('Weight', '^weight'), R('Dimensions', '^dimensions'), R('Options', '^options$'), R('Ordering', '^ordering$'), WARR] },
  { id: 'relay-test-sets', label: 'Relay test sets', blurb: 'Single-phase and three-phase relay test sets.', cie: ['relay-test-sets'], rows: [],
     },
  { id: 'phase-sequence-indicators', label: 'Phase sequence indicators', blurb: 'Compare the two phase sequence indicators.', cie: ['phase-sequence-indicators'], rows: [] },
  { id: 'oscilloscopes', label: 'Oscilloscopes', blurb: 'Vartech analog and digital storage oscilloscopes.', vt: [{ slug: 'oscilloscopes', data: vScopes as any[] }],
    rows: [R('Channels', '^channels'), R('Bandwidth', '^bandwidth'), R('Sampling rate', '^(real-time sampling|sampling)'), R('Sweep time', '^sweep time'), R('Display', '^(display|crt)'), R('Vertical sensitivity', '^vertical sensitivity'), R('Record length', '^record length'), R('Interface', '^interface'), R('Power supply', '^power'), DIMS],
     },
  { id: 'function-generators', label: 'Function generators', blurb: 'Vartech arbitrary waveform and function generators.', vt: [{ slug: 'function-generators', data: vFg as any[] }],
    rows: [R('Channels', '^channels'), R('Waveforms', '^waveforms'), R('Sampling rate', '^sampling'), R('Display', '^display'), R('Interface', '^interface'), R('Power supply', '^power'), DIMS],
     },
  { id: 'lcr-meters', label: 'LCR meters', blurb: 'Vartech LCR meters and the LCR-capable multimeter.', vt: [{ slug: 'lcr-meters', data: vLcr as any[] }],
    rows: [R('Display', '^display'), R('Basic accuracy', '^basic accuracy'), R('Test frequency', '^test frequency'), R('Capacitance', '^capacitance'), R('Inductance', '^inductance'), R('Resistance', '^resistance'), R('Power', '^power'), DIMS],
     },
  { id: 'dc-loads', label: 'DC electronic loads', blurb: 'Compare the Vartech EL-600 series.', vt: [{ slug: 'dc-loads', data: vDcl as any[] }], rows: [],
     },
  { id: 'environment-meters', label: 'Sound, wind, light and temperature meters', blurb: 'Vartech sound level, air speed, lux and temperature meters.',
    vt: [{ slug: 'sound-level-meters', data: vSound as any[] }, { slug: 'anemometers', data: vAnemo as any[] }, { slug: 'lux-meters', data: vLux as any[] }, { slug: 'thermometers', data: vThermo as any[] }],
    rows: [R('Range', 'range( \\d)?$'), R('Accuracy', '^accuracy'), R('Display', '^(digital )?display'), R('Power', '^power'), DIMS] },
  { id: 'calibrators', label: 'Process calibrators', blurb: 'Vartech process and loop calibrators.', vt: [{ slug: 'calibrators', data: vCal as any[] }],
    rows: [R('Function', '^(function|measurands)'), R('Display', '^display'), R('Power', '^power'), DIMS] },
  { id: 'dc-power-supplies', label: 'DC power supplies', blurb: 'The full Vartech DC power supply range.', vt: [{ slug: 'dc-power-supplies', data: vPsu as any[] }],
    rows: [R('Output voltage', '^(output voltage|rated output|output$|variable output)'), R('Output current', '^output current'), R('Output power', '^(output power|rated power)'), R('Type', '^(type|mode|working mode)$'), R('Line regulation', 'line reg'), R('Load regulation', 'load reg'), R('Ripple and noise', '^ripple'), R('Protection', '^protection'), R('Display', '^display$'), R('PC interface', '^pc interface'), R('Power supply', '^power supply'), DIMS] },
  { id: 'soldering-stations', label: 'Soldering and de-soldering stations', blurb: 'Vartech soldering stations and vacuum de-soldering stations.', vt: [{ slug: 'soldering-stations', data: vSolder as any[] }],
    rows: [R('Power', '^(max\\. power|heating power)'), R('Temperature range', '^temperature range'), R('Temperature stability', '^temperature stability'), R('Heating element', '^heating element'), R('Vacuum pump', '^(pump|vacuum)'), R('Tip to ground', '^tip to ground'), R('Supply', '^(unit.s power|output voltage|power consumption)'), DIMS],
    start: ['936-a', '936-ad'] },
  { id: 'rework-stations', label: 'Hot-air SMD re-work stations', blurb: 'Vartech hot-air re-work stations and the two 2-in-1 re-work and soldering stations.', vt: [{ slug: 'rework-stations', data: vRework as any[], only: ['850-a', '850-d', '857-d', '861-dw', '700-esd', '706'] }],
    rows: [R('Hot-air power', '^(power|smd re-work section)'), R('Temperature range', '^temperature range'), R('Air flow', '^(air ?flow)'), R('Programmable channels', '^channels'), R('Noise', '^noise'), R('Soldering section', '^soldering section'), R('Supplied as standard', '^supplied'), DIMS],
    start: ['850-d', '857-d'] },
  { id: 'soldering-irons', label: 'Soldering irons', blurb: 'The Vartech SI series of plain soldering irons, 25 W to 100 W.', vt: [{ slug: 'soldering-irons', data: vIrons as any[] }],
    rows: [R('Power', '^power'), R('Supply', '^supply'), R('Heater', '^heater'), R('Body', '^body'), R('Tips', '^tips')] },
  { id: 'magnifiers', label: 'Magnifying lamps', blurb: 'Vartech LED and CFL magnifying lamps, from compact table-top to 7 inch clamp models.', vt: [{ slug: 'magnifiers', data: vMag as any[] }],
    rows: [R('Lens', '^(lens|lens size|lens diameter)'), R('Magnification', '^magnif'), R('Lighting', '^(lighting|lights)'), R('Mounting', '^feature'), R('Adjustable extent', '^adjustable'), R('Supply', '^supply'), R('Weight', '^weight')] },
  { id: 'hv-oil-micro-ohm', label: 'HV, oil and micro-ohm test sets', blurb: 'The CIE/5050A, CIE/7000 oil test set and MR-253A micro-ohm meter.', cie: ['hv-phase-sequence', 'oil-test-sets', 'digital-earth-micro-ohm'], rows: [] },
];

/** products.json category -> compare group */
const CATEGORY_GROUP: Record<string, string> = {
  'clamp-meters': 'clamp-meters', multimeters: 'multimeters', 'digital-insulation-testers': 'insulation-testers',
  'insulation-testers-hand': 'insulation-testers', 'multirange-insulation-hand': 'insulation-testers',
  'motor-operated-insulation': 'insulation-testers', 'multirange-motorised-insulation': 'insulation-testers',
  'compact-insulation-testers': 'insulation-testers',
  'earth-tester': 'earth-testers', 'relay-test-sets': 'relay-test-sets', 'phase-sequence-indicators': 'phase-sequence-indicators',
  'vartech-clamp-meters': 'clamp-meters', 'vartech-multimeters': 'multimeters', 'vartech-oscilloscopes': 'oscilloscopes',
  'vartech-sound-level-meters': 'environment-meters', 'vartech-anemometers': 'environment-meters', 'vartech-lux-meters': 'environment-meters', 'vartech-thermometers': 'environment-meters',
  'vartech-calibrators': 'calibrators', 'vartech-dc-power-supplies': 'dc-power-supplies',
  'hv-phase-sequence': 'hv-oil-micro-ohm', 'oil-test-sets': 'hv-oil-micro-ohm', 'digital-earth-micro-ohm': 'hv-oil-micro-ohm',
  'vartech-function-generators': 'function-generators', 'vartech-lcr-meters': 'lcr-meters', 'vartech-dc-loads': 'dc-loads',
  'vartech-soldering-stations': 'soldering-stations', 'vartech-rework-stations': 'rework-stations', 'vartech-soldering-irons': 'soldering-irons', 'vartech-magnifiers': 'magnifiers',
};
// A couple of SKUs use a different id in products.json than in the vartech-*.json files
const ID_ALIAS: Record<string, string> = { 'v-8222h-lcr': 'v-8222h', 'ss-5150ds1bfg': 'ss-5150ds1b-fg' };

const exists = (p: string) => fs.existsSync(`${process.cwd()}/public${p}`);
const trim = (specs: any[]) => (specs || []).map((s: any) => ({ l: String(s.label), v: String(s.value) }));
// Ranges, options and ordering notes live outside `specs` on CIE products; include them so nothing shown on the product page is missing here.
const TYPE: Record<string, string> = {
  'digital-insulation-testers': 'Digital (LCD display)', 'insulation-testers-hand': 'Analog (pointer scale)', 'multirange-insulation-hand': 'Analog (pointer scale)',
  'motor-operated-insulation': 'Analog (pointer scale)', 'multirange-motorised-insulation': 'Analog (pointer scale)', 'compact-insulation-testers': 'Analog (pointer scale)',
};
const TYPE_BY_ID: Record<string, string> = { 'cie-222m': 'Analog (pointer scale)', 'det-2000': 'Digital (LCD display)' };
const extras = (p: any) => {
  const out: { l: string; v: string }[] = [];
  const ty = TYPE_BY_ID[p.id] ?? TYPE[p.categoryId];
  if (ty) out.push({ l: 'Type', v: ty });
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
    for (const v of d.vt ?? []) {
      for (const p of v.data.filter((x: any) => !v.only || v.only.includes(x.id))) {
        const f = p.images && p.images[0];
        items.push({ id: p.id, brand: 'Vartech', model: p.model, name: p.name, cat: `vartech-${v.slug}`, href: u(`/authorised-dealership/${v.slug}/${p.id}/`), img: f && exists(`/images/vartech/${v.slug}/${f}`) ? u(`/images/vartech/${v.slug}/${f}`) : '', specs: trim(p.specs) });
      }
    }
    return { id: d.id, label: d.label, blurb: d.blurb, rows: d.rows, start: d.start, items };
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
