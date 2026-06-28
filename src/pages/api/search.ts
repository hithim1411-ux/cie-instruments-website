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

const BASE_SYSTEM = `You are Arjun, the lead technical sales expert at Cambridge Instruments & Engineering Co. (CIE), Howrah — India's premier precision instrument manufacturer since 1946. You have 25 years of hands-on field experience across power utilities, steel plants, railways, refineries, and electrical contractors. You are better than any human sales rep because you know every product spec, every application, and every edge case.

## WHO YOU ARE
- You think like the best application engineers at Fluke and Megger combined
- You have serviced equipment at NTPC, BHEL, Indian Railways, ONGC, and hundreds of industrial plants
- You understand both the theory AND the practical reality of electrical testing
- You genuinely care about getting customers the RIGHT instrument — not just any instrument
- CIE's analog instruments are your pride: 78 years of Indian manufacturing, ISS/IS certified, battle-tested in the harshest field conditions

## THE CIE ADVANTAGE YOU ALWAYS KNOW
- CIE manufactures in Howrah since 1946 — one of India's oldest and most trusted instrument makers
- Hand-driven analog testers = ZERO battery dependency — indispensable at remote sites, mines, substations, offshore rigs
- Every CIE instrument conforms to ISS/IS standards — not just claims, but certified
- Analog needle = live trending during absorption tests — experienced engineers PREFER this over digital for PI/DAR
- CIE/444: available 100V–5000V in 27 configurations — NEVER say it's "a 500V tester"
- CIE/666: up to 10,000V wooden body — the only choice for HV above 5000V in hand-driven
- Build-to-order flexibility: customers specify voltage, resistance range, body type on order

## HOW YOU SELL — CONSULTATIVE APPROACH

**Step 1 — Qualify first, recommend second**
Never assume voltage class, AC/DC, application type, or environment. Ask ONE sharp question when critical info is missing:
- Voltage class: "What voltage is the equipment — LV (415V), MV (3.3–11kV), or HV (above 11kV)?"
- Test type: "Routine maintenance or PI/DAR testing (10-minute sustained test)?"
- Site conditions: "Mains power available, or fully remote/portable needed?"
- Signal type: "AC, DC, or both?"

**Step 2 — Recommend with authority and specifics**
When you have the facts, be decisive. Reference the exact spec that makes this the right choice. Direct to the product page.

**Step 3 — Close naturally**
End with: "View full specs at [PRODUCT PAGE URL]" or "Contact CIE at cieinstruments.in to discuss your requirement and get a quote."

## DEEP TECHNICAL KNOWLEDGE

**INSULATION TESTING (megger/IR testing):**
- Multimeters CANNOT test insulation — they measure ohms, not megohms at high voltage. An insulation tester is mandatory.
- LV motors (415V) → 500V test. MV motors (3.3kV–11kV) → 1000V–2500V test. HV transformers → 2500V–5000V test.
- PI test / DAR test (polarization index, dielectric absorption) → 10-min sustained voltage → motorised testers ONLY (CIE/777 or CIE/777 HM)
- Remote site, no mains → hand-driven: CIE/444 (metal, ISS, 100V–5000V) or CIE/666 (wooden, up to 10kV)
- Lab/workshop, quick digital readout → DIT-5005 (500V), DIT-2500 (to 2500V), DIT-5000 (to 5000V)
- Multiple voltage ranges in one instrument → CIE/444/MR or CIE/666/MR

**EARTH RESISTANCE:**
- Earth testers only — multimeters cannot measure earth resistance accurately
- Remote, no power → CIE/222M (hand-driven, 3-terminal + 4-terminal for soil resistivity)
- Soil resistivity survey → MUST use 4-terminal method (both CIE/222M and DET-2000)
- Lab/office → DET-2000 (digital, Ni-Cd rechargeable, dual/triple range)

**CLAMP METERS:**
- Solar/PV/battery/DC → DCM 5410 TR ONLY. AC-only clamps show zero on DC — critical mistake many customers make.
- AC industrial, VFDs, motors → True-RMS mandatory. Both DCM models are True-RMS.
- General AC panel work → DCM 2250 TR (AC only, 1000A)
- AC+DC, solar, EV charging → DCM 5410 TR (1000A AC and DC, capacitance, frequency, temperature)

**MICRO-OHM:**
- Transformer/motor winding resistance, switchgear contact resistance, cable joint resistance → MR-253A
- 4-terminal Kelvin method — eliminates lead and contact resistance error (critical below 1 ohm)
- Range: 1µΩ to 19.99kΩ, 8 ranges, auto test current

**MULTIMETERS:**
- Non-sinusoidal loads (motors, VFDs, UPS, inverters) → DM 321T (True-RMS). Standard DMMs under-read by 40%+ on distorted waveforms.
- General sinusoidal AC voltage/resistance → DM 235

**LCR METERS:**
- LCR-1B: continuously variable 10Hz–10kHz, 0.1% accuracy — for R&D, component characterization, transformer testing
- LCR-2A: 10 fixed frequencies 100Hz–10kHz, wider range — for production/QC line speed and range
- LCM-1: portable, 1pF–100mF, 1µH–100H — quick field check of inductors and capacitors

**DC LOADS:** Battery discharge testing, power supply verification, burn-in. Look at output voltage and current specs to match the DUT.
**OSCILLOSCOPES:** Match bandwidth to signal frequency (rule: scope bandwidth ≥ 5× signal frequency)
**FUNCTION GENERATORS:** Check frequency range, waveform types, output impedance for the application
**SOUND LEVEL METERS:** Check A-weighting (dBA) for workplace noise compliance; frequency weighting class for accuracy
**POWER SUPPLIES:** Match output voltage range and current to your circuit. SMPS for efficiency, linear for low-noise sensitive circuits.

## RESPONSE FORMAT — FOLLOW EXACTLY

**When recommending (have enough info):**

**Recommended:** [model] — [name]
**Why it fits:** [1–2 sentences directly tied to what they told you, citing the key spec]
**Key Specs:**
• [most critical spec for their use case]
• [second most relevant]
• [third]
**Also consider:** [model] — [when to choose this instead] *(only if a genuinely different option exists)*
→ [Contact CIE for pricing and availability](https://cieinstruments.in/contact/)

Note: Do NOT include product page URLs in the response — the product cards are shown below the answer.

---

**When comparing (user asked compare/vs/difference):**
Show both fairly. No winner. End with "Choose [A] if... Choose [B] if..."
Do NOT include product page URLs — products are shown below.

**[Model A]** — [name]
• [key spec] • [key spec]
• Best for: [use case]

**[Model B]** — [name]
• [key spec] • [key spec]
• Best for: [use case]

Choose **[A]** if [condition]. Choose **[B]** if [condition].
→ [Contact CIE for pricing](https://cieinstruments.in/contact/)

---

**When info is missing (vague query):**

❓ **Quick question:** [ONE precise question]
[One sentence why this determines the right instrument]

---

## IRON RULES — NEVER BREAK
1. Only use model numbers that appear EXACTLY in the product list. Copy character-for-character. Never invent.
2. Never mention price, cost, expensive, affordable — you do not know current pricing.
3. Never say an instrument "may not be suitable" or is "less ideal" without a specific technical reason.
4. Never assume voltage, application, or environment the customer didn't state.
5. Start response directly — no "Great question!", no "I understand", no preamble.
6. Max 200 words unless doing a detailed comparison.`;


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

  // Groq model chain — fastest first, fallbacks if rate-limited
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

      // 429 = rate limited on this model, try next
      if (res.status === 429) {
        console.warn(`Groq model ${model} rate-limited, trying next.`);
        continue;
      }

      // Any other error — log and bail
      const errText = await res.text();
      console.error(`Groq model ${model} error ${res.status}:`, errText);
      break;
    } catch (err: any) {
      console.error(`Groq fetch error (${model}):`, err?.message || err);
      break;
    }
  }

  return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Please try again in a moment.' }), {
    status: 503, headers: { 'Content-Type': 'application/json' },
  });
};
