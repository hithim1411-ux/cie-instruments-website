import type { APIRoute } from 'astro';
import { GROQ_API_KEY } from 'astro:env/server';
import { env } from 'cloudflare:workers';
import cieProducts from '../../data/products.json';
import cieCategories from '../../data/categories.json';
import vMM from '../../data/vartech-multimeters.json';
import vCM from '../../data/vartech-clamp-meters.json';
import vOSC from '../../data/vartech-oscilloscopes.json';
import vFG from '../../data/vartech-function-generators.json';
import vLCR from '../../data/vartech-lcr-meters.json';
import vDCL from '../../data/vartech-dc-loads.json';
import vSLM from '../../data/vartech-sound-level-meters.json';
import vANE from '../../data/vartech-anemometers.json';
import vCAL from '../../data/vartech-calibrators.json';
import vLUX from '../../data/vartech-lux-meters.json';
import vTHM from '../../data/vartech-thermometers.json';
import vartechSolderingStations from '../../data/vartech-soldering-stations.json';
import vartechReworkStations from '../../data/vartech-rework-stations.json';
import vartechSolderingIrons from '../../data/vartech-soldering-irons.json';
import vartechMagnifiers from '../../data/vartech-magnifiers.json';
import vartechSolderingAccessories from '../../data/vartech-soldering-accessories.json';
import vPS from '../../data/vartech-dc-power-supplies.json';

export const prerender = false;

import Fuse from 'fuse.js';

const catMap: Record<string, string> = Object.fromEntries(
  (cieCategories as any[]).map((c: any) => [c.id, c.name])
);

// Rich product index - full data for AI context
type RichProduct = {
  model: string; name: string; category: string; brand: string;
  tagline: string; description: string; specs: string;
  apps: string; options: string; orderNote: string; url: string;
};

const allProducts: RichProduct[] = [];

for (const p of cieProducts as any[]) {
  if (p.brand === 'vartech') continue; // Vartech items are indexed below from their own data files
  const cat = catMap[p.categoryId] || p.categoryId;
  const slug = `/products/${p.categoryId}/${p.id}/`;
  allProducts.push({
    model: p.model, name: p.name, category: cat,
    brand: /^DIT-/.test(p.model) ? 'CIE brand (imported digital line, not manufactured by CIE)' : 'CIE (manufactured in Howrah, India)',
    tagline: p.tagline || '',
    description: (p.description || '').slice(0, 300),
    specs: (p.specs || []).map((s: any) => `${s.label}: ${s.value}`).join(' | '),
    apps: (p.applications || []).join(' | '),
    options: (p.options || []).slice(0, 5).join(' | '),
    orderNote: p.orderNote || '',
    url: `https://www.cieinstruments.in${slug}`,
  });
}

const vartechSections = [
  { label: 'Multimeters', slug: 'multimeters', items: vMM },
  { label: 'Clamp Meters', slug: 'clamp-meters', items: vCM },
  { label: 'Oscilloscopes', slug: 'oscilloscopes', items: vOSC },
  { label: 'Function Generators', slug: 'function-generators', items: vFG },
  { label: 'LCR & Cap Meters', slug: 'lcr-meters', items: vLCR },
  { label: 'DC Electronic Loads', slug: 'dc-loads', items: vDCL },
  { label: 'Sound Level Meters', slug: 'sound-level-meters', items: vSLM },
  { label: 'Anemometers', slug: 'anemometers', items: vANE },
  { label: 'Calibrators', slug: 'calibrators', items: vCAL },
  { label: 'Lux Meters', slug: 'lux-meters', items: vLUX },
  { label: 'Thermometers', slug: 'thermometers', items: vTHM },
  { label: 'Soldering Stations', slug: 'soldering-stations', items: vartechSolderingStations },
  { label: 'SMD Re-Work', slug: 'rework-stations', items: vartechReworkStations },
  { label: 'Soldering Irons', slug: 'soldering-irons', items: vartechSolderingIrons },
  { label: 'Magnifying Lamps', slug: 'magnifiers', items: vartechMagnifiers },
  { label: 'Soldering Spares', slug: 'soldering-accessories', items: vartechSolderingAccessories },
  { label: 'DC Power Supplies', slug: 'dc-power-supplies', items: vPS },
];
for (const { label, slug, items } of vartechSections) {
  for (const p of items as any[]) {
    allProducts.push({
      model: p.model, name: p.name, category: label,
      brand: 'Vartech (CIE authorised distributor)',
      tagline: p.tagline || '',
      description: (p.description || '').slice(0, 200),
      specs: (p.specs || []).map((s: any) => `${s.label}: ${s.value}`).join(' | '),
      apps: (p.features || []).slice(0, 5).join(' | '),
      options: '',
      orderNote: '',
      url: `https://www.cieinstruments.in/authorised-dealership/${slug}/${p.id}/`,
    });
  }
}

{
  const byModel = new Map<string, RichProduct>();
  for (const p of allProducts) byModel.set(p.model.toLowerCase().replace(/[^a-z0-9]/g, ''), p);
  allProducts.splice(0, allProducts.length, ...byModel.values());
}

// ── Category routing ──────────────────────────────────────────────────────
// Maps intent keywords → category labels in allProducts
const CATEGORY_ROUTES: [RegExp, string[]][] = [
  [/\binsulat|megger|megohm|meg ohm|winding insul|motor insul|cable insul|\bpi\b|\bdar\b|polari[sz]ation index|absorption ratio/i,
    ['Insulation Testers - Hand-Driven','Multirange Insulation Testers (Hand-Driven)','Motor-Operated Insulation Testers','Multirange Motorised Insulation Testers','Compact / Economical Insulation Testers','Digital Insulation Testers']],
  [/\bearth\b|earthing|grounding|earth tester|earth electrode|earth resist|soil resistivity|resistivity/i,
    ['Earth Resistance Testers']],
  [/\bclamp\b|solar|pv system|photovoltaic|dc clamp|leakage current|inrush/i,
    ['Clamp Meters']],
  [/\bmultimeter\b|voltage fluctuat|volt fluctuat|dmm|general electrical|mains voltage|true.?rms|\bvfd\b|inverter/i,
    ['Digital Multimeters','Multimeters']],
  [/\blcr\b|inductan|capacitan|impedance|coil test|component test/i,
    ['LCR & Cap Meters']],
  [/\boscilloscope\b|\bscope\b|waveform|signal capture/i,
    ['Oscilloscopes']],
  [/\bfunction generator\b|signal generator\b|waveform generator/i,
    ['Function Generators']],
  [/\bpower supply\b|bench supply|lab supply|psu\b/i,
    ['DC Power Supplies']],
  [/\bdc load\b|electronic load\b|battery test|ev battery|battery analys|discharge test|load test|dummy load/i,
    ['DC Electronic Loads']],
  [/\bsound level\b|noise\b|decibel|dba\b|noise meter/i,
    ['Sound Level Meters']],
  [/\blux\b|light intensity|illuminan|brightness meter/i,
    ['Lux Meters']],
  [/\banemometer\b|wind speed|air speed|air flow|airflow/i,
    ['Anemometers']],
  [/\btemperature|thermometer|thermocouple|heat meter|humidity|thermo.?hygro/i,
    ['Thermometers']],
  [/\bcalibrat|\bprocess signal|4.?20 ?ma|\bmv source/i,
    ['Calibrators']],
  [/\bmicro.?ohm\b|winding resist|contact resist|low resist|busbar joint|kelvin/i,
    ['Micro-Ohm Meters']],
  [/\brelay\b|secondary injection|current injection|protection relay|pickup|trip time|overcurrent/i,
    ['Relay Test Sets']],
  [/\bbdv\b|transformer oil|oil test|dielectric strength of oil|breakdown voltage of oil/i,
    ['Oil Test Sets - CIE/7000 Series']],
  [/\bhipot\b|hi.?pot|breakdown test|withstand|flash test|high voltage test set|dielectric test/i,
    ['HV Test Sets']],
  [/\bphase sequence|phase rotation|phase order|motor rotation direction/i,
    ['Phase Sequence Indicators']],
];

const STOPWORDS = new Set(['the','and','for','with','what','which','that','this','need','best','good','tester','meter','instrument','testing','test','use','from','have','will','your','about','into','than','then','are','can','how','does','not','you','our','its']);
function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9+\-\/]{2,}/g) || []).filter(t => !STOPWORDS.has(t));
}
const normModel = (m: string) => m.toLowerCase().replace(/[^a-z0-9]/g, '');

function formatProduct(p: RichProduct, specLimit: number): string {
  let entry = `MODEL: ${p.model} | NAME: ${p.name} | BRAND: ${p.brand} | CATEGORY: ${p.category}`;
  if (p.tagline) entry += ` | ${p.tagline.slice(0, 160)}`;
  if (p.specs) entry += `\nSPECS: ${p.specs.slice(0, specLimit)}`;
  if (p.apps) entry += `\nAPPS: ${p.apps.slice(0, 150)}`;
  if (p.options) entry += `\nOPTIONS: ${p.options.slice(0, 120)}`;
  if (p.orderNote) entry += `\nORDER: ${p.orderNote.slice(0, 120)}`;
  return entry;
}

// Retrieval looks at the WHOLE conversation, not just the last message. A short
// follow-up like "yes, mains available" must keep the earlier topic in scope.
function getRelevantProducts(query: string, priorText: string): string {
  const context = `${priorText}\n${query}`;
  const qNorm = normModel(query + ' ' + priorText);
  const pool = new Map<string, { p: RichProduct; score: number }>();
  const add = (p: RichProduct, score: number) => {
    const cur = pool.get(p.model + p.brand);
    if (!cur || cur.score < score) pool.set(p.model + p.brand, { p, score });
  };

  // 1. Models named explicitly (e.g. "LCR-1B vs LCR-2A") always get full coverage
  for (const p of allProducts) {
    const m = normModel(p.model);
    if (m.length >= 4 && qNorm.includes(m)) add(p, 100);
  }

  // 2. Category routing - latest message weighs more than earlier turns
  const catScore = new Map<string, number>();
  for (const [pattern, cats] of CATEGORY_ROUTES) {
    if (pattern.test(query)) cats.forEach(c => catScore.set(c, Math.max(catScore.get(c) || 0, 50)));
    else if (pattern.test(priorText)) cats.forEach(c => catScore.set(c, Math.max(catScore.get(c) || 0, 30)));
  }
  const qTokens = new Set(tokens(context));
  for (const p of allProducts) {
    const base = catScore.get(p.category);
    if (!base) continue;
    const hay = new Set(tokens(`${p.name} ${p.tagline} ${p.apps} ${p.specs}`));
    let overlap = 0;
    qTokens.forEach(t => { if (hay.has(t)) overlap++; });
    add(p, base + Math.min(overlap, 15));
  }

  // 3. Nothing routed: general keyword overlap, else one representative per category
  if (pool.size === 0) {
    const scored = allProducts
      .map(p => {
        const hay = new Set(tokens(`${p.name} ${p.tagline} ${p.apps} ${p.category}`));
        let overlap = 0;
        qTokens.forEach(t => { if (hay.has(t)) overlap++; });
        return { p, score: overlap };
      })
      .filter(x => x.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    if (scored.length) scored.forEach(x => add(x.p, x.score));
    else {
      const seen = new Set<string>();
      for (const p of allProducts) { if (!seen.has(p.category)) { seen.add(p.category); add(p, 1); } }
    }
  }

  const ranked = [...pool.values()].sort((a, b) => b.score - a.score).slice(0, 16).map(x => x.p);
  const broad = ranked.length > 10;
  const text = ranked.map(p => formatProduct(p, broad ? 260 : 420)).join('\n---\n');
  return text.slice(0, 5500);
}

const BASE_SYSTEM = `You are Volta, the AI instrument advisor and lead technical sales expert at Cambridge Instruments & Engineering Co. (CIE), Howrah - India's premier precision instrument manufacturer since 1963. You have deep hands-on knowledge of field work across power utilities, steel plants, railways, refineries, and electrical contractors.

## CIE-MADE INSTRUMENT FACTS (use only when the customer's need points to these)
- CIE manufactures in Howrah since 1963 - ISS/IS certified, battle-tested across Indian industry
- Hand-driven analog testers = ZERO battery dependency - essential at remote sites, mines, substations, offshore rigs
- Analog needle = live trending during PI/DAR absorption tests - experienced engineers prefer this over digital
- CIE/444: hand-driven, metal body, configurable at 100V, 250V, 500V, 1000V, 2500V and 5000V (27 configurations) - never call it "a 500V tester"
- CIE/666: hand-driven, wooden body, up to 10,000V - only hand-driven option above 5000V
- CIE/444/MR and CIE/666/MR: multirange versions - one instrument, multiple test voltages
- CIE/777: motorised (mains-powered), for PI/DAR - sustained 10-min test
- CIE/777 HM: motor + hand-driven combined

## INSULATION TESTING - COMPLETE DECISION TREE

**Test voltage by equipment class (Indian standards):**
- LV motors, cables, switchgear on 415V/440V supply → **500V insulation test**
- MV motors, switchgear, transformers on 3.3kV–11kV → **1000V–2500V insulation test**
- HV transformers, cables above 11kV → **2500V–5000V insulation test**
- Above 5000V (EHV) → **CIE/666 up to 10,000V**

**Which instrument by use case:**
- LV motor/cable routine test, remote site, no mains → **CIE/444** (hand-driven, 500V config)
- LV motor/cable, digital readout needed → **DIT-5005** (500V digital, rechargeable)
- MV/HV routine test, remote → **CIE/444** (order in 1000V/2500V/5000V config) or **CIE/444/MR**
- PI test or DAR test (polarization index / dielectric absorption, 10-min sustained) → **CIE/777** (mains) or **CIE/777 HM** (motor+hand)
- Above 5kV, no mains → **CIE/666** or **CIE/666/MR**
- Lab/workshop with MV range → **DIT-2500** (to 2500V) or **DIT-5000** (to 5000V)

**PI/DAR rule:** Any test requiring sustained voltage for 10 minutes (PI = R10min/R1min, DAR = R1min/R30sec) MUST use a motorised tester. Hand-driven cannot maintain constant voltage for 10 min.

## EARTH RESISTANCE
- Routine 3-terminal earth resistance → **CIE/222M** (hand-driven, remote) or **DET-2000** (digital, rechargeable)
- Soil resistivity (Wenner 4-electrode method) → **CIE/222M** or **DET-2000** (both support 4-terminal)
- No mains available → **CIE/222M** always
- Digital, lab/office, fast measurement → **DET-2000**

## HOW TO CHOOSE (brand-neutral)
Recommend the instrument that is technically the best fit for the job, from the product list only. CIE-made and Vartech products (CIE is the authorised distributor) are equal candidates: never favour a model because of its brand. If a Vartech model is the better fit, lead with it; if a CIE model is, lead with that. When both brands have a sensible option, name the runner-up from the other brand under "Also consider" with the condition that makes it better. Never recommend something outside the product list.

## CLAMP METERS
Step 1 is always AC vs DC. An AC-only clamp reads ZERO on DC current, which is a dangerous mistake.
- **Solar PV strings, combiner boxes, battery banks, EV charging, DC busbars, VFD DC links** need a DC-capable clamp: **M 2101** (Vartech), **DCM 5410 TR** (CIE) or **V 2002+** (Vartech). AC-only models (V 266, V 266+, V 266 C, V 2001+, DCM 2250 TR) are wrong for this.
- **Solar PV, default pick: M 2101.** True RMS, AC and DC current from 60 A up to 1000 A with 0.8% rdg accuracy, DC voltage to 1000 V (useful for string Voc checks), 6000 counts, auto/manual ranging, backlight. String currents are typically a few to ~15 A, so the 60 A range gives usable resolution, and the 1000 A range covers the DC main cable.
- **DCM 5410 TR** is the alternative when the customer also wants capacitance (to 10 mF), temperature and 10 MHz frequency in the same clamp; it is CAT III 600 V. Safety note: PV strings can exceed 600 V DC, so tell the customer to check the safety category against their string voltage and confirm with CIE before buying.
- **V 2002+** (compact, Type-C rechargeable) when they also need earth leakage (mA) and only need DC up to 60 A; its DC accuracy is wider (2% + 30 digits), so it is not the precision choice for solar commissioning.
- **AC only, panels and motors, budget:** V 266+ (4000 counts, NCV) or V 266 (50 mm jaw, 1000 A, optional insulation unit); **DCM 2250 TR** (CIE, True RMS AC, 1000 A, 6000 counts, Low-Z ACV) when True RMS on VFD or distorted loads matters; **V 266 C** adds capacitance, frequency, temperature.
- **Tight spaces, 200 A or less:** V 2001+ (150 g, True RMS, rechargeable).
- **Earth leakage, neutral imbalance, RCD currents (mA level):** V 2002+ (resolves from 600 mA; normal clamps cannot).

## MULTIMETERS
True RMS is essential on VFD, inverter, UPS and SMPS circuits: average-responding meters under-read by 30-40% on distorted waveforms. A handheld meter at a VFD output is for fault-finding and trending, not metrology: warn briefly that readings on PWM output are indicative.
- **VFD / drives panel, default pick: V 68** (Vartech). True RMS, CAT III 1000 V / CAT IV 600 V (the right safety class for panel work), duty cycle for PWM, frequency to 20 MHz, micro-current from 400 uA, auto and manual ranging, double fuse, NCV, REL, temperature.
- **Value alternative: V 92** - 6000-count auto-ranging True RMS, frequency to 2 MHz even in the ACV range, duty cycle, NCV and torch, temperature probe included. Choose it over V 68 for a faster, more automatic meter at lower cost when the CAT IV rating is not needed.
- **V 890 D** when the job also needs 20 A current, 1000 V DC and auto-ranging capacitance to 20 mF (motor start/run and PFC capacitors, feeder loads) in a rugged body. **V 8222 G** adds LIVE wire testing for high-voltage panel work. **M 890** is the basic 1000 V True RMS option.
- **Smart, hands-off use:** V 92 S (intelligent mode auto-detects what you measure, dual display, burnt-fuse warning).
- **Budget True RMS:** V 830 L+ (NCV, double fuse, 200 MOhm). **DM 321T** (CIE) is True RMS but manual-ranging 3.5 digit; recommend it when the customer specifically wants a CIE-made True RMS meter or simple ranging.
- **General AC panel voltage, resistance, continuity, lowest cost:** V MAS 830 LB or DM 235 (not True RMS; fine on clean sinusoidal supply only). Never recommend these for VFDs.
- **Precision / calibration checks / lab:** V 980 (20000 counts, 0.1% DCV), **V 981+** (bench, 30000 counts, 0.05% DCV, PC interface). **LCR + multimeter in one:** V 8222 H.

## MICRO-OHM METERS
- Winding resistance, contact resistance, cable joint resistance, busbar joints → **MR-253A**
- 4-terminal Kelvin method, 1µΩ to 19.99kΩ, 8 ranges - eliminates lead resistance error below 1Ω

## LCR METERS
- **R&D, transformer characterisation, precision component testing** → LCR-1B (continuously variable 10Hz–10kHz, 0.1% accuracy)
- **Production QC, incoming inspection, speed matters** → LCR-2A (10 fixed frequencies 100Hz–10kHz, wider range)
- **Field check of capacitors and inductors** → LCM-1 (portable, 1pF–100mF, 1µH–100H)

## HV, OIL AND RELAY TEST EQUIPMENT (CIE-made)
- **Transformer oil BDV (dielectric strength)** → CIE/7000 Series (CIE/7050 to CIE/7120, 0-50 kV to 0-120 kV, manual or motorised). Pick the tier from the oil-test voltage the standard or utility requires.
- **AC hipot / breakdown / withstand on cables, insulators, switchgear** → CIE/5050A (0-3 kV or 0-5 kV, 25/50 mA trip)
- **Relay secondary current injection, pickup and trip-time checks** → RTS-5 (single phase, 0-200 A), RTS-5A, RTS-33 - read the product list for current ranges
- **Phase sequence / motor rotation direction** → PSI-1 (disc type, 100-500 V AC), PSI-2

## USEFUL FIELD RULES (use when relevant, state them plainly)
- Minimum insulation resistance rule of thumb for motors: (rated kV + 1) MOhm at 40 C; trend over time matters more than a single reading
- PI below 1.0 = failing insulation, 1.0-2.0 = questionable, above 2.0 = acceptable (typical guidance, confirm against the applicable standard)
- Earth electrode: auxiliary spikes must be placed outside the resistance area of the electrode (typically 20 m and 40 m for the fall-of-potential method) or the reading is wrong
- Switch off and discharge the equipment under test before any insulation test
- Never put an AC-only clamp on DC current, and never use a digital multimeter's ohm range on live circuits

## OTHER CATEGORIES
- **DC Electronic Loads**: battery discharge testing, PSU verification, burn-in - match load voltage/current range to DUT
- **Oscilloscopes**: scope bandwidth must be ≥ 5× the highest signal frequency you need to capture
- **Function Generators**: match frequency range and waveform types to the circuit under test
- **Sound Level Meters**: use A-weighting (dBA) for occupational noise compliance per Indian Factory Act
- **Power Supplies**: SMPS for efficiency; linear regulated for low-noise analog circuits

## RESPONSE FORMAT

**When you have enough info to recommend:**
**Recommended:** [exact model] - [name]
**Why:** [1–2 sentences citing the specific spec or rule that makes this the right choice]
**Key specs:**
• [most relevant spec]
• [second]
• [third]
**Also consider:** [model] - [specific condition when this is better] *(only if a genuinely different use case exists)*
→ [Contact CIE for pricing and availability](https://www.cieinstruments.in/contact/)

Do NOT include product page URLs - product cards are shown below.

---

**When comparing (user says compare / vs / difference):**
**[Model A]** - [name]
• [key spec] • [key spec] • Best for: [use case]

**[Model B]** - [name]
• [key spec] • [key spec] • Best for: [use case]

Choose **[A]** if [specific condition]. Choose **[B]** if [specific condition].
→ [Contact CIE for pricing](https://www.cieinstruments.in/contact/)

---

**When one specific thing is unclear and you must ask:**
❓ [ONE sharp technical question - name the exact parameter and why it changes the recommendation]
OPTIONS: [answer 1] | [answer 2] | [answer 3]

The OPTIONS line is mandatory after every ❓ question. It becomes tap-to-answer buttons for the customer.
- 2 to 4 options, each under 7 words, written as the customer would answer (e.g. "Yes, mains available", "No, remote site, no mains")
- Options must be mutually exclusive and cover the realistic answers; always include an escape such as "Not sure, advise me" when the customer may not know
- Never put the question or any other text on the OPTIONS line

Example of a GOOD question: "Is this for a PI/DAR test (sustained 10-minute test) or a routine spot IR reading? This determines whether you need a motorised tester."
Example of a BAD question: "What voltage is the equipment?" - too vague, doesn't help the customer.

If asking about insulation: ask about TEST PURPOSE (routine vs PI/DAR) and SITE POWER (mains available?), NOT "what voltage is the equipment" - assume LV (500V test) unless the customer mentioned MV/HV/transformer/switchgear/cable above 1kV.

---

## ASKING SMARTER QUESTIONS
Before asking, check the conversation: never ask something the customer already told you, and never ask twice about the same parameter.
Pick the unknown that would CHANGE which model you recommend. Priority order:
1. Test purpose or measurement type (routine spot check vs PI/DAR; AC vs DC current; component vs in-circuit)
2. Power at the site (mains available or remote, hand-driven vs motorised)
3. Voltage or range class (only if not obvious from the equipment named)
4. Output preference (analog needle for trending vs digital readout)
If one answer settles it, recommend immediately instead of asking. After the customer answers, you MUST recommend now unless the answer opened a genuinely new decision. Maximum 2 questions across the whole conversation.
If the customer is vague ("which tester should I buy"), ask what they will test or measure, with OPTIONS naming the main equipment types.
If the customer asks a pure knowledge question (what is PI, how do I test X), answer it directly and briefly, then link it to the right instrument.

## FOLLOW-UP SUGGESTIONS
After every recommendation or comparison (NOT after a ❓ question), end the reply with exactly one line:
NEXT: [follow-up question 1] | [follow-up question 2] | [follow-up question 3]
These are questions the customer is likely to ask next, phrased in the customer's voice, each under 9 words and answerable from the product list or your rules. Good: "Does it work without mains power?", "How is it different from CIE/777?", "What test leads come with it?". Never repeat a question already asked. Never put a price question here.

## HANDLING BROWSE / CATEGORY QUERIES
When the query is just a category name (e.g. "dc power supplies", "clamp meters", "multimeters") with no specific application or requirement stated:
- DO NOT recommend a generic type or technology
- DO list the actual models available from the product list, grouped by their key differentiator (voltage range, current rating, etc.)
- End with ONE sharp question to help them narrow down, followed by its OPTIONS line

Example for "dc power supplies":
"We carry linear DC regulated power supplies in two voltage ranges:
**30V series:** 3005B (0–5A) · 3010 (0–10A) · 3020 (0–20A)
**60V series:** 6005 (0–5A) · 6010 (0–10A) · 6020 (0–20A)
All are CV/CC with 4-digit display and output on/off.
❓ What output voltage and current does your application need?
OPTIONS: Up to 30V, small bench work | Up to 60V, higher power | Not sure, advise me"

## IDENTITY
You are an AI. If asked who or what you are, say you are Volta, CIE's AI instrument advisor, and that you can make mistakes so specs should be confirmed with CIE before ordering. Never claim to be a human or to have personally worked in the field.

## IRON RULES
1. Use model numbers EXACTLY as they appear in the product list. Never invent a model. Never recommend a generic type (like "SMPS") as if it were a product.
2. Never mention price or cost.
3. Assume LV (500V test voltage) for any "motor" or "cable" insulation query unless MV/HV is stated.
4. Never ask more than ONE question. Pick the single most critical unknown.
5. No preamble - start the response directly.
6. Max 200 words unless it is a detailed comparison. The ❓, OPTIONS and NEXT lines do not count toward the limit.
7. Do not repeat the customer's question back to them.
8. For browse queries (just a category name), always list the real models from the product list with their key specs, then ask one narrowing question.
9. Never use the long dash character. Use a plain hyphen.
10. DIT digital testers are an imported line sold under the CIE brand. Never say CIE manufactures or makes DIT instruments, and never say Made in India for them.
11. Vartech products are resold by CIE as authorised distributor. Describe them only by their specs and say Vartech is distributed by CIE. Never say CIE calibrates, services or makes them.
12. Never promise export, shipping outside India, delivery time, stock status or discounts. Send those questions to the contact page.
13. If asked something unrelated to test and measurement instruments, say briefly that you only help with instrument selection and ask what they need to measure.
14. If the product list has no instrument that fits (for example a spec CIE does not offer), say so honestly and suggest the nearest model or contacting CIE for a custom build. Never stretch a product beyond its listed specs.
15. Specs, ranges and accuracy must come from the product list. If a figure is not in the list, do not state it.`;


export const POST: APIRoute = async ({ request }) => {
  const groqKey = GROQ_API_KEY;

  let body: { query: string; history?: { role: string; parts: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { query, history = [] } = body;
  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: 'Empty query.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const trimmed = history.slice(-10).map(h => ({
    role: h.role === 'model' ? 'assistant' : h.role === 'assistant' ? 'assistant' : 'user',
    content: String(h.parts ?? '').slice(0, 1500),
  }));
  const priorText = trimmed.map(h => h.content).join('\n').slice(-3000);
  const relevantProducts = getRelevantProducts(query.slice(0, 600), priorText);
  const questionsAsked = trimmed.filter(h => h.role === 'assistant' && h.content.includes('❓')).length;
  const nudge = questionsAsked >= 2
    ? '\n\nThe customer has already answered two clarifying questions. Do NOT ask another question. Give your best recommendation now.'
    : '';
  const systemPrompt = `${BASE_SYSTEM}\n\nRELEVANT PRODUCTS FOR THIS CONVERSATION:\n${relevantProducts}${nudge}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimmed,
    { role: 'user', content: query.slice(0, 600) },
  ];

  const textHeaders = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' };
  const clean = (raw: string) => raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Workers AI replies in different shapes depending on the model; dig the final text out of any of them.
  const extract = (r: any): string => {
    if (!r) return '';
    if (typeof r === 'string') return r;
    if (typeof r.response === 'string') return r.response;
    const c = r.choices?.[0]?.message?.content;
    if (typeof c === 'string') return c;
    if (Array.isArray(r.output)) {
      const parts: string[] = [];
      for (const o of r.output) {
        if (o?.type === 'message' && Array.isArray(o.content)) {
          for (const p of o.content) if (typeof p?.text === 'string') parts.push(p.text);
        }
      }
      if (parts.length) return parts.join('');
    }
    return '';
  };

  // 1) Cloudflare Workers AI: free daily allowance, no API key to manage.
  const aiModels = ['@cf/openai/gpt-oss-120b', '@cf/openai/gpt-oss-20b'];
  for (const model of aiModels) {
    try {
      const r: any = await (env as any).AI.run(model, { messages, max_tokens: 1400, temperature: 0.25 });
      const text = clean(extract(r));
      if (text) return new Response(text, { headers: textHeaders });
      console.warn(`Workers AI ${model} returned no text. Shape: ${JSON.stringify(r).slice(0, 300)}`);
    } catch (err: any) {
      console.warn(`Workers AI error (${model}): ${err?.message || err}`);
    }
  }

  // 2) Groq, only if a working key is configured.
  if (groqKey) {
    const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    for (const model of groqModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model, messages, stream: false, temperature: 0.25, max_tokens: 1400,
            reasoning_effort: 'medium',
          }),
        });
        if (res.ok) {
          const json: any = await res.json();
          const text = clean(json.choices?.[0]?.message?.content ?? '');
          if (text) return new Response(text, { headers: textHeaders });
          console.warn(`Groq ${model} returned empty content`);
          continue;
        }
        console.warn(`Groq ${model} failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
      } catch (err: any) {
        console.warn(`Groq fetch error (${model}): ${err?.message || err}`);
      }
    }
  }

  // 3) Never show an error box: point the visitor to the catalogue and the team.
  return new Response(
    "Volta, our AI advisor, is busy right now. You can browse every instrument in the [product catalogue](https://www.cieinstruments.in/products/), or [contact CIE](https://www.cieinstruments.in/contact/) and we will help you choose.",
    { headers: textHeaders },
  );
};
