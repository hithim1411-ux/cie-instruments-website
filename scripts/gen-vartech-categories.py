"""Generates the authorised-dealership pages, categories.json entries and registry edits for the new Vartech
categories (soldering stations, re-work, irons, magnifiers, spares). Templated from the lux-meters pages.
Idempotent: skips anything already present."""
import json, re, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P = lambda *a: os.path.join(ROOT, *a)
def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)

TAIL = ("CIE Instruments (Cambridge Instruments &amp; Engg. Co., Howrah) is an authorised Vartech distributor for India. "
        "We supply Vartech instruments and tools to electronics labs, service workshops, production lines, colleges and R&amp;D teams across India - "
        "including Kolkata, Howrah, Bhubaneswar, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Ahmedabad, Pune, Lucknow and Chandigarh.")
CATS = {
 'soldering-stations': dict(
    name='Soldering & De-Soldering Stations', short='Soldering Stations', icon='wrench', emoji='🔧',
    card='Digital and lead-free soldering stations (60–90 W) and 2-in-1 vacuum de-soldering stations.',
    intro='CIE Instruments supplies the Vartech soldering and de-soldering station range - the 936 A and 936 AD, the ceramic-heater 937 ESD, the lead-free 236 ESD and 202 D, and the 722 and 201 B de-soldering stations - for electronics assembly, repair and production work.',
    desc='Buy Vartech soldering and de-soldering stations in India - 936 A, 936 AD, 937 ESD, 236 ESD, 202 D, 722 and 201 B. CIE Instruments is an authorised Vartech distributor supplying workshops, labs and production lines across India from Howrah.',
    about=['The Vartech 936 A is the long-running 60 W (unit) station with a 200 ºC to 480 ºC range, while the 936 AD adds a digital display, a 70 W heater, 100 ºC to 480 ºC control, three memory channels and password lock. The 937 ESD uses an industrial-grade ceramic heating element with ± 1 ºC stability.',
           'For lead-free work, the 236 ESD (90 W, 80 ºC to 480 ºC) and the 202 D (80 W, electromagnetic heating, 80 ºC to 480 ºC) are digital stations built for the higher temperatures lead-free solder needs. The 722 combines a lead-free soldering iron and a de-soldering gun with a built-in vacuum pump in one unit; the 201 B is the de-soldering-only version.',
           'Tips, heating elements and other spares for these stations are listed under Vartech Soldering Spares & Accessories.']),
 'rework-stations': dict(
    name='SMD Re-Work Systems & Tools', short='SMD Re-Work', icon='wind', emoji='🔥',
    card='Hot-air SMD re-work stations, 2-in-1 systems, BGA fixture and pre-heater, hot tweezer and fume extractor.',
    intro='CIE Instruments supplies the Vartech SMD re-work range - the 850 A, 850 D, 857 D and 861 DW hot-air stations, the 700 ESD and 706 2-in-1 systems, the 800 L and 853 ESD BGA tools, the 989 hot tweezer and the 493 ESD fume extractor.',
    desc='Buy Vartech SMD re-work stations in India - 850 A, 850 D, 857 D, 861 DW, 700 ESD, 706, 989 hot tweezer, BGA tools and 493 ESD smoke absorber. CIE Instruments, authorised Vartech distributor, Howrah.',
    about=['The hot-air stations scale from the 270 W 850 A and 320 W digital 850 D, through the 580 W 857 D, up to the 1000 W lead-free 861 DW with three programmable channels for temperature and air flow. The 700 ESD and 706 combine a hot-air re-work section with a classic 50 W soldering iron in one unit, with separate on/off switches.',
           'For BGA work, the 800 L fixture holds the PCB while an 850-series station is connected at the top and the 853 ESD pre-heater sits underneath. The 989 hot tweezer is an attachment for the 937 station, and the 493 ESD removes solder fumes at the bench.',
           'Heating elements and other spares for these stations are listed under Vartech Soldering Spares & Accessories.']),
 'soldering-irons': dict(
    name='Soldering Irons', short='Soldering Irons', icon='zap', emoji='⚡',
    card='Nichrome soldering irons from 25 W to 100 W and a slim 25 W ceramic-heater iron, 230 V.',
    intro='CIE Instruments supplies Vartech soldering irons from 25 W to 100 W, plus the slim SI-25WS with a long-life ceramic heating element - for general electronics, electrical and assembly work.',
    desc='Buy Vartech soldering irons in India - SI-25W, 30W, 50W, 60W, 80W, 100W and the slim SI-25WS ceramic heater iron, 230 V. CIE Instruments is an authorised Vartech distributor, Howrah.',
    about=['The Vartech SI series covers 25 W, 30 W, 50 W, 60 W, 80 W and 100 W irons with a high-reliability nichrome heater, for 230 V supply with a 2-pin plug. Various types of tips and bits are available separately.',
           'The SI-25WS is a slim-body 25 W iron with a long-life ceramic heating element for fine work.']),
 'magnifiers': dict(
    name='Magnifying Lamps', short='Magnifying Lamps', icon='circle-dot', emoji='🔍',
    card='LED and CFL magnifying lamps - table-clamp and desk-top, 5 and 8 dioptre, round and rectangular lenses, dimmable models.',
    intro='CIE Instruments supplies the Vartech magnifying lamp range - the 228 series (round and rectangular lenses, table clamp and desk-top, including dimmable models), the 8093 and 8093 LD, and the 268 L - for PCB inspection, rework and fine assembly.',
    desc='Buy Vartech magnifying lamps in India - 228 L, 228 L II, 228 AL, 228 BL, 228 LX, 228 LXD, 228 LRD, 228 BLR, 8093, 8093 LED, 8093 LD and 268 L. CIE Instruments, authorised Vartech distributor, Howrah.',
    about=['The 228 series uses a 125 mm round crystal lens (5 or 8 dioptre on the 228 L and 228 L II), with table-clamp arms or a heavy desk-top base. The 228 LX and 228 LXD have a 7 inch lens, and the 228 LRD and 228 BLR use a large 7.5 x 6.2 inch rectangular lens; the LXD and LRD are dimmable with warm and cool white light.',
           'The 8093 family and the 268 L are lighter table-top lamps with a 3 dioptre main lens and a built-in 12 dioptre small lens, available with LED or CFL lighting; the 8093 LD adds a touch dimmer.']),
 'soldering-accessories': dict(
    name='Soldering Spares & Accessories', short='Soldering Spares', icon='settings', emoji='🧰',
    card='Soldering bits, heating elements, barrels, nuts, iron assembly, tip thermometer, soldering tester and power supply cables.',
    intro='CIE Instruments supplies original Vartech spares and accessories for its soldering and re-work stations - soldering bits, heating elements, barrels, nuts, the 907A iron assembly, the 191 AD tip thermometer and 192 soldering tester, and power supply cables.',
    desc='Buy Vartech soldering bits, heating elements, barrels, 907A iron assembly, 191 AD tip thermometer and 192 soldering tester in India. CIE Instruments is an authorised Vartech distributor, Howrah.',
    about=['Soldering bits (tips) are available in pointed, pencil, bent, chisel, spade and knife types for the 936 A, 937, 236, 706 and 700 stations. Heating elements, barrels, nuts and a complete 907A iron assembly are listed against the station models they fit.',
           'The 191 AD thermometer and the 192 multifunction soldering tester measure soldering tip temperature, leakage voltage and ground resistance to check that a station is working correctly.']),
}

def page(slug, c, kind):
    src = rd(P('src/pages/authorised-dealership/lux-meters', 'index.astro' if kind == 'index' else '[product].astro'))
    full = f"Vartech {c['name']}"
    src = src.replace('vartech-lux-meters.json', f'vartech-{slug}.json').replace('lux-meters', slug)
    src = src.replace('Vartech Digital Lux Meters', full).replace('Vartech® Digital Lux Meters', f"Vartech® {c['name']}")
    src = src.replace('All Vartech Lux Meters', f"All {full}")
    if kind == 'index':
        src = re.sub(r"const pageTitle = '.*?';", f"const pageTitle = '{full} - Authorised Distributor India | CIE Instruments';", src)
        src = re.sub(r"const pageDesc =\s*'.*?';", "const pageDesc =\n  " + json.dumps(c['desc'], ensure_ascii=False).replace('"', "'", 1)[:-1] + "';", src, flags=re.S)
        src = re.sub(r'(<p class="mt-3 text-muted max-w-2xl leading-relaxed">\s*).*?(\s*</p>)', lambda m: m.group(1) + c['intro'] + m.group(2), src, count=1, flags=re.S)
        src = re.sub(r"\{products\.length\} Vartech lux meter model\{products\.length !== 1 \? 's' : ''\}", "{products.length} Vartech product{products.length !== 1 ? 's' : ''}", src)
        paras = c['about'] + [TAIL, 'For pricing and availability, <a href="/contact/" class="text-ink hover:underline font-medium">contact our team</a> or enquire via WhatsApp.']
        body = '\n'.join(f'        <p>\n          {t}\n        </p>' for t in paras)
        src = re.sub(r'(<div class="space-y-4 text-sm text-muted leading-relaxed">\n).*?(\n      </div>\n      <div class="mt-8 pt-6)', lambda m: m.group(1) + body + m.group(2), src, flags=re.S)
        # optional catalogue button on cards
        src = re.sub(r'(\s*)<a href=\{downloadUrl\(`/downloads/vartech/' + slug + r'/\$\{p\.catalogue\}`\)\}(.*?)</a>', lambda m: f"{m.group(1)}{{p.catalogue && (<a href={{downloadUrl(`/downloads/vartech/{slug}/${{p.catalogue}}`)}}{m.group(2)}</a>)}}", src, count=1, flags=re.S)
    else:
        src = re.sub(r'(\s*)<a href=\{downloadUrl\(`/downloads/vartech/' + slug + r'/\$\{product\.catalogue\}`\)\}(.*?)</a>', lambda m: f"{m.group(1)}{{product.catalogue && (<a href={{downloadUrl(`/downloads/vartech/{slug}/${{product.catalogue}}`)}}{m.group(2)}</a>)}}", src, count=1, flags=re.S)
        src = re.sub(r'\n\s*<div class="flex justify-center"><CompareAddButton[^\n]*</div>', '', src)
        src = src.replace("import CompareAddButton from '../../../components/CompareAddButton.astro';\n", '')
        src = src.replace('Specifications sourced from the official Vartech product catalogue. Download above for the full datasheet.', "{product.catalogue ? 'Specifications sourced from the official Vartech product catalogue. Download above for the full datasheet.' : 'Specifications as published by Vartech. Contact us for the full datasheet.'}")
    return src

reg = {}
for slug, c in CATS.items():
    d = P('src/pages/authorised-dealership', slug)
    os.makedirs(d, exist_ok=True)
    wr(f'{d}/index.astro', page(slug, c, 'index'))
    wr(f'{d}/[product].astro', page(slug, c, 'product'))

# ---- categories.json
cj = P('src/data/categories.json'); cats = json.load(open(cj))
have = {x['id'] for x in cats}
for slug, c in CATS.items():
    cid = f'vartech-{slug}'
    if cid in have: continue
    data = json.load(open(P(f'src/data/vartech-{slug}.json')))
    cats.append({'id': cid, 'brand': 'vartech', 'name': c['name'], 'shortName': c['short'], 'eyebrow': f"Vartech® · {c['name']}",
                 'description': c['card'], 'icon': c['emoji'], 'metaTitle': f"Vartech {c['name']} | CIE Instruments, India", 'metaDesc': c['desc'],
                 'seoContent': [re.sub(r'&amp;', '&', t) for t in c['about'][:2]], 'relatedArticles': []})
json.dump(cats, open(cj, 'w'), indent=2, ensure_ascii=False)

# ---- registries
def camel(slug): return 'vartech' + ''.join(w.title() for w in slug.split('-'))
def patch(path, edits):
    s = rd(P(path)); o = s
    for a, b in edits:
        if b.strip() in s: continue
        assert a in s, (path, a)
        s = s.replace(a, a + b if not b.startswith('<<') else b[2:] + a, 1)
    if s != o: wr(P(path), s)

new = list(CATS)
imp = lambda rel, slug: f"import {camel(slug)} from '{rel}data/vartech-{slug}.json';\n"
# products/[category]/index.astro
patch('src/pages/products/[category]/index.astro', [
  ("import vartechDcPowerSupplies from '../../../data/vartech-dc-power-supplies.json';\n", ''.join(imp('../../../', s) for s in new)),
  ("  'vartech-dc-power-supplies':   vartechDcPowerSupplies,\n", ''.join(f"  'vartech-{s}': {camel(s)},\n" for s in new))])
# EnquiryForm
patch('src/components/EnquiryForm.astro', [
  ("import vartechThermometers from '../data/vartech-thermometers.json';\n", ''.join(imp('../', s) for s in new)),
  ("  'vartech-thermometers':         vartechThermometers.map(p => ({ id: p.id, model: p.model, name: p.name })),\n", ''.join(f"  'vartech-{s}': {camel(s)}.map(p => ({{ id: p.id, model: p.model, name: p.name }})),\n" for s in new))])
# icons
patch('src/utils/categoryIcons.ts', [("  'vartech-thermometers': 'thermometer',\n", ''.join(f"  'vartech-{s}': '{CATS[s]['icon']}',\n" for s in new))])
# searchData + api/search
patch('src/utils/searchData.ts', [
  ("import vTHM  from '../data/vartech-thermometers.json';\n", ''.join(imp('../', s).replace(f'import {camel(s)} ', f'import {camel(s)} ') for s in new)),
  ("  { slug: 'thermometers',       label: 'Thermometers',         items: vTHM },\n", ''.join(f"  {{ slug: '{s}', label: '{CATS[s]['short']}', items: {camel(s)} }},\n" for s in new))])
patch('src/pages/api/search.ts', [
  ("import vTHM from '../../data/vartech-thermometers.json';\n", ''.join(imp('../../', s) for s in new)),
  ("  { label: 'Thermometers', slug: 'thermometers', items: vTHM },\n", ''.join(f"  {{ label: '{CATS[s]['short']}', slug: '{s}', items: {camel(s)} }},\n" for s in new))])
# products/index.astro
cards = ''.join(f"""  {{
    label: '{CATS[s]['short']}',
    href: u('/authorised-dealership/{s}/'),
    iconId: 'vartech-{s}',
    count: {camel(s)}.length,
    description: '{CATS[s]['card']}',
  }},
""" for s in new)
s = rd(P('src/pages/products/index.astro'))
if camel('magnifiers') not in s:
    s = s.replace("import vartechLuxMeters from '../../data/vartech-lux-meters.json';\n", "import vartechLuxMeters from '../../data/vartech-lux-meters.json';\n" + ''.join(imp('../../', x) for x in new), 1)
    i = s.index("    description: 'Linear, SMPS and programmable DC supplies - 30 V to 200 V, up to 40 A, with PC interface.',\n  },\n") + len("    description: 'Linear, SMPS and programmable DC supplies - 30 V to 200 V, up to 40 A, with PC interface.',\n  },\n")
    s = s[:i] + cards + s[i:]
    s = s.replace("vartechDcPowerSupplies.length;", "vartechDcPowerSupplies.length" + ''.join(f" + {camel(x)}.length" for x in new) + ";", 1)
    wr(P('src/pages/products/index.astro'), s)
# authorised-dealership/index.astro
s = rd(P('src/pages/authorised-dealership/index.astro'))
if 'magnifiers' not in s.split('const pageTitle')[0]:
    s = s.replace("import dcPowerSupplies from '../../data/vartech-dc-power-supplies.json';\n", "import dcPowerSupplies from '../../data/vartech-dc-power-supplies.json';\n" + ''.join(imp('../../', x) for x in new), 1)
    marker = "    description: 'Linear, SMPS and programmable DC regulated power supplies - 30 V to 200 V, up to 40 A, with PC interface.',\n  },\n"
    assert marker in s
    s = s.replace(marker, marker + cards, 1)
    s = s.replace("calibrators, thermometers and sound level meters. Expert", "calibrators, thermometers, sound level meters, soldering and de-soldering stations, SMD re-work systems, soldering irons, magnifying lamps and soldering spares. Expert", 1)
    wr(P('src/pages/authorised-dealership/index.astro'), s)
print('done')
