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

const STOP = new Set(['what','do','i','need','to','for','the','a','an','best','good','which','is','are','can','how','me','my','us','we','should','use','get','buy','find','vs','versus','between','and','or','in','on','with','about','please','help','recommend','some','any','measure']);

function getRelevantProducts(query: string): string {
  // Extract meaningful keywords
  const keywords = query.toLowerCase()
    .replace(/[?!.,]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .join(' ') || query;

  const seen = new Set<string>();
  const pool: FlatProduct[] = [];

  // 1. Full keyword phrase
  for (const r of productFuse.search(keywords, { limit: 8 })) {
    if (!seen.has(r.item.model)) { seen.add(r.item.model); pool.push(r.item); }
  }
  // 2. Each word individually with stricter threshold
  const strictFuse = new Fuse(allProducts, {
    keys: [{ name: 'name', weight: 3 }, { name: 'model', weight: 3 }, { name: 'tagline', weight: 2 }, { name: 'category', weight: 1 }],
    threshold: 0.15, ignoreLocation: true, minMatchCharLength: 3,
  });
  for (const word of keywords.split(/\s+/).filter(w => w.length > 2)) {
    for (const r of strictFuse.search(word, { limit: 4 })) {
      if (!seen.has(r.item.model)) { seen.add(r.item.model); pool.push(r.item); }
    }
  }

  // Fallback: pick diverse products across categories if nothing found
  if (!pool.length) {
    const cats = new Set<string>();
    for (const p of allProducts) {
      if (!cats.has(p.category) && pool.length < 8) { cats.add(p.category); pool.push(p); }
    }
  }

  return pool.slice(0, 10).map(p => {
    const shortSpecs = p.specs.split('; ').slice(0, 3).join('; ');
    return `[${p.model}] ${p.name} (${p.brand}) | ${p.category}\n${p.tagline}\nSpecs: ${shortSpecs}`;
  }).join('\n\n');
}

const BASE_SYSTEM = `You are the AI search assistant for Cambridge Instruments & Engineering Co. (CIE), a precision instrument manufacturer based in Howrah, India, since 1946.

Rules:
- Recommend specific products by model number in **bold**
- Explain in 1-2 sentences why each product suits the need
- For comparisons: use a short bullet list per product, not a markdown table
- Keep responses under 150 words
- Only recommend products from the list provided — never invent products
- End with one short call to action sentence
- Be direct and expert, no filler phrases`;

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
        max_tokens: 512,
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
