import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = async () => {
  const key = import.meta.env.GROQ_API_KEY;
  let groqTest: any = 'not tested';
  if (key) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'say hi' }],
          max_tokens: 10,
        }),
      });
      const text = await res.text();
      groqTest = { status: res.status, body: text.slice(0, 300) };
    } catch (e: any) {
      groqTest = { error: e?.message };
    }
  }
  return new Response(JSON.stringify({
    hasGroq: !!key,
    groqPrefix: key?.slice(0, 8) || 'not set',
    groqTest,
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
