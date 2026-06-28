import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = async () => {
  const key = import.meta.env.GEMINI_API_KEY;
  let geminiTest: any = 'not tested';
  if (key) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'say hi' }] }] }),
        }
      );
      const text = await res.text();
      geminiTest = { status: res.status, body: text.slice(0, 300) };
    } catch (e: any) {
      geminiTest = { error: e?.message };
    }
  }
  return new Response(JSON.stringify({
    hasGemini: !!key,
    geminiPrefix: key?.slice(0, 8) || 'not set',
    geminiTest,
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
