import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

const productFuse = new Fuse(allProducts, {
  keys: [
    { name: 'name', weight: 3 }, { name: 'model', weight: 3 },
    { name: 'tagline', weight: 2 }, { name: 'specs', weight: 2 },
    { name: 'apps', weight: 1.5 }, { name: 'category', weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

function getRelevantProducts(query: string): string {
  // Semantic-ish: also add keyword expansion for common intents
  const expanded = query
    .replace(/\bmotor\b/gi, 'motor insulation winding')
    .replace(/\bearth(ing)?\b/gi, 'earth resistance ground')
    .replace(/\bsolar\b/gi, 'solar DC current clamp');

  const hits = productFuse.search(expanded, { limit: 12 });
  if (!hits.length) {
    // fall back: return all products in compact form
    return allProducts.map(p =>
      `[${p.model}] ${p.name} (${p.brand}) | ${p.category} | ${p.tagline}`
    ).join('\n');
  }
  return hits.map(h => {
    const p = h.item;
    return `[${p.model}] ${p.name} (${p.brand})\nCategory: ${p.category}\n${p.tagline}\nSpecs: ${p.specs}${p.apps ? '\nApplications: ' + p.apps : ''}`;
  }).join('\n\n');
}

const BASE_SYSTEM = `You are the AI search assistant for Cambridge Instruments & Engineering Co. (CIE), a precision instrument manufacturer based in Howrah, India, since 1946.

Rules:
- Recommend specific products by model number in **bold**
- Explain why each suits the customer's need
- For comparisons, use a brief structured format
- Keep responses under 200 words unless a detailed comparison is requested
- Only recommend products from the list provided — never invent products
- End with a short call to action (e.g. "Contact CIE for pricing" or "View full specs on the product page")
- Be friendly, expert, and concise`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI search not configured. Add GEMINI_API_KEY to environment.' }), {
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
    const systemInstruction = `${BASE_SYSTEM}\n\nRELEVANT PRODUCTS FOR THIS QUERY:\n${relevantProducts}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: [{ text: h.parts }],
      })),
    });

    const result = await chat.sendMessageStream(query);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Gemini error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'AI temporarily unavailable. Try again.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }
};
