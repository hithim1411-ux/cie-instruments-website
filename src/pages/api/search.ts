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

const catMap: Record<string, string> = Object.fromEntries(
  (cieCategories as any[]).map((c: any) => [c.id, c.name])
);

function buildCatalog(): string {
  const lines: string[] = [];
  lines.push('=== CIE MANUFACTURED PRODUCTS (made in Howrah, India since 1946) ===');
  for (const p of cieProducts as any[]) {
    const specs = (p.specs || []).slice(0, 8).map((s: any) => `${s.label}: ${s.value}`).join('; ');
    const apps = (p.applications || []).slice(0, 3).join('; ');
    lines.push(`[${p.model}] ${p.name} | Category: ${catMap[p.categoryId] || p.categoryId} | ${p.tagline || ''} | Specs: ${specs} | Applications: ${apps}`);
  }
  lines.push('\n=== VARTECH PRODUCTS (CIE is authorised dealer) ===');
  const sections = [
    { label: 'Multimeters', items: vMM },
    { label: 'Clamp Meters', items: vCM },
    { label: 'Oscilloscopes', items: vOSC },
    { label: 'Function Generators', items: vFG },
    { label: 'LCR & Cap Meters', items: vLCR },
    { label: 'DC Electronic Loads', items: vDCL },
    { label: 'Sound Level Meters', items: vSLM },
    { label: 'Anemometers', items: vANE },
    { label: 'Calibrators', items: vCAL },
    { label: 'Lux Meters', items: vLUX },
    { label: 'Thermometers', items: vTHM },
    { label: 'DC Power Supplies', items: vPS },
  ];
  for (const { label, items } of sections) {
    for (const p of items as any[]) {
      const specs = (p.specs || []).slice(0, 6).map((s: any) => `${s.label}: ${s.value}`).join('; ');
      lines.push(`[${p.model}] ${p.name} | Category: ${label} | ${p.tagline || ''} | Specs: ${specs}`);
    }
  }
  return lines.join('\n');
}

const CATALOG = buildCatalog();

const SYSTEM_PROMPT = `You are the AI search assistant for Cambridge Instruments & Engineering Co. (CIE), a precision instrument manufacturer based in Howrah, India, since 1946. Help customers find the right instrument from the catalog below.

Rules:
- Recommend specific products by model number in **bold**
- Explain why each product suits the customer's need
- For comparisons, use a brief structured format
- Keep responses under 200 words unless a detailed comparison is requested
- Only recommend products actually in the catalog — never invent products
- End with a short call to action (e.g. "Contact CIE for pricing" or "View full specs on the product page")
- Be friendly, expert, and concise

FULL PRODUCT CATALOG:
${CATALOG}`;

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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
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
