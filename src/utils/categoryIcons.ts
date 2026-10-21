import type { IconName } from './iconNames';

// Maps category.json `id` → line-icon name (Icon.astro), replacing the
// emoji `icon` field in UI chrome without touching the data file itself.
export const categoryIcons: Record<string, IconName> = {
  'insulation-testers-hand': 'gauge',
  'multirange-insulation-hand': 'sliders',
  'motor-operated-insulation': 'settings',
  'multirange-motorised-insulation': 'settings',
  'compact-insulation-testers': 'box',
  'earth-tester': 'globe',
  'digital-insulation-testers': 'cpu',
  'digital-earth-micro-ohm': 'plug',
  'clamp-meters': 'wrench',
  multimeters: 'ruler',
  'hv-phase-sequence': 'zap',
  'phase-sequence-indicators': 'rotate-cw',
  'oil-test-sets': 'droplet',
  'relay-test-sets': 'flask',
  'vartech-multimeters': 'ruler',
  'vartech-clamp-meters': 'wrench',
  'vartech-oscilloscopes': 'radio',
  'vartech-function-generators': 'waves',
  'vartech-lcr-meters': 'circle-dot',
  'vartech-dc-loads': 'battery',
  'vartech-sound-level-meters': 'volume',
  'vartech-anemometers': 'wind',
  'vartech-calibrators': 'sliders',
  'vartech-lux-meters': 'sun',
  'vartech-thermometers': 'thermometer',
  'vartech-soldering-stations': 'wrench',
  'vartech-rework-stations': 'wind',
  'vartech-soldering-irons': 'zap',
  'vartech-magnifiers': 'circle-dot',
  'vartech-soldering-accessories': 'settings',
  'vartech-dc-power-supplies': 'battery',
  'systems-tech-handheld-tachometers': 'gauge',
  'systems-tech-panel-tachometers': 'gauge',
  'systems-tech-tachometer-sensors': 'radio',
  'systems-tech-temperature-humidity-sensors': 'thermometer',
};

export function categoryIcon(id: string): IconName {
  return categoryIcons[id] ?? 'gauge';
}
