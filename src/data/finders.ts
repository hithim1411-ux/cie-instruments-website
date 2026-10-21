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

// A real-world use case. `set` fills filters: choice -> option value, min -> one of its options,
// has -> true, volt / ohm -> the insulation test voltage and resistance chips.
export interface Preset {
  label: string;
  set: Record<string, string | number | boolean>;
  why: string;
}

export interface Family {
  id: string;
  title: string;                  // "Insulation testers"
  heading: string;
  lead: string;
  filters: FilterDef[];
  models: FinderModel[];
  categories: string[];           // category ids that embed this finder
  note?: string;                  // shown once under the results
  presets?: Preset[];             // "what are you doing?" starting points that fill in the filters
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
    { src: 'cie', id: 'cie-444', attrs: { display: 'analog', power: ['hand'] }, chips: ['Metal body', 'Single voltage and range'],
      vr: [{ v: 100, max: 100 }, { v: 250, max: 250 }, { v: 500, max: 2000 }, { v: 1000, max: 2000 }, { v: 2500, max: 50000 }, { v: 5000, max: 50000 }] },
    { src: 'cie', id: 'cie-666', attrs: { display: 'analog', power: ['hand'] }, chips: ['Wooden body', 'Single voltage and range'],
      vr: [{ v: 100, max: 100 }, { v: 250, max: 250 }, { v: 500, max: 2000 }, { v: 1000, max: 2000 }, { v: 2500, max: 50000 }, { v: 5000, max: 100000 }, { v: 10000, max: 100000 }] },
    { src: 'cie', id: 'cie-555', attrs: { display: 'analog', power: ['hand'] }, chips: ['Compact bakelite body', 'Single voltage and range'],
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
    { src: 'cie', id: 'cie-222m', attrs: { display: 'analog', power: ['hand'], maxOhm: 10000, soil: true }, chips: ['Metal body', '3-terminal or 4-terminal type'] },
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



insulation.presets = [
  { label: 'Home and building wiring', set: { volt: 500, ohm: 100 },
    why: 'IEC 60364-6 specifies a 500 V test for circuits up to 500 V. Readings are normally in the tens to hundreds of megohms, so a 100 MΩ scale is enough.' },
  { label: 'LV motors and panels (up to 415 V)', set: { volt: 500, ohm: 1000 },
    why: 'IEEE 43 recommends 500 V for windings rated 1000 V or less. Healthy motor windings often read well above 100 MΩ, so look for a 1 GΩ scale.' },
  { label: 'HT motors and generators (6.6 kV, 11 kV)', set: { volt: 5000, ohm: 10000, pi: true },
    why: 'IEEE 43 suggests 2500 to 5000 V for windings rated 5 to 12 kV. HT machines are judged on PI and DAR trends, which need a sustained test voltage, so motor-driven or digital with PI.' },
  { label: 'Power transformers', set: { volt: 5000, ohm: 10000, pi: true },
    why: 'HV windings are commonly tested at 5000 V with a 10-minute PI and DAR record, so you need a high voltage, a high resistance scale and a sustained test.' },
  { label: 'HV cables and switchgear', set: { volt: 5000, ohm: 10000 },
    why: 'Commonly tested at 5000 V with a high resistance scale. Some hand-driven and motor-driven models also go to 10,000 V for higher classes.' },
  { label: 'Site with no mains supply', set: { power: 'hand' },
    why: 'Hand-crank models need no battery and no mains, so they work anywhere. The motor-cum-hand (HM) versions give you the choice.' },
  { label: 'Quick spot checks and appliances', set: { display: 'digital', volt: 500 },
    why: 'A light digital tester with a direct LCD readout is fastest for repeat checks on appliances, switchboards and small equipment.' },
  { label: 'Electronics and SELV circuits', set: { volt: 250, ohm: 100 },
    why: 'IEC 60364-6 uses 250 V for SELV and PELV circuits. A low test voltage protects delicate equipment.' },
];

earth.presets = [
  { label: 'House or building earth pit', set: { maxOhm: 100 },
    why: 'Pit and electrode checks usually read from a few ohms to a few tens of ohms, so a 100 Ω range is plenty.' },
  { label: 'Substation or plant earth grid', set: { maxOhm: 100, soil: true },
    why: 'Grid design starts from soil resistivity, and grid readings are low. A 4-terminal instrument covers both jobs.' },
  { label: 'Soil resistivity survey (new site)', set: { soil: true },
    why: 'Soil resistivity needs the 4-terminal connection (Wenner method). Both testers offer it.' },
  { label: 'Field work, no charging available', set: { power: 'hand' },
    why: 'The hand-driven tester has no battery to charge, so it works on remote sites and long surveys.' },
  { label: 'Fast repeat checks', set: { display: 'digital' },
    why: 'Direct LCD readout and a light body make repeat visits to many earth pits quicker.' },
];

multimeters.presets = [
  { label: 'Home and basic electrical repair', set: { counts: 2000, ncv: true },
    why: 'A 2000-count meter covers household and general electrical work. Live-wire detection adds a safety check before you touch anything.' },
  { label: 'Electrician: panels, VFDs and drives', set: { trms: true, vdc: 1000, ncv: true },
    why: 'VFD and inverter outputs are not sine waves, so True RMS matters. 1000 V DC and live-wire detection suit panel work.' },
  { label: 'Electronics bench and components', set: { counts: 6000, cap: true, freq: true, temp: true },
    why: '6000 counts resolve small changes, and capacitance, frequency and temperature cover most bench checks.' },
  { label: 'HVAC and refrigeration', set: { trms: true, cap: true, temp: true },
    why: 'Motor capacitors and compressor currents need capacitance and True RMS. A temperature probe covers superheat and line checks.' },
  { label: 'Motor and power capacitors', set: { cap: true, amax: 20 },
    why: 'Capacitor testing needs capacitance ranges, and 20 A direct current lets you check motor running current.' },
  { label: 'Chokes, coils and transformers', set: { ind: true },
    why: 'Only the V 8222 H measures inductance, as a full multimeter with LCR.' },
  { label: 'Lab and calibration checks', set: { counts: 20000, trms: true },
    why: 'A 20,000-count meter resolves to five digits for reference-style readings.' },
  { label: 'Production test and data logging', set: { pc: true },
    why: 'Only the V 981+ has a PC interface for logging and reporting.' },
];

clamp.presets = [
  { label: 'Motor and feeder currents (AC)', set: { maxA: 600, trms: true },
    why: 'Motors on VFDs draw non-sine current, so True RMS reads correctly. Choose a range comfortably above the running current.' },
  { label: 'Main incomers and large feeders', set: { maxA: 1000 },
    why: 'Panel incomers and big feeders need the 1000 A models.' },
  { label: 'Solar strings and battery circuits (DC)', set: { dc: true },
    why: 'Only AC/DC clamps read DC current. A plain AC clamp reads zero on a DC cable.' },
  { label: 'Earth leakage and RCD tripping', set: { leak: true },
    why: 'Leakage is in the milliamp range, invisible on a 400 A or 1000 A clamp. Only the V 2002+ resolves from 600 mA.' },
  { label: 'VFD and inverter outputs', set: { trms: true },
    why: 'Switching waveforms need True RMS or the reading will be wrong.' },
  { label: 'HVAC: capacitors and temperature', set: { cap: true, temp: true },
    why: 'Check motor capacitors and line temperature with the same instrument.' },
];

scopes.presets = [
  { label: 'Hobby and school lab', set: { kind: 'analog', bw: 20 },
    why: 'A 20 MHz analog scope covers audio and basic digital work at low cost. As a rule, pick a bandwidth about five times your fastest signal.' },
  { label: 'Audio and TV repair', set: { kind: 'analog', bw: 30 },
    why: '30 MHz analog models include TV sync trigger. The SS-5030BC adds an in-circuit component tester.' },
  { label: 'Microcontroller and embedded debugging', set: { kind: 'digital', bw: 80, usb: true },
    why: 'Digital storage captures one-shot events and saves waveforms by USB. Pick bandwidth about five times your fastest clock edge.' },
  { label: 'Bus protocols and multi-phase signals', set: { ch: 4 },
    why: 'Looking at more than two signals at once needs four channels.' },
  { label: 'Power electronics and SMPS', set: { kind: 'digital', bw: 100 },
    why: 'Switching edges are fast. 100 MHz and deep memory help you see ringing and spikes.' },
  { label: 'Need a signal source too', set: { fg: true },
    why: 'The SS-5150DS1B FG has a 25 MHz function generator built in, so one bench instrument does both.' },
  { label: 'Board repair and component checks', set: { comp: true },
    why: 'The SS-5030BC shows I-V characteristics for R, L, C, diodes and transistors without powering the circuit.' },
];

funcgens.presets = [
  { label: 'Audio and sensor testing', set: { mhz: 6 },
    why: 'Audio and sensor work sits well below 6 MHz, so even the smallest model is enough.' },
  { label: 'Digital and clock signals', set: { mhz: 30, pulse: true },
    why: 'Clock and logic testing needs pulse and square waves at higher frequency.' },
  { label: 'RF and wideband lab work', set: { mhz: 60, mod: true },
    why: 'Higher frequency and full modulation (AM, FM, PM, ASK, FSK, PSK) suit RF and communication work.' },
  { label: 'Custom and arbitrary waveforms', set: { custom: true },
    why: 'The SGDA-60M and SGDA-80M let you define your own waveforms from the PC.' },
  { label: 'Modulation tests', set: { mod: true },
    why: 'Only the 60 MHz and 80 MHz models have the full modulation set.' },
];

lcr.presets = [
  { label: 'Quick L and C checks in the field', set: { form: 'handheld' },
    why: 'A handheld meter is fast for inductors and capacitors on a repair bench or on site.' },
  { label: 'Component sorting and incoming inspection', set: { form: 'bench', esr: true },
    why: 'D, Q, ESR and phase angle at a controlled test frequency are what incoming inspection needs.' },
  { label: 'Capacitor quality (ESR)', set: { esr: true },
    why: 'ESR and dissipation factor show an ageing capacitor that capacitance alone will not.' },
  { label: 'One tool for the whole kit', set: { mm: true },
    why: 'The V 8222 H is a full True RMS multimeter that also measures inductance and capacitance.' },
  { label: 'Measure at specific frequencies', set: { freq: true },
    why: 'Inductor and capacitor values change with frequency. The bench models let you choose the test frequency.' },
];


const solder: Family = {
  id: 'soldering-stations',
  title: 'Soldering stations',
  unit: 'soldering station',
  heading: 'Find the right soldering station',
  lead: 'Every Vartech soldering and de-soldering station in one place. Say what you need to do, then tick the features that matter.',
  categories: ['vartech-soldering-stations'],
  filters: [
    { type: 'choice', key: 'job', label: 'What do you need to do?', options: [
      { value: 'solder', label: 'Soldering' }, { value: 'desolder', label: 'De-soldering (vacuum, through-hole)' }] },
    { type: 'min', key: 'watts', label: 'Heating power', unit: 'W', options: [60, 70, 80, 90], help: 'More power recovers faster on large joints and lead-free solder' },
    { type: 'has', key: 'digital', label: 'Digital temperature display' },
    { type: 'has', key: 'leadfree', label: 'Designed for lead-free solder' },
    { type: 'has', key: 'low', label: 'Can be set to 100 °C or lower', hint: 'for heat-sensitive parts' },
    { type: 'has', key: 'memory', label: 'Stored temperature memories' },
    { type: 'has', key: 'lock', label: 'Lock on the temperature setting', hint: 'password, PIN or key card' },
    { type: 'has', key: 'sleep', label: 'Auto sleep and auto shut-off' },
  ],
  models: [
    { src: 'soldering-stations', id: '936-a', attrs: { job: ['solder'], watts: 60 }, chips: ['60 W, analog setting', '200 °C to 480 °C'] },
    { src: 'soldering-stations', id: '936-ad', attrs: { job: ['solder'], watts: 70, digital: true, low: true, memory: true, lock: true }, chips: ['70 W, LED display', '100 °C to 480 °C, 3 memories'] },
    { src: 'soldering-stations', id: '937-esd', attrs: { job: ['solder'], watts: 60, digital: true, lock: true }, chips: ['60 W, ceramic heater', 'Key-card lock, ±1 °C'] },
    { src: 'soldering-stations', id: '236-esd', attrs: { job: ['solder'], watts: 90, digital: true, leadfree: true, low: true }, chips: ['90 W, ceramic heater', '80 °C to 480 °C'] },
    { src: 'soldering-stations', id: '202-d', attrs: { job: ['solder'], watts: 80, digital: true, leadfree: true, low: true, lock: true, sleep: true }, chips: ['80 W, electromagnetic heater', 'Sensor at the tip, PIN lock'] },
    { src: 'soldering-stations', id: '722', attrs: { job: ['solder', 'desolder'], watts: 90, digital: true, leadfree: true, lock: true }, chips: ['Soldering and de-soldering in one', 'Built-in vacuum pump'] },
    { src: 'soldering-stations', id: '201-b', attrs: { job: ['desolder'], watts: 90, digital: true, lock: true }, chips: ['De-soldering only', 'Built-in vacuum pump'] },
  ],
  note: 'Tips are sold separately for every station, with a pointed tip supplied. See Soldering Spares for tips, heating elements and barrels.',
};

solder.presets = [
  { label: 'Everyday PCB assembly and repair', set: { job: 'solder' },
    why: 'The 936 A is the simple 60 W choice. The 937 ESD and 936 AD add a digital display and a lock.' },
  { label: 'Lead-free production', set: { leadfree: true, watts: 80 },
    why: 'Lead-free solder melts hotter. The 236 ESD, 202 D and 722 are the lead-free designs, at 80 W or 90 W.' },
  { label: 'Remove through-hole parts', set: { job: 'desolder' },
    why: 'The 722 solders and de-solders from one unit. The 201 B is the de-soldering station on its own.' },
  { label: 'Shared bench, settings must not change', set: { lock: true },
    why: 'The 936 AD uses a password, the 202 D a PIN, the 937 ESD a key card, and the 722 and 201 B a password.' },
  { label: 'Switch between jobs quickly', set: { memory: true },
    why: 'The 936 AD stores three temperatures so you can move between jobs without re-setting the dial.' },
  { label: 'Heat-sensitive parts', set: { low: true },
    why: 'The 936 AD goes down to 100 °C, and the 236 ESD and 202 D to 80 °C.' },
  { label: 'Large joints and heavy boards', set: { watts: 90 },
    why: 'The 90 W stations recover fastest when you solder large pads and thick wire.' },
];

const rework: Family = {
  id: 'rework-stations',
  title: 'SMD re-work stations',
  unit: 're-work station',
  heading: 'Find the right SMD re-work station',
  lead: 'Hot-air re-work stations and the two 2-in-1 stations that add a soldering iron. Pick the power and the features you need.',
  categories: ['vartech-rework-stations'],
  filters: [
    { type: 'min', key: 'hotW', label: 'Hot-air power', unit: 'W', options: [270, 320, 580, 1000], help: 'More power heats larger boards and parts faster' },
    { type: 'min', key: 'air', label: 'Highest airflow', unit: 'L/min', options: [24, 50, 100, 120] },
    { type: 'has', key: 'digital', label: 'Digital temperature display' },
    { type: 'has', key: 'iron', label: 'Soldering iron built in' },
    { type: 'has', key: 'chan', label: 'Stored channels for temperature and airflow' },
    { type: 'has', key: 'leadfree', label: 'Designed for lead-free work' },
    { type: 'has', key: 'sleep', label: 'Auto standby or sleep when idle' },
    { type: 'has', key: 'lock', label: 'Password or key lock' },
  ],
  models: [
    { src: 'rework-stations', id: '850-a', attrs: { hotW: 270, air: 24 }, chips: ['270 W, 100 °C to 420 °C', 'Analog setting'] },
    { src: 'rework-stations', id: '850-d', attrs: { hotW: 320, air: 24, digital: true, sleep: true }, chips: ['320 W, 100 °C to 480 °C', 'PID control, auto cooling'] },
    { src: 'rework-stations', id: '857-d', attrs: { hotW: 580, air: 100, digital: true, sleep: true }, chips: ['580 W, up to 100 L/min', 'Handle sensor, soft airflow'] },
    { src: 'rework-stations', id: '861-dw', attrs: { hotW: 1000, air: 120, digital: true, chan: true, leadfree: true, sleep: true, lock: true }, chips: ['1000 W, 100 °C to 500 °C', '3 programmable channels'] },
    { src: 'rework-stations', id: '700-esd', attrs: { hotW: 270, air: 24, iron: true }, chips: ['270 W hot air plus 50 W iron', 'Switched separately'] },
    { src: 'rework-stations', id: '706', attrs: { hotW: 580, air: 50, digital: true, iron: true, sleep: true }, chips: ['580 W hot air plus 50 W iron', 'LED display, 1 °C resolution'] },
  ],
  note: 'For BGA work, add the 853 ESD pre-heater and the 800 L fixture, listed with the other tools under SMD Re-Work.',
};

rework.presets = [
  { label: 'Small SMD parts and general repair', set: { hotW: 270 },
    why: 'The 850 A is enough for QFP and SOP packages. The 850 D adds a digital display and auto cooling.' },
  { label: 'One bench, soldering and hot air', set: { iron: true },
    why: 'The 700 ESD and 706 put a 50 W soldering iron next to the hot-air section, switched separately.' },
  { label: 'Large boards and lead-free work', set: { hotW: 1000, leadfree: true },
    why: 'The 861 DW is the 1000 W lead-free station, with up to 120 L/min of airflow.' },
  { label: 'Repeat jobs with stored settings', set: { chan: true },
    why: 'The 861 DW stores three channels, each with its own temperature and airflow.' },
  { label: 'High airflow', set: { air: 100 },
    why: 'The 857 D (100 L/min) and 861 DW (120 L/min) move the most air.' },
  { label: 'Station left running between jobs', set: { sleep: true },
    why: 'The 850 D, 857 D, 861 DW and 706 go on standby or sleep when idle, and cool down automatically.' },
];

export const families: Family[] = [insulation, earth, multimeters, clamp, scopes, funcgens, lcr, solder, rework];

export const familyById = (id: string) => families.find(f => f.id === id)!;
export const familyForCategory = (categoryId: string) => families.find(f => f.categories.includes(categoryId));
