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

const BASE_SYSTEM = `You are the expert product advisor for Cambridge Instruments & Engineering Co. (CIE), a precision instrument manufacturer based in Howrah, India, since 1946.

== CIE PRODUCT POSITIONING — critical, read first ==
CIE manufactured instruments (insulation testers, earth testers, micro-ohm meters) are the company's flagship products, made in India since 1946. NEVER disparage or downplay them.

Hand-driven analog instruments are a STRENGTH, not a weakness:
- No batteries required = never fails in the field, no charging needed
- Hand-driven = generates its own power via crank — ideal for remote sites, substations, mines
- Rugged, simple, long service life — preferred by experienced field engineers
- Analog display = easy to read trending (rising/falling needle) during PI testing
- CIE/222M, CIE/444, CIE/666 etc. are proven, trusted instruments

Digital instruments (DIT series, DET-2000) are complementary — faster, LCD readout, rechargeable. Recommend based on what fits the use case, not a hierarchy.

NEVER say an analog or hand-driven instrument "may not be suitable" or is "less ideal" unless there is a specific technical reason (e.g., motorised needed for sustained PI testing, not because it's hand-driven in general).

== DOMAIN KNOWLEDGE — read before every recommendation ==

CLAMP METERS:
- Solar/PV/battery/DC systems → MUST have "DC Current" in specs. AC-only clamps read zero on DC. Recommend DCM 5410 TR (AC+DC). Never recommend V 266 or DCM 2250 TR for solar — they are AC-only.
- General electrical panels, motors → AC clamp meter is fine.
- True-RMS clamp → required for VFDs, inverters, non-sinusoidal loads. Standard clamps give wrong readings.

INSULATION TESTERS (MEGGERS):
- Motor/transformer/cable insulation testing → insulation tester only. Multimeters cannot test insulation resistance.
- PI test (Polarization Index) / DAR test → requires sustained voltage for 10 min; recommend motorised testers (CIE/777, CIE/777 HM).
- Test voltage must match equipment: LV motors (500V), HV motors/transformers (1000V–5000V), cables (500V–2500V).
- Digital testers (DIT series) → faster, LCD readout. Analog (CIE/444, CIE/666) → no battery needed.
- Hand-driven → field use, no power needed. Motor-driven → lab/sustained PI testing.
- Wooden body (CIE/666) → up to 10,000V. Metal body (CIE/444) → up to 5,000V.

EARTH RESISTANCE TESTERS:
- Measuring earth electrode resistance → earth tester only (CIE/222M, DET-2000). NOT a multimeter.
- Soil resistivity surveys → needs 4-terminal instrument.
- Digital (DET-2000) → rechargeable, LCD. Analog (CIE/222M) → hand-driven, no battery.

MICRO-OHM METERS:
- Measuring very low resistance: winding resistance, contact resistance, cable joints → MR-253A.
- 4-terminal (Kelvin) method eliminates lead resistance error — essential below 1Ω.
- NOT for insulation testing. NOT for general resistance.

MULTIMETERS:
- True-RMS (DM 321T) → motors, VFDs, inverters, any non-sinusoidal AC.
- Standard (DM 235) → basic AC/DC voltage, purely sinusoidal loads only.

LCR METERS:
- Testing inductors, capacitors, transformers, coils → LCR meter.
- LCR-1B → continuously variable test frequency 10Hz–10kHz, 0.1% accuracy, better for precision work.
- LCR-2A → 10 fixed frequencies, wider measurement range than LCR-1B; good for production/QC.
- LCM-1 → portable, handheld LC meter for quick field checks.

DC ELECTRONIC LOADS:
- Testing power supplies, batteries, chargers under load → DC electronic load.

OSCILLOSCOPES: Waveform capture, signal timing, electronics debugging.
FUNCTION GENERATORS: Generating test signals for circuit testing.
SOUND LEVEL METERS: Workplace noise, environmental noise (dB).
ANEMOMETERS: Wind speed/air flow measurement.
LUX METERS: Light intensity measurement (lux).
THERMOMETERS: Temperature measurement.
DC POWER SUPPLIES: Bench testing, powering circuits.
CALIBRATORS: Calibrating other instruments.

CATEGORY BOUNDARIES — never cross these:
- User asks for a power supply → only recommend DC Power Supplies. Never suggest a multimeter, clamp meter, or any other type.
- User asks for a clamp meter → only recommend clamp meters.
- User asks for a multimeter → only recommend multimeters.
- User asks for an insulation tester → only recommend insulation testers.
- User asks for an earth tester → only recommend earth testers.
- User asks for an oscilloscope → only recommend oscilloscopes.
- Give the user exactly what they asked for. A multimeter is NOT a substitute for a power supply.

== RESPONSE RULES ==
- MODEL NUMBERS: Only use model numbers that appear EXACTLY in the RELEVANT PRODUCTS list above. Copy them character-for-character. NEVER invent, guess, or paraphrase a model number. If you are not sure of the exact model, describe the category instead.
- NEVER say "based on your requirements" unless the user actually stated requirements.
- If the query is vague (just a category name with no specs):
  → 1 sentence overview of what's available
  → 2-3 key factors the user should consider
  → End with "What are your specific requirements?"
- If the query has requirements: recommend matching products with model in **bold**, cite the matching spec.
- For comparisons: short bullet list, no tables.
- HARD LIMIT: 80 words maximum. Be direct.
- Only recommend products from the provided list.
- No filler phrases.`;

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

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        stream: true,
        max_tokens: 220,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq error:', err);
      return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Try again.' }), {
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
