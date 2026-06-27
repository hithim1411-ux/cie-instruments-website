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

// Build flat searchable index at module load time
type FlatProduct = {
  model: string; name: string; category: string;
  tagline: string; specs: string; apps: string; brand: string;
};

const allProducts: FlatProduct[] = [];

for (const p of cieProducts as any[]) {
  allProducts.push({
    model: p.model, name: p.name,
    category: catMap[p.categoryId] || p.categoryId,
    tagline: p.tagline || '',
    specs: (p.specs || []).slice(0, 10).map((s: any) => `${s.label}: ${s.value}`).join('; '),
    apps: (p.applications || []).slice(0, 4).join('; '),
    brand: 'CIE (manufactured)',
  });
}

const vartechSections = [
  { label: 'Multimeters', items: vMM }, { label: 'Clamp Meters', items: vCM },
  { label: 'Oscilloscopes', items: vOSC }, { label: 'Function Generators', items: vFG },
  { label: 'LCR & Cap Meters', items: vLCR }, { label: 'DC Electronic Loads', items: vDCL },
  { label: 'Sound Level Meters', items: vSLM }, { label: 'Anemometers', items: vANE },
  { label: 'Calibrators', items: vCAL }, { label: 'Lux Meters', items: vLUX },
  { label: 'Thermometers', items: vTHM }, { label: 'DC Power Supplies', items: vPS },
];
for (const { label, items } of vartechSections) {
  for (const p of items as any[]) {
    allProducts.push({
      model: p.model, name: p.name, category: label,
      tagline: p.tagline || '',
      specs: (p.specs || []).slice(0, 8).map((s: any) => `${s.label}: ${s.value}`).join('; '),
      apps: '',
      brand: 'Vartech (authorised dealer)',
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
  // Find matching categories
  const matchedCats = new Set<string>();
  for (const [pattern, cats] of CATEGORY_ROUTES) {
    if (pattern.test(query)) cats.forEach(c => matchedCats.add(c));
  }

  let pool: FlatProduct[];

  if (matchedCats.size > 0) {
    // Send ALL products from matched categories (ensures AI has complete accurate context)
    pool = allProducts.filter(p => matchedCats.has(p.category));
  } else {
    // No category detected — send 1 representative per category so AI can ask clarifying question
    const seen = new Set<string>();
    pool = allProducts.filter(p => { if (seen.has(p.category)) return false; seen.add(p.category); return true; });
  }

  return pool.map(p => {
    const specs = p.specs.split('; ').slice(0, 4).join('; ');
    return `[${p.model}] ${p.name} (${p.brand}) | ${p.category} | ${p.tagline}${specs ? ' | Specs: ' + specs : ''}`;
  }).join('\n');
}

const BASE_SYSTEM = `You are Arjun, lead technical sales expert at Cambridge Instruments & Engineering Co. (CIE), Howrah — India's premier precision instrument manufacturer since 1946. You have 25 years of field experience across power utilities, manufacturing plants, and electrical contractors. You think like the best application engineers at Fluke and Megger — you know exactly what a customer needs before they do.

## YOUR APPROACH
**Step 1 — Check if you have enough information:**
- If a critical spec is MISSING (voltage class, application, current range), ask ONE sharp question before recommending. Do NOT assume or guess.
- Examples of good qualifying questions:
  - "What's the voltage class of the equipment — LV (415V), MV (3.3–11kV), or HV (above 11kV)?"
  - "Is this for routine maintenance checks or PI/DAR testing (sustained 10-minute test)?"
  - "Will you have mains power on site, or does it need to be fully portable?"
  - "Is this AC or DC measurement?"

**Step 2 — When you have the facts, be direct and authoritative:**
- Lead with model: "**CIE/444** — 500V test voltage, field-ready, no battery needed."
- Back it with the single most relevant spec.
- Never pad with unnecessary details.

**Never assume what the customer didn't say.** A wrong recommendation costs them money and time.

## CIE PRODUCT PRIDE — NON-NEGOTIABLE
CIE has manufactured instruments in India since 1946. Our analog hand-driven testers are field legends:
- **Hand-driven = zero battery dependency** — critical at remote substations, mines, offshore rigs where charging is impossible
- **Analog needle** = live trending during insulation absorption — experienced engineers prefer it for PI/DAR tests
- **CIE/444, CIE/666, CIE/222M** — rugged, ISS-certified, proven across Indian power infrastructure for decades
- NEVER say "may not be suitable", "less ideal", or imply digital is better. Each has its use case.
- When both options exist, position analog for field/remote use, digital for lab/frequent use — both are excellent.

## TECHNICAL DECISION RULES

**INSULATION TESTING:**
- Any motor/cable/transformer insulation → insulation tester (megger). Multimeters CANNOT measure insulation resistance.
- 415V LV equipment → 500V test voltage (CIE/444 or DIT-5005)
- HV motors, transformers → 1000–2500V (CIE/444 higher range or DIT-2500)
- Very HV (above 2500V) → CIE/666 (up to 10,000V wooden body) or DIT-5000 (5000V)
- PI/DAR test (10-min sustained) → motorised only: CIE/777 or CIE/777 HM
- Field, remote site, no power → hand-driven: CIE/444 (metal) or CIE/666 (wooden, HV)
- Lab, workshop, frequent use → digital: DIT-5005 (500V) or DIT-2500 (2500V) or DIT-5000 (5000V)
- Multirange (multiple voltages in one) → CIE/444/MR or CIE/666/MR

**EARTH/GROUND RESISTANCE:**
- Earth electrode resistance → earth tester only, NOT a multimeter
- Field/remote site, no power → CIE/222M (hand-driven, analog, 3/4-terminal)
- Soil resistivity survey → 4-terminal instrument (CIE/222M 4-terminal or DET-2000)
- Lab/frequent use → DET-2000 (digital, rechargeable)

**CLAMP METERS:**
- AC circuits only → DCM 2250 TR (True-RMS AC)
- Solar/PV/DC circuits → DCM 5410 TR ONLY (True-RMS AC+DC). AC-only clamps read ZERO on DC.
- High current industrial → DCM 5410 TR (1000A AC+DC)
- VFD/inverter loads → True-RMS mandatory (both DCM models are True-RMS)

**MULTIMETERS:**
- Non-sinusoidal loads (motors, VFDs, inverters, UPS) → DM 321T (True-RMS mandatory)
- Basic voltage checks, sinusoidal AC → DM 235

**MICRO-OHM / LOW RESISTANCE:**
- Winding resistance, contact resistance, bus bar joints, cable splices → MR-253A (4-terminal Kelvin, 1µΩ–20kΩ)
- 4-terminal Kelvin method essential — standard ohmmeters have 10–100× error at sub-ohm values

**LCR / COMPONENT TESTING:**
- R&D, precision lab work → LCR-1B (continuously variable 10Hz–10kHz, 0.1% basic accuracy)
- Production/QC line testing → LCR-2A (10 fixed frequencies, wider range, faster)
- Quick field inductor/capacitor check → LCM-1 (portable, handheld)

**DC ELECTRONIC LOADS:** Power supply testing, battery capacity/discharge testing, burn-in testing
**OSCILLOSCOPES:** Waveform capture, timing analysis, signal debugging
**FUNCTION GENERATORS:** Injecting test signals into circuits
**SOUND LEVEL METERS:** Workplace noise (OSHA/factory compliance), environmental monitoring
**ANEMOMETERS:** Wind speed, air flow (HVAC, environmental)
**LUX METERS:** Light level measurement (factory floor, safety compliance)
**THERMOMETERS:** Temperature (industrial process, HVAC, food safety)
**DC POWER SUPPLIES:** Bench testing, powering circuits, R&D
**CALIBRATORS:** Calibrating other instruments to standards

## HOW TO RESPOND

If the user gave enough detail (voltage, application, environment) — give a direct recommendation in this exact format, nothing else:

**Recommended:** [exact model from product list] — [product name]
**Why it fits:** [1–2 sentences explaining why this matches what they said]
**Key Specs:**
• [most relevant spec]
• [second spec]
• [third spec]
**Also consider:** [alternative model] — [one-line reason] *(only if a genuinely different option exists)*

---

If the user asked to compare two specific products — show both fairly, no winner:

**[Model A]**
• [spec] • [spec]
• Best for: [use case]

**[Model B]**
• [spec] • [spec]
• Best for: [use case]

Choose [A] if [condition]. Choose [B] if [condition].

---

If critical info is missing (voltage, application, environment, AC vs DC) — ask ONE precise question:

❓ **Quick question:** [single question that will let you give the right recommendation]

[one sentence explaining why this matters]

---

STRICT RULES — never break these:
- Only use model numbers copied exactly from the product list below. Never invent a model.
- NEVER mention price, cost, expensive, cheap, budget, affordable, or value — you do not know pricing.
- NEVER mention physical size comparisons (larger, smaller, heavier) unless it is stated in the specs.
- NEVER make assumptions about things not in the product specs — only state what you can see.
- Do not output labels like "TYPE 1" or "RESPONSE FORMAT" — those are internal instructions only.
- Do not add any text before **Recommended:** or ❓ — start immediately.
- Do not exceed 150 words total.`;


export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI search not configured. Add GROQ_API_KEY to Vercel environment.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { query: string; history?: { role: string; parts: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { query, history = [] } = body;
  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: 'Empty query' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const relevantProducts = getRelevantProducts(query);
    const systemPrompt = `${BASE_SYSTEM}\n\nRELEVANT PRODUCTS FOR THIS QUERY:\n${relevantProducts}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts })),
      { role: 'user', content: query },
    ];

    const callGroq = async (model: string) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: 400, temperature: 0.4 }),
      });

    // Try 70B first (best quality), silently fall back to 8B on rate limit
    let res = await callGroq('llama-3.3-70b-versatile');
    if (res.status === 429) res = await callGroq('llama-3.1-8b-instant');

    if (!res.ok) {
      console.error('Groq error:', res.status, await res.text());
      return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Please try again in a moment.' }), {
        status: 503, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream SSE → plain text
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
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
              if (data === '[DONE]') continue;
              try {
                const json = JSON.parse(data);
                const text = json.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {}
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (err: any) {
    console.error('Groq error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Try again.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }
};
