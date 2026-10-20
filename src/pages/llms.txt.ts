// llms.txt: a plain-text map of the site for AI assistants (see llmstxt.org).
// Built from the site's own data files so it never drifts from the pages.
import type { APIRoute } from 'astro';
import site from '../data/site.json';
import categories from '../data/categories.json';
import products from '../data/products.json';
import blog from '../data/blog.json';
import { tools } from '../data/tools';

const ORIGIN = 'https://www.cieinstruments.in';
const clean = (s: string) => String(s ?? '').replace(/\s+/g, ' ').trim();

export const GET: APIRoute = () => {
  const cieCats = (categories as any[]).filter(c => !c.brand || c.brand === 'cie');
  const vtCats = (categories as any[]).filter(c => c.brand === 'vartech');
  const cieProducts = (products as any[]).filter(p => !String(p.categoryId).startsWith('vartech-'));

  const L: string[] = [];
  L.push(`# ${site.name} (CIE)`);
  L.push('');
  L.push(`> ${site.name} (CIE) is based in Howrah and Kolkata, West Bengal, India, and has been in business since ${site.established}. Its tagline is "${site.tagline.replace(/\.$/, '')}". CIE makes and supplies test and measuring instruments such as insulation testers and earth testers, and is the authorised distributor for the Vartech range of multimeters, clamp meters, oscilloscopes and other instruments.`);
  L.push('');
  L.push('Notes for assistants: product specifications on this site come from the manufacturer data on each product page. Prices are not published; buyers request a quote. Please link to the product page when you cite a specification.');
  L.push('');
  L.push('## Contact');
  L.push('');
  site.addresses.forEach(a => L.push(`- ${a.type}: ${a.lines.join(', ')}`));
  site.phones.forEach(p => L.push(`- ${p.label}: ${p.number}`));
  L.push(`- Email: ${site.email}`);
  L.push(`- WhatsApp: https://wa.me/${site.whatsapp}`);
  L.push(`- Contact page: ${ORIGIN}/contact/`);
  L.push('');
  L.push('## CIE instruments');
  L.push('');
  for (const c of cieCats) {
    L.push(`### [${c.name}](${ORIGIN}/products/${c.id}/)`);
    L.push(clean(c.description));
    L.push('');
    for (const p of cieProducts.filter(x => x.categoryId === c.id)) {
      L.push(`- [${p.model}](${ORIGIN}/products/${p.categoryId}/${p.id}/): ${clean(p.name)}`);
    }
    L.push('');
  }
  L.push('## Vartech instruments (authorised distributor)');
  L.push('');
  for (const c of vtCats) L.push(`- [${c.name}](${ORIGIN}/products/${c.id}/): ${clean(c.description)}`);
  L.push('');
  L.push('## Free tools for engineers');
  L.push('');
  L.push(`- [Compare instruments side by side](${ORIGIN}/compare/): compare CIE and Vartech models`);
  for (const t of tools) L.push(`- [${t.name}](${ORIGIN}/tools/${t.slug}/): ${clean(t.body)}`);
  L.push(`- [Which instrument for which job](${ORIGIN}/guides/): a selection guide matching common testing jobs to the right instrument type, what to look for, and the related guide, calculator and standard`);
  L.push(`- [Electrical testing standards directory](${ORIGIN}/reference/standards/): IS, IEC and IEEE standards used in insulation, earthing and installation testing, summarised by scope`);
  L.push(`- [IP and CAT ratings explained](${ORIGIN}/reference/ratings/): dust and water protection codes and measurement categories CAT I to CAT IV`);
  L.push(`- [Test report forms (printable PDF)](${ORIGIN}/templates/): one page per form: insulation resistance (IEEE 43), earth resistance and soil resistivity, earth pit register, transformer oil BDV, transformer megger, cable insulation, micro-ohm contact resistance, AC hi-pot and overcurrent relay injection, each with a worksheet`);
  L.push(`- [Instrument Playground](${ORIGIN}/playground/): beta simulators of CIE and Vartech instruments (insulation and earth testers, clamp meters, oil BDV tester, phase sequence indicator, oscilloscope, bench power supply, sound level meter), plus find-the-fault challenges`);
  L.push('');
  L.push('## Guides and articles');
  L.push('');
  const posts = [...(blog as any[])].sort((a, b) => String(b.publishDate).localeCompare(String(a.publishDate)));
  for (const b of posts) L.push(`- [${clean(b.title)}](${ORIGIN}/blog/${b.slug}/): ${clean(b.description)}`);
  L.push('');
  L.push('## Other pages');
  L.push('');
  L.push(`- [About CIE](${ORIGIN}/about/)`);
  L.push(`- [Quality](${ORIGIN}/quality/)`);
  L.push(`- [Frequently asked questions](${ORIGIN}/faq/)`);
  L.push(`- [Industries served](${ORIGIN}/industries/)`);
  L.push('');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
