import type { APIRoute } from 'astro';
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
import vPS from '../../data/vartech-dc-power-supplies.json';

export const prerender = false;

import Fuse from 'fuse.js';

const catMap: Record<string, string> = Object.fromEntries(
  (cieCategories as any[]).map((c: any) => [c.id, c.name])
);

// Rich product index — full data for AI context
type RichProduct = {
  model: string; name: string; category: string; brand: string;
  tagline: string; description: string; specs: string;
  apps: string; options: string; orderNote: string; url: string;
};

const allProducts: RichProduct[] = [];

for (const p of cieProducts as any[]) {
  const cat = catMap[p.categoryId] || p.categoryId;
  const slug = `/products/${p.categoryId}/${p.id}/`;
  allProducts.push({
    model: p.model, name: p.name, category: cat,
    brand: 'CIE (manufactured in Howrah, India)',
    tagline: p.tagline || '',
    description: (p.description || '').slice(0, 300),
    specs: (p.specs || []).map((s: any) => `${s.label}: ${s.value}`).join(' | '),
    apps: (p.applications || []).join(' | '),
    options: (p.options || []).slice(0, 5).join(' | '),
    orderNote: p.orderNote || '',
    url: `https://cieinstruments.in${slug}`,
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
  { label: 'DC Power Supplies', slug: 'dc-power-supplies', items: vPS },
];
for (const { label, slug, items } of vartechSections) {
  for (const p of items as any[]) {
    allProducts.push({
      model: p.model, name: p.name, category: label,
      brand: 'Vartech (CIE authorised dealer)',
      tagline: p.tagline || '',
      description: (p.description || '').slice(0, 200),
      specs: (p.specs || []).map((s: any) => `${s.label}: ${s.value}`).join(' | '),
      apps: (p.features || []).slice(0, 5).join(' | '),
      options: '',
      orderNote: '',
      url: `https://cieinstruments.in/authorised-dealership/${slug}/${p.id}/`,
    });
  }
}

// ── Category routing ──────────────────────────────────────────────────────
// Maps intent keywords → category labels in allProducts
const CATEGORY_ROUTES: [RegExp, string[]][] = [
  [/\binsulat|megger|megohm|winding insul|motor insul|cable insul/i,
    ['Insulation Testers — Hand-Driven','Multirange Insulation Testers (Hand-Driven)','Motor-Operated Insulation Testers','Multirange Motorised Insulation Testers','Compact / Economical Insulation Testers','Digital Insulation Testers']],
  [/\bearth\b|earthing|grounding|earth tester|earth electrode|earth resist/i,
    ['Earth Resistance Testers']],
  [/\bclamp\b|solar|pv system|photovoltaic|dc clamp/i,
    ['Clamp Meters']],
  [/\bmultimeter\b|voltage fluctuat|volt fluctuat|dmm|general electrical|mains voltage/i,
    ['Digital Multimeters']],
  [/\blcr\b|inductan|capacitan|impedance|coil test|component test/i,
    ['LCR & Cap Meters']],
  [/\boscilloscope\b|waveform|signal capture/i,
    ['Oscilloscopes']],
  [/\bfunction generator\b|signal generator\b/i,
    ['Function Generators']],
  [/\bpower supply\b|bench supply|lab supply|psu\b/i,
    ['DC Power Supplies']],
  [/\bdc load\b|electronic load\b|battery test|ev battery|battery analys|discharge test|load test|dummy load/i,
    ['DC Electronic Loads']],
  [/\bsound level\b|noise\b|decibel|dba\b|noise meter/i,
    ['Sound Level Meters']],
  [/\blux\b|light intensity|illuminan|brightness meter/i,
    ['Lux Meters']],
  [/\banemometer\b|wind speed|air speed|air flow/i,
    ['Anemometers']],
  [/\btemperatur\b|thermometer|thermocouple|heat meter/i,
    ['Thermometers']],
  [/\bcalibrat/i,
    ['Calibrators']],
  [/\bmicro.?ohm\b|winding resist|contact resist|low resist/i,
    ['Micro-Ohm Meters']],
];

function getRelevantProducts(query: string): string {
  const matchedCats = new Set<string>();
  for (const [pattern, cats] of CATEGORY_ROUTES) {
    if (pattern.test(query)) cats.forEach(c => matchedCats.add(c));
  }

  let pool: RichProduct[];

  if (matchedCats.size > 0) {
    pool = allProducts.filter(p => matchedCats.has(p.category));
  } else {
    // No category matched — send 1 rep per category for AI to ask what they need
    const seen = new Set<string>();
    pool = allProducts.filter(p => { if (seen.has(p.category)) return false; seen.add(p.category); return true; });
  }

  return pool.map(p => {
    let entry = `MODEL: ${p.model}\nNAME: ${p.name}\nBRAND: ${p.brand}\nCATEGORY: ${p.category}`;
    if (p.tagline) entry += `\nTAGLINE: ${p.tagline}`;
    if (p.description) entry += `\nDESCRIPTION: ${p.description}`;
    if (p.specs) entry += `\nSPECS: ${p.specs}`;
    if (p.apps) entry += `\nAPPLICATIONS: ${p.apps}`;
    if (p.orderNote) entry += `\nORDERING: ${p.orderNote}`;
    if (p.options) entry += `\nOPTIONS: ${p.options}`;
    entry += `\nPRODUCT PAGE: ${p.url}`;
    return entry;
  }).join('\n\n---\n\n');
}

const BASE_SYSTEM = `You are Arjun, the lead technical sales expert at Cambridge Instruments & Engineering Co. (CIE), Howrah — India's premier precision instrument manufacturer since 1946. You have 25 years of hands-on field experience across power utilities, steel plants, railways, refineries, and electrical contractors.

## CIE PRODUCT KNOWLEDGE
- CIE manufactures in Howrah since 1946 — ISS/IS certified, battle-tested across Indian industry
- Hand-driven analog testers = ZERO battery dependency — essential at remote sites, mines, substations, offshore rigs
- Analog needle = live trending during PI/DAR absorption tests — experienced engineers prefer this over digital
- CIE/444: hand-driven, metal body, configurable 100V to 5000V (27 configurations) — never call it "a 500V tester"
- CIE/666: hand-driven, wooden body, up to 10,000V — only hand-driven option above 5000V
- CIE/444/MR and CIE/666/MR: multirange versions — one instrument, multiple test voltages
- CIE/777: motorised (mains-powered), for PI/DAR — sustained 10-min test
- CIE/777 HM: motor + hand-driven combined

## INSULATION TESTING — COMPLETE DECISION TREE

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

## CLAMP METERS
- **AC-only panels, motors, switchboards** → DCM 2250 TR (True-RMS, 1000A AC)
- **Solar PV, DC bus, battery banks, EV charging** → DCM 5410 TR ONLY — AC clamps read ZERO on DC current, a dangerous mistake
- **Both AC and DC** → DCM 5410 TR (1000A AC + 1000A DC, capacitance, frequency, temperature)

## MULTIMETERS
- **VFDs, inverters, UPS, motors (non-sinusoidal waveforms)** → DM 321T (True-RMS) — average-responding meters under-read by 30–40% on distorted waveforms
- **General AC panel voltage, resistance, continuity** → DM 235

## MICRO-OHM METERS
- Winding resistance, contact resistance, cable joint resistance, busbar joints → **MR-253A**
- 4-terminal Kelvin method, 1µΩ to 19.99kΩ, 8 ranges — eliminates lead resistance error below 1Ω

## LCR METERS
- **R&D, transformer characterisation, precision component testing** → LCR-1B (continuously variable 10Hz–10kHz, 0.1% accuracy)
- **Production QC, incoming inspection, speed matters** → LCR-2A (10 fixed frequencies 100Hz–10kHz, wider range)
- **Field check of capacitors and inductors** → LCM-1 (portable, 1pF–100mF, 1µH–100H)

## OTHER CATEGORIES
- **DC Electronic Loads**: battery discharge testing, PSU verification, burn-in — match load voltage/current range to DUT
- **Oscilloscopes**: scope bandwidth must be ≥ 5× the highest signal frequency you need to capture
- **Function Generators**: match frequency range and waveform types to the circuit under test
- **Sound Level Meters**: use A-weighting (dBA) for occupational noise compliance per Indian Factory Act
- **Power Supplies**: SMPS for efficiency; linear regulated for low-noise analog circuits

## RESPONSE FORMAT

**When you have enough info to recommend:**
**Recommended:** [exact model] — [name]
**Why:** [1–2 sentences citing the specific spec or rule that makes this the right choice]
**Key specs:**
• [most relevant spec]
• [second]
• [third]
**Also consider:** [model] — [specific condition when this is better] *(only if a genuinely different use case exists)*
→ [Contact CIE for pricing and availability](https://cieinstruments.in/contact/)

Do NOT include product page URLs — product cards are shown below.

---

**When comparing (user says compare / vs / difference):**
**[Model A]** — [name]
• [key spec] • [key spec] • Best for: [use case]

**[Model B]** — [name]
• [key spec] • [key spec] • Best for: [use case]

Choose **[A]** if [specific condition]. Choose **[B]** if [specific condition].
→ [Contact CIE for pricing](https://cieinstruments.in/contact/)

---

**When one specific thing is unclear and you must ask:**
❓ [ONE sharp technical question — name the exact parameter and why it changes the recommendation]

Example of a GOOD question: "Is this for a PI/DAR test (sustained 10-minute test) or a routine spot IR reading? This determines whether you need a motorised tester."
Example of a BAD question: "What voltage is the equipment?" — too vague, doesn't help the customer.

If asking about insulation: ask about TEST PURPOSE (routine vs PI/DAR) and SITE POWER (mains available?), NOT "what voltage is the equipment" — assume LV (500V test) unless the customer mentioned MV/HV/transformer/switchgear/cable above 1kV.

---

## IRON RULES
1. Use model numbers EXACTLY as they appear in the product list. Never invent a model.
2. Never mention price or cost.
3. Assume LV (500V test voltage) for any "motor" or "cable" insulation query unless MV/HV is stated.
4. Never ask more than ONE question. Pick the single most critical unknown.
5. No preamble — start the response directly with the recommendation or question.
6. Max 200 words unless it is a detailed comparison.
7. Do not repeat the customer's question back to them.`;


// ── Shared SSE → plain-text stream helper (OpenAI-compatible format) ─────────
function openAIStream(res: Response, encoder: TextEncoder): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const text = json.choices?.[0]?.delta?.content ?? '';
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const groqKey = import.meta.env.GROQ_API_KEY;
  if (!groqKey) {
    return new Response(JSON.stringify({ error: 'AI search not configured.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const relevantProducts = getRelevantProducts(query);
  const systemPrompt = `${BASE_SYSTEM}\n\nRELEVANT PRODUCTS FOR THIS QUERY:\n${relevantProducts}`;
  const encoder = new TextEncoder();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts })),
    { role: 'user', content: query },
  ];

  // Groq model chain — try every model regardless of error type
  const groqModels = [
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];

  for (const model of groqModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: 350, temperature: 0.3 }),
      });

      if (res.ok) {
        return new Response(openAIStream(res, encoder), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
        });
      }

      const errText = await res.text();
      console.warn(`Groq model ${model} failed ${res.status}: ${errText.slice(0, 200)}`);
      // continue to next model regardless of error type
    } catch (err: any) {
      console.warn(`Groq fetch error (${model}): ${err?.message || err}`);
      // continue to next model
    }
  }

  return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Please try again in a moment.' }), {
    status: 503, headers: { 'Content-Type': 'application/json' },
  });
};
