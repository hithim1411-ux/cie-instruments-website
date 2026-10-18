// Pure comparison logic shared by the build (product-page widget) and the browser (/compare/).
// No Node or DOM APIs in here.

export interface Spec { l: string; v: string }
export interface Item {
  id: string; brand: string; model: string; name: string; href: string; img: string; cat: string; specs: Spec[];
}
export type NumKind = 'mm' | 'hz' | 'counts';
export interface Row { label: string; re: string; num?: NumKind }
export interface Need {
  id: string; label: string;
  l?: string;            // regex tested on the spec label
  v?: string;            // regex tested on the spec value
  or?: boolean;          // label OR value match (default: both must match when both given)
  num?: { kind: NumKind; min: number };
}
export interface Group { id: string; label: string; blurb: string; rows: Row[]; needs: Need[]; items: Item[] }

const NEG = /^\s*(not available|not supported|not applicable|no\b|n\/a|none|-+\s*$)/i;
const cache: Record<string, RegExp> = {};
const rx = (s: string) => cache[s] || (cache[s] = new RegExp(s, 'i'));

export function parseNum(kind: NumKind, text: string): number | null {
  if (kind === 'mm') { const m = /([\d.]+)\s*mm/i.exec(text); return m ? parseFloat(m[1]) : null; }
  if (kind === 'counts') { const m = /([\d,]+)\s*counts/i.exec(text); return m ? parseFloat(m[1].replace(/,/g, '')) : null; }
  let best: number | null = null;
  const re = /([\d.]+)\s*(G|M|k)?\s*Hz/gi; let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const u = (m[2] || '').toLowerCase();
    const n = parseFloat(m[1]) * (u === 'g' ? 1e9 : u === 'm' ? 1e6 : u === 'k' ? 1e3 : 1);
    if (best === null || n > best) best = n;
  }
  return best;
}

/** Does this item list the capability described by the need? */
export function hasNeed(item: Item, n: Need): boolean {
  const lre = n.l ? rx(n.l) : null, vre = n.v ? rx(n.v) : null;
  return item.specs.some(s => {
    if (NEG.test(s.v)) return false;
    if (n.num) {
      if (lre && !lre.test(s.l)) return false;
      const x = parseNum(n.num.kind, s.v);
      return x !== null && x >= n.num.min;
    }
    if (lre && vre) return n.or ? (lre.test(s.l) || vre.test(s.v)) : (lre.test(s.l) && vre.test(s.v));
    if (lre) return lre.test(s.l);
    if (vre) return vre.test(s.v);
    return false;
  });
}

export interface RowOut { label: string; vals: (string | null)[]; num?: NumKind }

export function buildRows(rows: Row[], items: Item[]) {
  const consumed: Record<string, 1>[] = items.map(() => ({}));
  const out: RowOut[] = rows.map(r => {
    const re = rx(r.re);
    const vals = items.map((it, k) => {
      const seen: string[] = [];
      it.specs.forEach(s => { if (re.test(s.l)) { consumed[k][s.l] = 1; if (seen.indexOf(s.v) < 0) seen.push(s.v); } });
      return seen.length ? seen.join(' · ') : null;
    });
    return { label: r.label, vals, num: r.num };
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

/** Index of the item with the highest listed number for a numeric row, or -1 on a tie / no data. */
export function leaderIndex(row: RowOut): number {
  if (!row.num) return -1;
  const nums = row.vals.map(v => (v === null ? null : parseNum(row.num as NumKind, v)));
  const have = nums.filter((n): n is number => n !== null);
  if (have.length < 2) return -1;
  const max = Math.max(...have);
  if (have.filter(n => n === max).length > 1) return -1;
  return nums.indexOf(max);
}

const lc = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const join = (a: string[]) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

/** Plain-language observations. Only states what the listed data supports. */
export function insights(group: Pick<Group, 'needs'>, items: Item[], rows: RowOut[]): string[] {
  const out: string[] = [];
  if (items.length < 2) return out;
  const needs = group.needs.filter(n => !n.num); // numeric needs are covered by the 'highest listed' notes
  const m = items.map(it => needs.map(n => hasNeed(it, n)));
  // capabilities listed by only some of the models
  items.forEach((it, i) => {
    const only = needs.filter((_, k) => m[i][k] && items.some((_, j) => j !== i && !m[j][k])).map(n => lc(n.label));
    const exclusive = needs.filter((_, k) => m[i][k] && items.every((_, j) => j === i || !m[j][k])).map(n => lc(n.label));
    if (items.length === 2 && only.length) out.push(`${it.model} lists ${join(only)}; ${items[1 - i].model} does not.`);
    else if (items.length > 2 && exclusive.length) out.push(`Only ${it.model} lists ${join(exclusive)}.`);
  });
  // numeric leaders
  rows.forEach(r => {
    const li = leaderIndex(r);
    if (li < 0 || !r.num) return;
    const others = r.vals.map((v, i) => ({ v, i })).filter(x => x.i !== li && x.v !== null).map(x => `${items[x.i].model}: ${(x.v as string).split(' · ')[0].split(' | ')[0].slice(0, 28)}`);
    out.push(`${items[li].model} lists the highest ${lc(r.label)} (${(r.vals[li] as string).split(' · ')[0].split(' | ')[0].slice(0, 28)}; ${others.join(', ')}).`);
  });
  const diff = rows.filter(r => rowDiffers(r.vals)).length;
  if (rows.length) out.push(`They differ on ${diff} of ${rows.length} key spec rows.`);
  return out.slice(0, 6);
}

/** Rank other items in a group by how comparable they are with `self`. */
export function similar(group: Group, self: Item, n: number): Item[] {
  const re = group.rows.map(r => rx(r.re));
  const cover = (it: Item) => re.map(r => it.specs.some(s => r.test(s.l)));
  const base = cover(self);
  return group.items.filter(i => i.id !== self.id)
    .map(i => { const c = cover(i); return { i, s: c.reduce((a, v, k) => a + (v && base[k] ? 1 : 0), 0) + (i.cat === self.cat ? 3 : 0) + (i.brand !== self.brand ? 0.5 : 0) }; })
    .sort((a, b) => b.s - a.s).slice(0, n).map(x => x.i);
}
