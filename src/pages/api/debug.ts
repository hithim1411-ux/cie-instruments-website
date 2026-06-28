import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    hasGemini: !!import.meta.env.GEMINI_API_KEY,
    hasOpenRouter: !!import.meta.env.OPENROUTER_API_KEY,
    geminiPrefix: import.meta.env.GEMINI_API_KEY?.slice(0, 8) || 'not set',
  }), { headers: { 'Content-Type': 'application/json' } });
};
