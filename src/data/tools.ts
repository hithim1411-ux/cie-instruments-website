import type { IconName } from '../utils/iconNames';

export type ToolCategory = 'Insulation testing' | 'Power and motors' | 'Cables and circuits' | 'Measurement' | 'Earthing and soil' | 'Scopes and signals';

export interface Tool {
  slug: string;
  name: string;
  short: string;
  body: string;
  category: ToolCategory;
  icon: IconName;
  productHref: string;
  productLabel: string;
  isNew?: boolean;
}

export const categories: ToolCategory[] = ['Insulation testing', 'Earthing and soil', 'Power and motors', 'Cables and circuits', 'Measurement', 'Scopes and signals'];

export const tools: Tool[] = [
  { slug: 'ir-temperature-correction-calculator', name: 'IR Temperature Correction', short: 'IR Temp Correction', icon: 'thermometer', category: 'Insulation testing',
    body: 'Correct a megger reading to 20°C or 40°C so readings from different days can be compared.',
    productHref: '/products/insulation-testers-hand', productLabel: 'View Insulation Testers' },
  { slug: 'pi-dar-calculator', name: 'PI and DAR Calculator', short: 'PI and DAR', icon: 'activity', category: 'Insulation testing',
    body: 'Turn 30 s, 1 min and 10 min readings into Polarization Index and DAR with a verdict.',
    productHref: '/products/motor-operated-insulation', productLabel: 'View Motor-Operated Insulation Testers' },
  { slug: 'motor-minimum-insulation-resistance', name: 'Motor Minimum IR Check', short: 'Motor Min IR', icon: 'shield-check', category: 'Insulation testing',
    body: 'Check a winding reading against the IEEE 43 recommended minimum, corrected to 40°C.',
    productHref: '/products/insulation-testers-hand', productLabel: 'View Insulation Testers' },
  { slug: 'insulation-test-voltage-selector', name: 'Insulation Test Voltage Selector', short: 'Test Voltage', icon: 'zap', category: 'Insulation testing', isNew: true,
    body: 'Pick the right megger test voltage for a motor winding (IEEE 43) or a low-voltage installation (IEC 60364-6).',
    productHref: '/products/digital-insulation-testers', productLabel: 'View Digital Insulation Testers' },

  { slug: 'three-phase-power-calculator', name: 'Three-Phase Power and Current', short: '3-Phase Power', icon: 'plug', category: 'Power and motors', isNew: true,
    body: 'Convert between kW, kVA, kVAR and line current for any three-phase or single-phase load.',
    productHref: '/products/clamp-meters', productLabel: 'View Clamp Meters' },
  { slug: 'power-factor-correction-calculator', name: 'Power Factor Correction', short: 'PF Correction', icon: 'battery', category: 'Power and motors', isNew: true,
    body: 'Find the capacitor kVAR needed to lift your power factor to a target, with the kVA released.',
    productHref: '/products/clamp-meters', productLabel: 'View Clamp Meters' },
  { slug: 'motor-speed-slip-calculator', name: 'Motor Speed and Slip', short: 'Speed and Slip', icon: 'rotate-cw', category: 'Power and motors', isNew: true,
    body: 'Synchronous speed from poles and frequency, plus slip and rotor frequency from a measured speed.',
    productHref: '/products/phase-sequence-indicators', productLabel: 'View Phase Sequence Indicators' },

  { slug: 'voltage-drop-calculator', name: 'Cable Voltage Drop', short: 'Voltage Drop', icon: 'waves', category: 'Cables and circuits', isNew: true,
    body: 'Estimate the voltage drop of a copper or aluminium cable run, corrected for conductor temperature.',
    productHref: '/products/multimeters', productLabel: 'View Multimeters' },
  { slug: 'ohms-law-calculator', name: "Ohm's Law and Power", short: "Ohm's Law", icon: 'cpu', category: 'Cables and circuits', isNew: true,
    body: 'Enter any two of voltage, current, resistance or power and get the other two instantly.',
    productHref: '/products/multimeters', productLabel: 'View Multimeters' },

  { slug: 'multimeter-accuracy-calculator', name: 'Meter Accuracy and Error Band', short: 'Meter Accuracy', icon: 'gauge', category: 'Measurement', isNew: true,
    body: 'Turn a "±(% of reading + digits)" spec into the real error band around your displayed value.',
    productHref: '/products/multimeters', productLabel: 'View Multimeters' },
  { slug: 'unit-converter', name: 'Electrical Unit Converter', short: 'Unit Converter', icon: 'sliders', category: 'Measurement', isNew: true,
    body: 'Convert SI prefixes, power (kW, HP, BTU/h, TR), temperature, decibels (dBm, dBV) and wire gauge (AWG to mm2).',
    productHref: '/products/multimeters', productLabel: 'View Multimeters' },
  { slug: 'resistor-colour-code-calculator', name: 'Resistor Colour Code', short: 'Colour Code', icon: 'circle-dot', category: 'Measurement', isNew: true,
    body: 'Click the colour bands on a drawn resistor to read its value, tolerance and range. 4, 5 and 6 bands.',
    productHref: '/authorised-dealership/lcr-meters', productLabel: 'View LCR Meters' },
  { slug: 'soil-resistivity-wenner-calculator', name: 'Soil Resistivity (Wenner)', short: 'Soil Resistivity', icon: 'globe', category: 'Earthing and soil', isNew: true,
    body: 'Turn four-pin Wenner readings into soil resistivity at each depth, with the average and a trend verdict.',
    productHref: '/products/earth-tester', productLabel: 'View Earth Testers' },
  { slug: 'earth-rod-resistance-calculator', name: 'Earth Rod Resistance', short: 'Earth Rod', icon: 'ruler', category: 'Earthing and soil', isNew: true,
    body: 'Estimate the resistance of a driven earth rod from soil resistivity, length and diameter, and how many rods you need.',
    productHref: '/products/earth-tester', productLabel: 'View Earth Testers' },

  { slug: 'oscilloscope-bandwidth-calculator', name: 'Scope Bandwidth and Rise Time', short: 'Scope Bandwidth', icon: 'radio', category: 'Scopes and signals', isNew: true,
    body: 'Check whether a scope is fast enough for your signal: rise time, amplitude error and the bandwidth you should buy.',
    productHref: '/products/vartech-oscilloscopes', productLabel: 'View Vartech Oscilloscopes' },
  { slug: 'oscilloscope-reading-calculator', name: 'Scope Screen Reading', short: 'Scope Reading', icon: 'activity', category: 'Scopes and signals', isNew: true,
    body: 'Convert divisions on the screen into period, frequency, peak-to-peak, peak and RMS voltage.',
    productHref: '/products/vartech-oscilloscopes', productLabel: 'View Vartech Oscilloscopes' },
];

export const bySlug = (slug: string) => tools.find(t => t.slug === slug)!;
