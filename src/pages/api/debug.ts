import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = async () => {
  const key = import.meta.env.GROQ_API_KEY;
  let groqTest: any = 'key not set';
  if (key) {
    for (const model of ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768']) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: 'say hi' }], max_tokens: 5 }),
        });
        const text = await res.text();
        groqTest = { model, status: res.status, body: text.slice(0, 200) };
        if (res.ok) break;
      } catch (e: any) {
        groqTest = { model, error: e?.message };
      }
    }
  }
  return new Response(JSON.stringify({
    hasGroq: !!key,
    groqPrefix: key?.slice(0, 8) || 'not set',
    groqTest,
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
