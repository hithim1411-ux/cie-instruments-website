// Pure comparison helpers shared by the build and the browser. No Node or DOM APIs in here.

export interface Spec { l: string; v: string }
export interface Item {
  id: string; brand: string; model: string; name: string; href: string; img: string; cat: string; specs: Spec[];
}
export interface Row { label: string; re: string }
export interface Group { id: string; label: string; blurb: string; rows: Row[]; items: Item[] }
export interface RowOut { label: string; vals: (string | null)[] }

const cache: Record<string, RegExp> = {};
const rx = (s: string) => cache[s] || (cache[s] = new RegExp(s, 'i'));

/** Line up the chosen items on the group's key rows. Labels not covered by a row go in `more`. */
export function buildRows(rows: Row[], items: Item[]) {
  const consumed: Record<string, 1>[] = items.map(() => ({}));
  const out: RowOut[] = rows.map(r => {
    const re = rx(r.re);
    const vals = items.map((it, k) => {
      const seen: string[] = [];
      it.specs.forEach(s => { if (re.test(s.l)) { consumed[k][s.l] = 1; if (seen.indexOf(s.v) < 0) seen.push(s.v); } });
      return seen.length ? seen.join(' · ') : null;
    });
    return { label: r.label, vals };
  }).filter(r => r.vals.some(v => v !== null));
  const seen: Record<string, 1> = {}, extra: string[] = [];
  items.forEach((it, k) => it.specs.forEach(s => { if (!consumed[k][s.l] && !seen[s.l]) { seen[s.l] = 1; extra.push(s.l); } }));
  const more: RowOut[] = extra.map(l => ({ label: l, vals: items.map(it => { const m = it.specs.filter(s => s.l === l)[0]; return m ? m.v : null; }) }));
  return { rows: out, more };
}

const norm = (v: string) => v.toLowerCase().replace(/\s+/g, ' ').trim();
export function rowDiffers(vals: (string | null)[]): boolean {
  const p = vals.filter((v): v is string => v !== null);
  return p.length !== vals.length || p.some(v => norm(v) !== norm(p[0]));
}
