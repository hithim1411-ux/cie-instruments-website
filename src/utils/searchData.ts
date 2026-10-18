import { u } from '../utils/url';
import cieProducts    from '../data/products.json';
import cieCategories  from '../data/categories.json';
import vMM   from '../data/vartech-multimeters.json';
import vCM   from '../data/vartech-clamp-meters.json';
import vOSC  from '../data/vartech-oscilloscopes.json';
import vFG   from '../data/vartech-function-generators.json';
import vLCR  from '../data/vartech-lcr-meters.json';
import vDCL  from '../data/vartech-dc-loads.json';
import vSLM  from '../data/vartech-sound-level-meters.json';
import vANE  from '../data/vartech-anemometers.json';
import vCAL  from '../data/vartech-calibrators.json';
import vLUX  from '../data/vartech-lux-meters.json';
import vTHM  from '../data/vartech-thermometers.json';
import vPS   from '../data/vartech-dc-power-supplies.json';


const catNameMap: Record<string,string> = Object.fromEntries(
  (cieCategories as any[]).map(c => [c.id, c.shortName || c.name])
);

type Entry = {
  id: string; model: string; name: string; tagline: string;
  category: string; brand: 'cie'|'vartech'; href: string; image: string;
};

function vImg(slug: string, img: string) { return u(`/images/vartech/${slug}/${img}`); }

const vartechSections: { slug: string; label: string; items: any[] }[] = [
  { slug: 'multimeters',        label: 'Multimeters',          items: vMM  },
  { slug: 'clamp-meters',       label: 'Clamp Meters',         items: vCM  },
  { slug: 'oscilloscopes',      label: 'Oscilloscopes',        items: vOSC },
  { slug: 'function-generators',label: 'Function Generators',  items: vFG  },
  { slug: 'lcr-meters',         label: 'LCR & Cap Meters',     items: vLCR },
  { slug: 'dc-loads',           label: 'DC Electronic Loads',  items: vDCL },
  { slug: 'sound-level-meters', label: 'Sound Level Meters',   items: vSLM },
  { slug: 'anemometers',        label: 'Anemometers',          items: vANE },
  { slug: 'calibrators',        label: 'Calibrators',          items: vCAL },
  { slug: 'lux-meters',         label: 'Lux Meters',           items: vLUX },
  { slug: 'thermometers',       label: 'Thermometers',         items: vTHM },
  { slug: 'dc-power-supplies',  label: 'DC Power Supplies',    items: vPS  },
];

export const searchIndex: Entry[] = [
  ...(cieProducts as any[]).filter(p => !p.brand || p.brand === 'cie').map(p => ({
    id: p.id, model: p.model, name: p.name, tagline: p.tagline || '',
    category: catNameMap[p.categoryId] || p.categoryId,
    brand: 'cie' as const,
    href: u(`/products/${p.categoryId}/${p.id}/`),
    image: p.image
      ? (p.image.startsWith('vartech/') ? u(`/images/${p.image}`) : u(`/images/products/${p.image}`))
      : u(`/images/products/${p.id}.webp`),
  })),
  ...vartechSections.flatMap(({ slug, label, items }) =>
    (items as any[]).map(p => ({
      id: p.id, model: p.model, name: p.name, tagline: p.tagline || '',
      category: label, brand: 'vartech' as const,
      href: u(`/authorised-dealership/${slug}/${p.id}/`),
      image: p.images?.[0] ? vImg(slug, p.images[0]) : '',
    }))
  ),
];

export const suggestions = [
  { tag: 'Insulation', q: "Insulation tester for 415V motor" },
  { tag: 'Insulation', q: "PI test / DAR test - which tester?" },
  { tag: 'High voltage', q: "Megger for HV transformer above 11kV" },
  { tag: 'Earthing', q: "Earth tester for site - hand-driven or digital?" },
  { tag: 'Solar / DC', q: "Best clamp meter for solar DC current" },
  { tag: 'Electrical', q: "True-RMS multimeter for VFD panels" },
  { tag: 'Low resistance', q: "Micro-ohm meter for winding resistance" },
  { tag: 'Oil testing', q: "Test transformer oil BDV - which set?" },
  { tag: 'Protection', q: "Relay testing - secondary injection set" },
  { tag: 'Battery', q: "Battery discharge test - which DC load?" },
  { tag: 'Compare', q: "Compare LCR-1B vs LCR-2A" },
  { tag: 'Troubleshoot', q: "My motor insulation reads low - what next?" },
];
export const AI_NAME = 'Volta';
export const DISCLAIMER = 'Volta is an AI and can make mistakes. Always confirm specs and suitability with CIE before you order.';
