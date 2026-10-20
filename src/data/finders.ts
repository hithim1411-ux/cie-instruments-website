// Instrument finders: one config per product FAMILY (not per site category), so that
// analog and digital versions of the same instrument are compared side by side.
// Every attribute below was read from products.json, vartech-*.json, config-catalogues.json
// or the models' own specTables. Where a value is not stated in the data it is left out
// (false / null) rather than guessed.
//
// vr = [{ v: test voltage, max: highest resistance readable at that voltage in MOhm | null }]
// null means the datasheet does not give a per-voltage range (shown as "check datasheet").

export type FilterDef =
  | { type: 'choice'; key: string; label: string; options: { value: string; label: string }[] }
  | { type: 'min'; key: string; label: string; unit: string; options: number[]; help?: string }
  | { type: 'has'; key: string; label: string; hint?: string }
  | { type: 'vr'; label: string; volts: number[]; ohms: { value: number; label: string }[] };

export interface FinderModel {
  src: 'cie' | string;            // 'cie' = products.json, otherwise vartech slug (e.g. 'multimeters')
  id: string;
  attrs: Record<string, any>;
  vr?: { v: number; max: number | null }[];
  chips?: string[];
}

export interface Family {
  id: string;
  title: string;                  // "Insulation testers"
  heading: string;
  lead: string;
  filters: FilterDef[];
  models: FinderModel[];
  categories: string[];           // category ids that embed this finder
  unit?: string;                  // singular noun for messages
}

const insulation: Family = {
  id: 'insulation-testers',
  title: 'Insulation testers',
  unit: 'insulation tester',
  heading: 'Find the right insulation tester',
  lead: 'Analog hand-cranked, motor-driven and digital insulation testers are all here together. Say what you need to test and what must be true of the instrument.',
  categories: ['insulation-testers-hand', 'multirange-insulation-hand', 'motor-operated-insulation', 'multirange-motorised-insulation', 'compact-insulation-testers', 'digital-insulation-testers'],
  filters: [
    { type: 'vr', label: 'Test voltage and resistance', volts: [100, 250, 500, 1000, 2500, 5000, 10000],
      ohms: [{ value: 100, label: '100 MΩ' }, { value: 1000, label: '1 GΩ' }, { value: 10000, label: '10 GΩ' }, { value: 100000, label: '100 GΩ' }] },
    { type: 'choice', key: 'display', label: 'Analog or digital?', options: [
      { value: 'analog', label: 'Analog pointer' }, { value: 'digital', label: 'Digital LCD' }] },
    { type: 'choice', key: 'power', label: 'How is it powered?', options: [
      { value: 'hand', label: 'Hand crank (no battery or mains)' },
      { value: 'motor', label: 'Mains motor' },
      { value: 'battery', label: 'Battery (rechargeable or AA)' }] },
    { type: 'has', key: 'pi', label: 'Polarization index (PI) and DAR tests', hint: 'sustained test voltage for 10 minutes' },
    { type: 'has', key: 'multivolt', label: 'Several test voltages on one instrument' },
    { type: 'has', key: 'cont', label: 'Built-in continuity test' },
  ],
  models: [
    { src: 'cie', id: 'cie-444', attrs: { display: 'analog', power: ['hand'] }, chips: ['Metal body', 'Single voltage, built to order'],
      vr: [{ v: 100, max: 100 }, { v: 250, max: 250 }, { v: 500, max: 2000 }, { v: 1000, max: 2000 }, { v: 2500, max: 50000 }, { v: 5000, max: 50000 }] },
    { src: 'cie', id: 'cie-666', attrs: { display: 'analog', power: ['hand'] }, chips: ['Wooden body', 'Single voltage, built to order'],
      vr: [{ v: 100, max: 100 }, { v: 250, max: 250 }, { v: 500, max: 2000 }, { v: 1000, max: 2000 }, { v: 2500, max: 50000 }, { v: 5000, max: 100000 }, { v: 10000, max: 100000 }] },
    { src: 'cie', id: 'cie-555', attrs: { display: 'analog', power: ['hand'] }, chips: ['Compact bakelite body', 'Single voltage, built to order'],
      vr: [{ v: 100, max: 20 }, { v: 250, max: 50 }, { v: 500, max: 500 }, { v: 1000, max: 500 }] },
    { src: 'cie', id: 'cie-444-mr', attrs: { display: 'analog', power: ['hand'], multivolt: true, cont: true }, chips: ['Metal body', 'Selector switch, up to 3 voltages'],
      vr: [{ v: 100, max: 200 }, { v: 250, max: 500 }, { v: 500, max: 1000 }, { v: 1000, max: 2000 }] },
    { src: 'cie', id: 'cie-666-mr', attrs: { display: 'analog', power: ['hand'], multivolt: true, cont: true }, chips: ['Wooden body', 'Selector switch, up to 3 voltages'],
      vr: [{ v: 100, max: 200 }, { v: 250, max: 500 }, { v: 500, max: 1000 }, { v: 1000, max: 2000 }, { v: 2500, max: 10000 }, { v: 5000, max: 20000 }] },
    { src: 'cie', id: 'cie-777', attrs: { display: 'analog', power: ['motor'], pi: true }, chips: ['Wooden cabinet', 'Sustained test voltage'],
      vr: [{ v: 500, max: 1000 }, { v: 1000, max: 2000 }, { v: 2500, max: 20000 }, { v: 5000, max: 100000 }, { v: 10000, max: 100000 }] },
    { src: 'cie', id: 'cie-777-hm', attrs: { display: 'analog', power: ['motor', 'hand'], pi: true }, chips: ['Motor plus hand-crank backup', 'Works without mains'],
      vr: [{ v: 500, max: 1000 }, { v: 1000, max: 2000 }, { v: 2500, max: 20000 }, { v: 5000, max: 100000 }, { v: 10000, max: 100000 }] },
    { src: 'cie', id: 'cie-777-mr', attrs: { display: 'analog', power: ['motor'], pi: true, multivolt: true }, chips: ['Dual inner/outer scale', 'Up to 3 voltages'],
      vr: [{ v: 1000, max: 20000 }, { v: 2500, max: 50000 }, { v: 5000, max: 100000 }] },
    { src: 'cie', id: 'cie-777-hm-mr', attrs: { display: 'analog', power: ['motor', 'hand'], pi: true, multivolt: true }, chips: ['Dual scale, motor plus hand crank', 'Up to 3 voltages'],
      vr: [{ v: 1000, max: 20000 }, { v: 2500, max: 50000 }, { v: 5000, max: 100000 }] },
    { src: 'cie', id: 'dit-5005', attrs: { display: 'digital', power: ['battery'] }, chips: ['550 g, handheld or bench', 'Rechargeable'],
      vr: [{ v: 500, max: 1000 }, { v: 1000, max: 2000 }] },
    { src: 'cie', id: 'dit-2500', attrs: { display: 'digital', power: ['battery'], pi: true, multivolt: true, cont: true }, chips: ['Also a True-RMS multimeter', 'Rechargeable Li-ion'],
      vr: [{ v: 100, max: 2000 }, { v: 250, max: 5000 }, { v: 500, max: 10000 }, { v: 1000, max: 20000 }, { v: 2500, max: 50000 }] },
    { src: 'cie', id: 'dit-5000', attrs: { display: 'digital', power: ['battery'], multivolt: true }, chips: ['Auto-ranging to 200 GΩ', '6 x AA batteries'],
      vr: [{ v: 500, max: null }, { v: 1000, max: null }, { v: 2500, max: null }, { v: 5000, max: 200000 }] },
  ],
};

const earth: Family = {
  id: 'earth-testers',
  title: 'Earth testers',
  unit: 'earth tester',
  heading: 'Find the right earth tester',
  lead: 'Analog hand-driven and digital earth resistance testers, side by side. Both can measure soil resistivity with the 4-terminal connection.',
  categories: ['earth-tester'],
  filters: [
    { type: 'choice', key: 'display', label: 'Analog or digital?', options: [
      { value: 'analog', label: 'Analog pointer' }, { value: 'digital', label: 'Digital LCD' }] },
    { type: 'choice', key: 'power', label: 'How is it powered?', options: [
      { value: 'hand', label: 'Hand crank (no battery)' }, { value: 'battery', label: 'Rechargeable battery' }] },
    { type: 'min', key: 'maxOhm', label: 'Highest earth resistance to read', unit: 'Ω', options: [100, 500, 2000, 5000, 10000],
      help: 'Highest range offered in the configuration list' },
    { type: 'has', key: 'soil', label: 'Soil resistivity (4-terminal)' },
  ],
  models: [
    { src: 'cie', id: 'cie-222m', attrs: { display: 'analog', power: ['hand'], maxOhm: 10000, soil: true }, chips: ['Metal body', '3-terminal or 4-terminal type', 'Built to order'] },
    { src: 'cie', id: 'det-2000', attrs: { display: 'digital', power: ['battery'], maxOhm: 2000, soil: true }, chips: ['575 g, handheld or bench', 'Dual and triple range options'] },
  ],
};

const multimeters: Family = {
  id: 'multimeters',
  title: 'Multimeters',
  unit: 'multimeter',
  heading: 'Find the right multimeter',
  lead: 'Every CIE and Vartech digital multimeter in one place. Choose the resolution and ratings you need, then tick the features that matter.',
  categories: ['multimeters', 'vartech-multimeters'],
  filters: [
    { type: 'min', key: 'counts', label: 'Resolution (display counts)', unit: 'counts', options: [2000, 4000, 6000, 20000, 30000], help: 'More counts, finer readings' },
    { type: 'min', key: 'vdc', label: 'Highest DC voltage', unit: 'V', options: [600, 1000] },
    { type: 'min', key: 'amax', label: 'Highest current (direct)', unit: 'A', options: [10, 20] },
    { type: 'has', key: 'trms', label: 'True RMS', hint: 'correct on VFDs and non-sine loads' },
    { type: 'has', key: 'auto', label: 'Auto-ranging on all functions' },
    { type: 'has', key: 'ncv', label: 'Live-wire / non-contact detection' },
    { type: 'has', key: 'cap', label: 'Capacitance' },
    { type: 'has', key: 'freq', label: 'Frequency' },
    { type: 'has', key: 'temp', label: 'Temperature probe' },
    { type: 'has', key: 'ind', label: 'Inductance (LCR)' },
    { type: 'has', key: 'pc', label: 'PC interface and data logging' },
  ],
  models: [
    { src: 'cie', id: 'dm-235', attrs: { counts: 2000, vdc: 1000, amax: 20, cap: true }, chips: ['CIE, manual-ranging', 'hFE transistor test'] },
    { src: 'cie', id: 'dm-321t', attrs: { counts: 2000, vdc: 1000, amax: 20, trms: true, cap: true }, chips: ['CIE, manual-ranging', 'Backlight and holster'] },
    { src: 'multimeters', id: 'v-mas-830-lb', attrs: { counts: 2000, vdc: 600, amax: 10 }, chips: ['Vartech, backlit', 'Everyday electrical work'] },
    { src: 'multimeters', id: 'v-830-l-plus', attrs: { counts: 2000, vdc: 600, amax: 10, trms: true, ncv: true }, chips: ['Vartech', '200 MΩ resistance'] },
    { src: 'multimeters', id: 'm-890', attrs: { counts: 2000, vdc: 1000, amax: 10, trms: true, ncv: true, cap: true }, chips: ['Vartech', 'Full-function'] },
    { src: 'multimeters', id: 'v-890-d', attrs: { counts: 2000, vdc: 1000, amax: 20, trms: true, ncv: true, cap: true }, chips: ['Vartech', 'Capacitance to 20 mF'] },
    { src: 'multimeters', id: 'v-8222-g', attrs: { counts: 2000, vdc: 1000, amax: 20, trms: true, ncv: true, cap: true, freq: true, temp: true }, chips: ['Vartech', '1000 V AC and DC'] },
    { src: 'multimeters', id: 'v-8222-h', attrs: { counts: 2000, vdc: 1000, amax: 20, trms: true, cap: true, freq: true, temp: true, ind: true }, chips: ['Vartech', 'Measures inductance too'] },
    { src: 'multimeters', id: 'v-68', attrs: { counts: 4000, vdc: 1000, amax: 10, trms: true, auto: true, ncv: true, cap: true, freq: true, temp: true }, chips: ['Vartech', 'Frequency to 20 MHz'] },
    { src: 'multimeters', id: 'v-92', attrs: { counts: 6000, vdc: 600, amax: 10, trms: true, auto: true, ncv: true, cap: true, freq: true, temp: true }, chips: ['Vartech', 'Auto-ranging, 6000 counts'] },
    { src: 'multimeters', id: 'v-92-s', attrs: { counts: 6000, vdc: 600, amax: 10, trms: true, auto: true, ncv: true, cap: true, freq: true, temp: true }, chips: ['Vartech', 'Smart auto-detect, dual display'] },
    { src: 'multimeters', id: 'v-980', attrs: { counts: 20000, vdc: 1000, amax: 20, trms: true, ncv: true, cap: true, freq: true, temp: true }, chips: ['Vartech', '4½ digit, 0.1% DC accuracy'] },
    { src: 'multimeters', id: 'v-981-plus', attrs: { counts: 30000, vdc: 1000, amax: 10, trms: true, auto: true, cap: true, freq: true, temp: true, pc: true }, chips: ['Vartech bench-top', 'Colour TFT, 300 MHz frequency'] },
  ],
};

const clamp: Family = {
  id: 'clamp-meters',
  title: 'Clamp meters',
  unit: 'clamp meter',
  heading: 'Find the right clamp meter',
  lead: 'CIE and Vartech clamp meters together. Start with the current you need to measure and whether it is AC or DC.',
  categories: ['clamp-meters', 'vartech-clamp-meters'],
  filters: [
    { type: 'min', key: 'maxA', label: 'Highest current to measure', unit: 'A', options: [60, 200, 600, 1000] },
    { type: 'has', key: 'dc', label: 'DC current (solar, batteries, drives)' },
    { type: 'has', key: 'leak', label: 'mA-level leakage current' },
    { type: 'has', key: 'trms', label: 'True RMS' },
    { type: 'has', key: 'ncv', label: 'Live-wire / non-contact detection' },
    { type: 'has', key: 'cap', label: 'Capacitance' },
    { type: 'has', key: 'temp', label: 'Temperature probe' },
  ],
  models: [
    { src: 'cie', id: 'dcm-2250-tr', attrs: { maxA: 1000, trms: true, ncv: true }, chips: ['CIE, AC current only', '6000 counts, CAT III 600 V'] },
    { src: 'cie', id: 'dcm-5410-tr', attrs: { maxA: 1000, dc: true, trms: true, ncv: true, cap: true, temp: true }, chips: ['CIE, AC and DC current', 'CAT III 600 V'] },
    { src: 'clamp-meters', id: 'v-266', attrs: { maxA: 1000 }, chips: ['Vartech, AC current', '50 mm jaw'] },
    { src: 'clamp-meters', id: 'v-266-plus', attrs: { maxA: 1000, ncv: true }, chips: ['Vartech, AC current', '4000 counts'] },
    { src: 'clamp-meters', id: 'v-266-c', attrs: { maxA: 1000, ncv: true, cap: true, temp: true }, chips: ['Vartech, AC current', '6000 counts, backlight'] },
    { src: 'clamp-meters', id: 'm-2101', attrs: { maxA: 1000, dc: true, trms: true, cap: true, temp: true }, chips: ['Vartech, AC and DC current', 'µA ranges via leads'] },
    { src: 'clamp-meters', id: 'v-2001-plus', attrs: { maxA: 200, trms: true, ncv: true, cap: true, temp: true }, chips: ['Vartech, 150 g pocket size', 'Type-C rechargeable'] },
    { src: 'clamp-meters', id: 'v-2002-plus', attrs: { maxA: 60, dc: true, leak: true, trms: true, ncv: true, cap: true, temp: true }, chips: ['Vartech, leakage clamp', 'Resolves from 600 mA'] },
  ],
};

const scopes: Family = {
  id: 'oscilloscopes',
  title: 'Oscilloscopes',
  unit: 'oscilloscope',
  heading: 'Find the right oscilloscope',
  lead: 'Analog and digital storage oscilloscopes from Vartech. Pick the bandwidth and channels you need.',
  categories: ['vartech-oscilloscopes'],
  filters: [
    { type: 'choice', key: 'kind', label: 'Analog or digital?', options: [
      { value: 'analog', label: 'Analog (CRO)' }, { value: 'digital', label: 'Digital storage (DSO)' }] },
    { type: 'min', key: 'bw', label: 'Bandwidth', unit: 'MHz', options: [20, 30, 80, 100, 150] },
    { type: 'min', key: 'ch', label: 'Channels', unit: 'channels', options: [2, 4] },
    { type: 'has', key: 'fg', label: 'Built-in function generator' },
    { type: 'has', key: 'comp', label: 'Built-in component tester' },
    { type: 'has', key: 'usb', label: 'USB save and export' },
  ],
  models: [
    { src: 'oscilloscopes', id: 'ss-5020b', attrs: { kind: 'analog', bw: 20, ch: 2 }, chips: ['Analog CRO', 'Everyday electronics'] },
    { src: 'oscilloscopes', id: 'ss-5030b', attrs: { kind: 'analog', bw: 30, ch: 2 }, chips: ['Analog CRO', 'TV sync trigger'] },
    { src: 'oscilloscopes', id: 'ss-5030bc', attrs: { kind: 'analog', bw: 30, ch: 2, comp: true }, chips: ['Analog CRO', 'Component tester'] },
    { src: 'oscilloscopes', id: 'ss-5080ds4', attrs: { kind: 'digital', bw: 80, ch: 4, usb: true }, chips: ['Digital, 1 GS/s', '7-inch colour display'] },
    { src: 'oscilloscopes', id: 'ss-5100ds1b', attrs: { kind: 'digital', bw: 100, ch: 2, usb: true }, chips: ['Digital, 1 GS/s', 'Deep record length'] },
    { src: 'oscilloscopes', id: 'ss-5150ds1b-fg', attrs: { kind: 'digital', bw: 150, ch: 2, fg: true, usb: true }, chips: ['Digital, 1 GS/s', '25 MHz generator built in'] },
  ],
};

const funcgens: Family = {
  id: 'function-generators',
  title: 'Function generators',
  unit: 'function generator',
  heading: 'Find the right function generator',
  lead: 'Vartech DDS function and arbitrary waveform generators. Choose the frequency you need and the waveform features.',
  categories: ['vartech-function-generators'],
  filters: [
    { type: 'min', key: 'mhz', label: 'Highest sine frequency', unit: 'MHz', options: [6, 15, 30, 60, 80] },
    { type: 'has', key: 'custom', label: 'Create your own waveforms' },
    { type: 'has', key: 'mod', label: 'Modulation (AM, FM, PM, FSK and more)' },
    { type: 'has', key: 'pulse', label: 'Pulse waveform' },
  ],
  models: [
    { src: 'function-generators', id: 'sgd-6m', attrs: { mhz: 6 }, chips: ['Dual channel', '16 arbitrary waveforms'] },
    { src: 'function-generators', id: 'sgda-15m', attrs: { mhz: 15, pulse: true }, chips: ['Dual channel', '60 built-in arbitrary waveforms'] },
    { src: 'function-generators', id: 'sgda-30m', attrs: { mhz: 30, pulse: true }, chips: ['Dual channel', '60 built-in arbitrary waveforms'] },
    { src: 'function-generators', id: 'sgda-60m', attrs: { mhz: 60, custom: true, mod: true, pulse: true }, chips: ['Dual channel', '99 user-defined waveforms'] },
    { src: 'function-generators', id: 'sgda-80m', attrs: { mhz: 80, custom: true, mod: true, pulse: true }, chips: ['Dual channel', 'Full modulation suite'] },
  ],
};

const lcr: Family = {
  id: 'lcr-meters',
  title: 'LCR meters',
  unit: 'LCR meter',
  heading: 'Find the right LCR meter',
  lead: 'Handheld and bench-top LCR meters from Vartech. Tell us what you want to measure.',
  categories: ['vartech-lcr-meters'],
  filters: [
    { type: 'choice', key: 'form', label: 'Handheld or bench-top?', options: [
      { value: 'handheld', label: 'Handheld' }, { value: 'bench', label: 'Bench-top' }] },
    { type: 'has', key: 'res', label: 'Resistance as well as L and C' },
    { type: 'has', key: 'esr', label: 'D, Q, ESR and phase angle' },
    { type: 'has', key: 'mm', label: 'Also a full multimeter' },
    { type: 'has', key: 'freq', label: 'Selectable test frequency' },
  ],
  models: [
    { src: 'lcr-meters', id: 'lcm-1', attrs: { form: 'handheld' }, chips: ['Inductance and capacitance only', 'Zero (null) button'] },
    { src: 'lcr-meters', id: 'v-8222h', attrs: { form: 'handheld', res: true, mm: true }, chips: ['True RMS multimeter with LCR', '1000 V DC, 20 A'] },
    { src: 'lcr-meters', id: 'lcr-1b', attrs: { form: 'bench', res: true, esr: true, freq: true }, chips: ['0.1% basic accuracy', '10 Hz to 10 kHz in 1 Hz steps'] },
    { src: 'lcr-meters', id: 'lcr-2a', attrs: { form: 'bench', res: true, esr: true, freq: true }, chips: ['0.1% basic accuracy', '10 test frequencies, wider range'] },
  ],
};

export const families: Family[] = [insulation, earth, multimeters, clamp, scopes, funcgens, lcr];

export const familyById = (id: string) => families.find(f => f.id === id)!;
export const familyForCategory = (categoryId: string) => families.find(f => f.categories.includes(categoryId));
