"""Adds the Vartech products that were live on var-tech.com but missing from this site.

Sources (nothing here is invented):
  * catalogue PDFs  : ~/Documents/Vartech/...  (features + specification tables parsed from the PDF text)
  * var-tech.com    : cie-store/scripts/_src/vartech-products.json (product text only, promo lines stripped)
  * photos          : ~/Documents/Vartech Pics where we have one, else the var-tech.com photo
Writes src/data/vartech-<category>.json (new categories) or appends to the existing file, copies images into
public/images/vartech/<category>/ and PDFs into ../cie-downloads/vartech/<category>/ (that repo hosts the PDFs).
Re-runnable: entries already present (same id) are left alone.
"""
import json, os, re, html, shutil, subprocess, sys
import numpy as np
from PIL import Image

HOME = os.path.expanduser('~')
VT = f'{HOME}/Documents/Vartech'
PICS = f'{HOME}/Documents/Vartech Pics'
ET = f'{VT}/Electronic Tools'
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DL = os.path.abspath(f'{SITE}/../cie-downloads/vartech')
STORE_SRC = os.path.abspath(f'{SITE}/../cie-store/scripts/_src')
DATA = f'{SITE}/src/data'
IMG = f'{SITE}/public/images/vartech'

shop = {p['title'].strip(): p for p in json.load(open(f'{STORE_SRC}/vartech-products.json'))['products']}
def shop_item(prefix):
    hits = [t for t in shop if t.lower().startswith(prefix.lower())]
    assert len(hits) >= 1, prefix
    return shop[sorted(hits, key=len)[0]]

# ----------------------------------------------------------------------------- catalogue PDF parser
NOISE = re.compile(r'^(v|www\.var-tech\.com|\* All Specifications.*)$', re.I)
def pdf_text(path):
    return subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
def parse_pdf(path):
    lines = [re.sub(r'\s+v\s*$', '', l.rstrip()).strip() for l in pdf_text(path).splitlines()]
    lines = [l for l in lines if l and not NOISE.match(l)]
    feats, specs, mode = [], [], None
    for l in lines:
        if re.match(r'^Features\b', l, re.I): mode = 'f'; continue
        if re.match(r'^Specifications?\s*:?\s*$', l, re.I): mode = 's'; continue
        if mode == 'f':
            if l.startswith('•'): feats.append(l.lstrip('• ').strip())
            elif feats: feats[-1] = (feats[-1] + ' ' + l).strip()
        elif mode == 's':
            m = re.match(r'^(.{2,40}?)\s{2,}:?\s*(.+)$', l) or re.match(r'^(.{2,40}?)\s*:\s+(.+)$', l)
            if m: specs.append((m.group(1).strip(' :'), m.group(2).strip()))
            elif specs: specs[-1] = (specs[-1][0], (specs[-1][1] + ' ' + l).strip())
    out = []
    for k, v in specs:
        m = re.search(r'\s+(Station has .*)$', v)
        if m:
            out.append((k, v[:m.start()].strip())); out.append(('Supplied as standard', m.group(1)[len('Station has '):].rstrip('.')))
        else: out.append((k, v))
    return feats, out

def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
PROMO = re.compile(r'(Click here|Buy \d+ units|extra discount|Variants?\s*:|New Product\s*:|Accessory\s*-|watch the product demo|Order different)', re.I)
def shop_text(body):
    body = re.sub(r'<(br|/li|/p|/div)[^>]*>', '\n', body)
    txt = html.unescape(re.sub(r'<[^>]+>', '', body))
    out = []
    for l in (re.sub(r'\s+', ' ', x).strip() for x in txt.split('\n')):
        if len(l) < 8 or PROMO.search(l): continue
        l = re.sub(r'\bV A R TECH\b', 'Vartech', l)
        if l not in out: out.append(l)
    return out

# ----------------------------------------------------------------------------- photos
def normalise(src, dst, S=990, box=800):
    im = Image.open(src).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    a = np.asarray(bg.convert('RGB')).astype(np.float32)
    corners = np.concatenate([a[:6, :6].reshape(-1, 3), a[:6, -6:].reshape(-1, 3), a[-6:, :6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
    c = np.clip(np.median(corners, axis=0), 200, 255)
    a = np.clip(a * (255.0 / c), 0, 255)
    import cv2
    m = ((255 - a.min(axis=2)) > 14).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)    # ignore specks smaller than the product
    keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= 120]
    m = np.isin(lab, keep) if keep else m.astype(bool)
    ys, xs = np.where(m)
    if len(ys):
        crop = Image.fromarray(a.astype(np.uint8)).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    else:
        crop = Image.fromarray(a.astype(np.uint8))
    k = min(box / crop.width, box / crop.height)
    crop = crop.resize((max(1, round(crop.width * k)), max(1, round(crop.height * k))), Image.LANCZOS)
    out = Image.new('RGB', (S, S), (255, 255, 255)); out.paste(crop, ((S - crop.width) // 2, (S - crop.height) // 2))
    out.save(dst, 'WEBP', quality=84, method=6)

# Photos: var-tech.com's product photos, with the watermark removed by scripts/clean-vartech-photos.py (the five heating-element
# shots). Marketing graphics that are not photos (tip charts, spec posters, diagrams) are skipped.
SKIP_PHOTO = ('si-25ws-3.jpg', 'model-800-l', 'soldering-station-model-236-esd-2.jpg', 'digital-clamp-multimeter-model-v-2266-2.jpg',
              'digital-clamp-multimeter-model-v-2266-3.jpg', 'bga-re-work-system-fixture-large-model-800-l-1.jpg')
def shop_photos(p, n=4):
    out = []
    for i in range(len(p['images'][:n])):
        name = f"{p['handle'][:60]}-{i}.jpg"
        if p['title'].startswith('Soldering station bit') and i >= 2: continue
        if name in SKIP_PHOTO or name.endswith('800-l-1.jpg') and 'bga' in name: continue
        f = f'{STORE_SRC}/vartech-img-clean/{name}'
        if not os.path.exists(f): f = f'{STORE_SRC}/vartech-img/{name}'
        if os.path.exists(f) and os.path.getsize(f) > 2000: out.append(f)
    return out

# ----------------------------------------------------------------------------- entries
# (shop title prefix, category slug, id, model, name, catalogue PDF (src, dest name) | None, extra)
def ET_(p): return f'{ET}/{p}'
E = []
def add(prefix, cat, id_, model, name, pdf=None, **kw): E.append(dict(prefix=prefix, cat=cat, id=id_, model=model, name=name, pdf=pdf, **kw))

# --- existing categories
add('20005 SR', 'dc-power-supplies', '20005-sr', '20005 SR', '200 V 5 A SMPS DC Regulated Power Supply with PC Interface',
    specs=[('Output', '0–200 V, 0–5 A'), ('Type', 'SMPS based, single output, CV/CC'), ('Display', '4-digit LED displays for voltage and current'), ('Pre-setting', 'Voltage and current, with output ON/OFF switch'), ('Protections', 'Over voltage, over current, over temperature and over power'), ('Interface', 'P.C. interface (RS232)')])
add('15003 S ', 'dc-power-supplies', '15003-s', '15003 S', '150 V 3 A SMPS DC Regulated Power Supply', pdf=('SERIES', 'high-power-smps.pdf'),
    specs=[('Output', '0–150 V, 0–3 A'), ('Type', 'SMPS based, single output, CV/CC'), ('Display', '4-digit LED displays'), ('Protections', 'Over voltage, over current, over temperature and over power')])
add('SS-5100 DS4', 'oscilloscopes', 'ss-5100ds4', 'SS-5100DS4', '100 MHz 4-Channel Digital Storage Oscilloscope',
    specs=[('Bandwidth', '100 MHz'), ('Channels', '4'), ('Vertical sensitivity', '500 µV – 10 V / Div.'), ('Sampling rate', '1 GS/s'), ('Display', '7" TFT'), ('Interface', 'USB'), ('Probes', 'Included')])
add('SPA-10M', 'function-generators', 'spa-10m', 'SPA-10M', 'Power Amplifier Module for Signal Generators, 10 MHz',
    specs=[('Frequency', '10 MHz'), ('Output', '25 V p-p, 0.5 A'), ('Channels', '2 (5 W × 2 max.)')])
add('SPA-100K', 'function-generators', 'spa-100k', 'SPA-100K', 'Power Amplifier Module for Signal Generators, 100 kHz',
    specs=[('Frequency', '100 kHz'), ('Output', '40 V p-p, 1 A'), ('Channels', '2 (10 W × 2 max.)')])
add('V M 890 G', 'multimeters', 'v-m-890-g', 'V M 890 G', 'Digital Multimeter 1000 V DC / 750 V AC, 20 A',
    specs=[('Display', '3½ digits'), ('Ranging', 'Manual, with auto power off'), ('Voltage', '1000 V DC / 750 V AC'), ('Current', '20 A AC/DC'), ('Resistance', 'Up to 20 MΩ'), ('Tests', 'Continuity, diode, transistor (hFE), capacitance, frequency, temperature'), ('Supplied with', 'Holster')])
add('7070 +', 'multimeters', '7070-plus', '7070+', 'Analog (Dial) Multimeter',
    specs=[('Type', 'Analog (dial)'), ('Voltage', '600 V DC / AC'), ('Current', '10 A AC/DC'), ('Resistance', '0 ~ 20 MΩ'), ('Tests', 'Continuity, capacitance, frequency and temperature'), ('Other', 'Reverse polarity indication')])
add('V 2101+', 'clamp-meters', 'v-2101-plus', 'V 2101+', 'True RMS Digital Clamp Multimeter, 1000 A AC/DC, 2000 V',
    specs=[('Display', '3⅚ digits (6000 counts) HD display with backlight'), ('Current', '60 A / 600 A / 1000 A AC/DC'), ('Voltage', 'Up to 2000 V AC/DC, auto-ranging'), ('Ranging', 'True RMS, auto-ranging'), ('Other measurements', 'Capacitance, frequency, temperature, in-rush current'), ('Detection', 'NCV (non-contact voltage)'), ('Note', 'Also referred to as a solar clamp meter')])
add('V 2266', 'clamp-meters', 'v-2266', 'V 2266', 'True RMS Auto-Ranging Digital Clamp Multimeter, 1000 A AC',
    specs=[('Display', '6000 counts, HD display with backlight'), ('Current', '6 / 60 / 600 / 1000 A AC'), ('Voltage', '1000 / 750 V DC / AC, with Low-Z ACV'), ('Resistance', 'Up to 60 MΩ'), ('Ranging', 'True RMS, auto-ranging'), ('Tests', 'Continuity, diode, live wire, NCV'), ('Jaw opening', '40 mm'), ('Other', 'Data hold, Min/Max, auto power off, torch, carrying pouch')])
add('7150', 'clamp-meters', '7150', '7150', 'Pocket Analog Clamp Meter',
    specs=[('Type', 'Analog, pocket size'), ('AC voltage', '500 V'), ('AC current', '5 / 25 / 50 A'), ('Power', 'No batteries needed'), ('Dimensions', '139 × 52 × 35 mm')])

# --- soldering & de-soldering stations
for pre, id_, model, name, pdf in [
    ('936 A Soldering', '936-a', '936 A', 'Soldering Station, 60 W, 200–480 °C', '936_A_6f474fc4-ce19-46a3-8c6b-a93f2db6c008.pdf'),
    ('936 AD', '936-ad', '936 AD', 'Digital Soldering Station, 70 W, 3-Channel Memory', '936_AD.pdf'),
    ('937 ESD', '937-esd', '937 ESD', 'Digital Soldering Station, Ceramic Heater', '937_a04dd900-fb71-427e-b4bd-62a91027a324.pdf'),
    ('236 ESD', '236-esd', '236 ESD', 'Lead-Free Soldering Station, 90 W', '236.pdf'),
    ('202 D', '202-d', '202 D', 'Lead-Free Soldering Station, 80 W, Electromagnetic Heating', '202_D.pdf'),
    ('722', '722', '722', '2-in-1 Soldering and De-Soldering Station, Lead-Free', '722_eaa20dd6-ce6d-4415-84d3-188ca9a80a09.pdf'),
    ('201 B', '201-b', '201 B', 'De-Soldering Station', '201_B.pdf')]:
    add(pre, 'soldering-stations', id_, model, name, pdf=(ET_(f'Soldering Stations/{pdf}') if os.path.exists(ET_(f'Soldering Stations/{pdf}')) else ET_(f'De-soldering Stations/{pdf}'), f'{id_}.pdf'))

# --- SMD re-work, hot air, BGA, fume extraction, hot tweezer
RW = 'SMD Re-work Stations & Systems'
add('850 A', 'rework-stations', '850-a', '850 A', 'SMD Re-Work Station, 270 W', pdf=(ET_(f'{RW}/850_A_a64f0306-7b90-4035-8e11-df46adc73b95.pdf'), '850-a.pdf'),
    specs=[('Power', '270 W, 220 V AC, 50 Hz'), ('Air flow', '24 L / Min. (max.)'), ('Temperature range', '100 ºC ~ 420 ºC'), ('Dimensions', '185 × 135 × 245 mm'), ('Weight', 'Approx. 4 Kg'), ('Supplied as standard', '3 nozzles')])
add('850 D', 'rework-stations', '850-d', '850 D', 'Digital SMD Re-Work Station, 320 W', pdf=(ET_(f'{RW}/850_D_d3cefe7d-d788-4a1d-b6e6-7a0c456a74dc.pdf'), '850-d.pdf'),
    specs=[('Power', '320 W, 220 V AC, 50 Hz'), ('Air flow', '24 L / Min. (max.)'), ('Pump', 'Diaphragm type, low noise'), ('Temperature range', '100 ºC ~ 480 ºC'), ('Dimensions', '187 × 135 × 245 mm'), ('Weight', 'Approx. 4 Kg'), ('Supplied as standard', '3 nozzles')])
add('857 D', 'rework-stations', '857-d', '857 D', 'Digital SMD Re-Work Station, 580 W', pdf=(ET_(f'{RW}/857_D_33bcaeb9-3447-45a9-8cb2-a671390ebb2c.pdf'), '857-d.pdf'),
    specs=[('Power', '580 W'), ('Temperature range', '100 ºC ~ 450 ºC'), ('Air flow', '100 L / Min. (max.)'), ('Noise', '< 78 dB'), ('Dimensions', '17 × 10.5 × 24 cm'), ('Weight', '2.5 Kg')])
add('861 DW', 'rework-stations', '861-dw', '861 DW', 'Lead-Free SMD Re-Work Station, 1000 W', pdf=(ET_(f'{RW}/861_DW_25bb153b-0dc1-4ef4-871e-57c5f5afd032.pdf'), '861-dw.pdf'),
    specs=[('Power', '1000 W'), ('Temperature range', '100 ºC ~ 500 ºC'), ('Airflow range', '1 ~ 120 L/min'), ('Channels', 'Three programmable channels (CH1, CH2, CH3)'), ('Dimensions', '188 (L) × 245 (D) × 135 (H) mm'), ('Weight', 'Approx. 4 Kg')])
add('700 ESD', 'rework-stations', '700-esd', '700 ESD', '2-in-1 Soldering and SMD Re-Work Station, 270 W + 50 W', pdf=(ET_(f'{RW}/700_b8b66e4a-5162-424f-8c0f-ba101674a334.pdf'), '700-esd.pdf'),
    specs=[('SMD re-work section', '270 W; air flow 24 L / Min. (max.); 100 ºC ~ 420 ºC'), ('Soldering section', '50 W; 200 ºC ~ 480 ºC; stability ± 2 ºC'), ('Operation', '220 V AC, 50 Hz'), ('Dimensions', '225 × 165 × 145 mm'), ('Weight', 'Approx. 5 Kg'), ('Supplied as standard', '3 nozzles and 1 pointed tip')])
add('706 Soldering', 'rework-stations', '706', '706', '2-in-1 Soldering and SMD Re-Work Station, 580 W + 50 W', pdf=(ET_(f'{RW}/706.pdf'), '706.pdf'),
    specs=[('SMD re-work section', '580 W; air flow 50 L / Min. (max.); 100 ºC ~ 450 ºC; soft air rotary pump; LED digital display (1 ºC resolution)'), ('Soldering section', '50 W; 200 ºC ~ 480 ºC; stability ± 2 ºC; tip to ground resistance 2 Ω, potential 2 mV'), ('Operation', '220 V AC, 50 Hz'), ('Dimensions', '160 × 200 × 150 mm'), ('Weight', 'Approx. 3 Kg'), ('Supplied as standard', '3 nozzles and 1 pointed tip')])
add('493 ESD', 'rework-stations', '493-esd', '493 ESD', 'Smoke Absorber / Solder Fume Extractor', pdf=(ET_(f'{RW}/493_Smoke_absorber.pdf'), '493-esd.pdf'))
add('989', 'rework-stations', '989', '989', 'SMD Hot Tweezer for Soldering Station 937', pdf=(ET_('SMD Hot Tweezers/989.pdf'), '989.pdf'))
add('800 L', 'rework-stations', '800-l', '800 L', 'BGA Re-Work System Fixture (Large)',
    features=['Holds PCBs for BGA re-work', '850 series SMD re-work stations connect at the top and the 853 pre-heater sits below the PCB', 'Vacuum pickup Model 381 A can pick up and hold components', 'Smaller Model 800 S also available for small PCBs'],
    specs=[('Outer dimensions', '350 × 250 mm (approx.)'), ('Height', '365 mm (adjustable)'), ('Fixture dimension', '400 × 300 × 117 mm'), ('PCB usable (max.)', '305 mm × open side')])
add('853 ESD', 'rework-stations', '853-esd', '853 ESD', 'Pre-Heater for BGA Re-Work System, Temperature Controlled',
    features=['Rapid heating: only 10 s to reach 250 ℃', 'Built-in temperature sensor for stable output temperature', 'Cool or hot air selectable to pre-heat or cool chips', 'Works with re-work stations to process BGA and other flat ICs'],
    specs=[('Power', '460 W'), ('Temperature range', '120 ℃ ~ 250 ℃'), ('Heat-up', '10 s to reach 250 ℃'), ('Pre-heat / cool', 'Cool or hot air selectable')])

# --- soldering irons
for pre, id_, model, w in [('SI 100W', 'si-100w', 'SI-100W', 100), ('SI 80W', 'si-80w', 'SI-80W', 80), ('SI 60W', 'si-60w', 'SI-60W', 60), ('SI 50W', 'si-50w', 'SI-50W', 50), ('SI 30W', 'si-30w', 'SI-30W', 30), ('SI 25W Soldering', 'si-25w', 'SI-25W', 25)]:
    add(pre, 'soldering-irons', id_, model, f'{w} W Soldering Iron',
        specs=[('Power', f'{w} W'), ('Supply', '230 V, 2 pin'), ('Heater', 'High reliability nichrome heater'), ('Tips', 'Various types of tips / bits available')])
add('SI 25W S Slim', 'soldering-irons', 'si-25ws', 'SI-25WS', '25 W Slim Soldering Iron, Ceramic Heater',
    specs=[('Power', '25 W'), ('Supply', '230 V, 2 pin'), ('Heater', 'Long-life ceramic heating element'), ('Body', 'Slim type'), ('Tips', 'Various types of tips / bits available')])

# --- magnifying lamps
MG = 'Magnifiers'
add('228 LXD', 'magnifiers', '228-lxd', '228 LXD', 'Dimmable LED Magnifying Lamp, 7" Round Lens, Table Clamp', pdf=(ET_(f'{MG}/228_LXD.pdf'), '228-lxd.pdf'))
add('228 LX', 'magnifiers', '228-lx', '228 LX', 'LED Magnifying Lamp, 7" Large Lens, Table Clamp', pdf=(ET_(f'{MG}/228_LX.pdf'), '228-lx.pdf'))
add('228 LRD', 'magnifiers', '228-lrd', '228 LRD', 'Dimmable LED Magnifying Lamp, Rectangular Lens, Table Clamp', pdf=(ET_(f'{MG}/228_LRD.pdf'), '228-lrd.pdf'))
add('228 BLR', 'magnifiers', '228-blr', '228 BLR', 'LED Magnifying Lamp, Rectangular Lens, Table Top', pdf=(ET_(f'{MG}/228_BLR.pdf'), '228-blr.pdf'))
add('228 BL ', 'magnifiers', '228-bl', '228 BL', 'LED Magnifying Lamp, 125 mm Lens, Table Top, Heavy Base', pdf=(ET_(f'{MG}/228_Al_and_228_BL.pdf'), '228-al-and-228-bl.pdf'),
    specs=[('Lens diameter', 'Φ 127 mm'), ('Magnification', '5 Dioptre'), ('Lights', '9 W L.E.D. (56 pcs. S.M.D. L.E.D.s)'), ('Supply voltage', 'AC 220 V, 50 Hz'), ('Weight', 'About 6 Kg')])
add('228 AL', 'magnifiers', '228-al', '228 AL', 'LED Magnifying Lamp, 125 mm Lens, Desk Top, Vertical Rod', pdf=(ET_(f'{MG}/228_Al_and_228_BL.pdf'), '228-al-and-228-bl.pdf'),
    specs=[('Lens diameter', 'Φ 127 mm'), ('Magnification', '5 Dioptre'), ('Lights', '9 W L.E.D. (56 pcs. S.M.D. L.E.D.s)'), ('Supply voltage', 'AC 220 V, 50 Hz'), ('Weight', 'About 5.25 Kg')])
add('228 L II', 'magnifiers', '228-l-ii', '228 L II', 'LED Magnifying Lamp, 125 mm Lens, Table Clamp, External Arm Springs', pdf=(ET_(f'{MG}/228_L_and_228_L_II_73d73194-7fee-4121-8d9f-b84aa5b23d5a.pdf'), '228-l-and-228-l-ii.pdf'),
    specs=[('Lens diameter', 'Φ 125 mm'), ('Magnification', '5 or 8 Dioptre (chosen when ordering)'), ('Lights', '9 W L.E.D. (56 pcs. S.M.D.)'), ('Supply voltage', 'AC 220 V, 50 Hz'), ('Weight', 'About 2 Kg')])
add('228 L LED', 'magnifiers', '228-l', '228 L', 'LED Magnifying Lamp, 125 mm Lens, Table Clamp, Sturdy Arms', pdf=(ET_(f'{MG}/228_L_and_228_L_II_73d73194-7fee-4121-8d9f-b84aa5b23d5a.pdf'), '228-l-and-228-l-ii.pdf'),
    specs=[('Lens diameter', 'Φ 125 mm'), ('Magnification', '5 or 8 Dioptre (chosen when ordering)'), ('Lights', '9 W L.E.D. (56 pcs. S.M.D.)'), ('Supply voltage', 'AC 220 V, 50 Hz'), ('Weight', 'About 3 Kg')])
add('8093 LD', 'magnifiers', '8093-ld', '8093 LD', 'Dimmable LED Magnifying Lamp, Touch Dimmer, Table Top', pdf=(ET_(f'{MG}/8093_LD.pdf'), '8093-ld.pdf'))
add('8093 LED', 'magnifiers', '8093-led', '8093 LED', 'LED Magnifying Lamp, 100 mm Lens, Table Top', pdf=(ET_(f'{MG}/8093_CFL_and_8093_LED.pdf'), '8093-cfl-and-8093-led.pdf'),
    specs=[('Supply voltage', '220 V AC, 60 / 50 Hz'), ('Lighting', '40 pcs. L.E.D., 6 W'), ('Lens diameter', '100 mm'), ('Magnifications', '3 Dioptre main lens and 12 Dioptre built-in small lens'), ('Adjustable extent', '450 mm'), ('Feature', 'Desk-top, folding arm'), ('Weight', 'Approx. 1.75 Kg')])
add('8093 Magnifying lamp (CFL)', 'magnifiers', '8093', '8093', 'Magnifying Lamp, 100 mm Lens, CFL, Table Top', pdf=(ET_(f'{MG}/8093_CFL_and_8093_LED.pdf'), '8093-cfl-and-8093-led.pdf'),
    specs=[('Supply voltage', '220 V AC, 60 / 50 Hz'), ('Lighting', '12 W circular C.F.L.'), ('Lens diameter', '100 mm'), ('Magnifications', '3 Dioptre main lens and 12 Dioptre built-in small lens'), ('Adjustable extent', '450 mm'), ('Feature', 'Desk-top, folding arm'), ('Weight', 'Approx. 1.75 Kg')])
add('268 L', 'magnifiers', '268-l', '268 L', 'LED Magnifying Lamp, 90 mm Lens, Table Top', pdf=(ET_(f'{MG}/268_L_b4b6a89f-a767-4536-ae46-654c1a389e22.pdf'), '268-l.pdf'))

# --- spares and accessories (no catalogue PDF exists for these)
add('191 AD', 'soldering-accessories', '191-ad', '191 AD', 'Soldering Tip Temperature Thermometer, 0–800 °C',
    tagline='Soldering tip thermometer, 0–800 °C, 3½ digits, °C and °F, max. hold.',
    specs=[('Range', '0 ~ 800 °C'), ('Display', '3½ digits, °C & °F'), ('Function', 'Max. hold'), ('Sensor', 'External sensor connection with bead type probe')])
add('192', 'soldering-accessories', '192', '192', 'Multifunction Soldering Tester',
    specs=[('Measures', 'Tip temperature, leakage voltage and ground resistance'), ('Temperature resolution', '1 ºC / ºF')])
add('Soldering Iron assembly', 'soldering-accessories', '907a', '907A', 'Soldering Iron Assembly for 936 A, 706, 700',
    specs=[('Part No.', '907A'), ('Fits', '936 A, 706, 700'), ('Includes', 'Heating element, pointed tip, barrel, nut, grip, cord & connector')])
for pre, id_, part, fits, kind in [
    ('Heating element (Coil) for 857 D', 'he-857a', 'HE-857 A', '857 D, 706 series SMD re-work stations', 'Heating element (coil)'),
    ('Heating element (Coil) for 850 A', 'a-1146', 'A 1146', '850 A, 700 series SMD re-work stations', 'Heating element (coil)'),
    ('Ceramic Heating element', 'a-1321', 'A 1321', '937, 236 soldering stations', 'Ceramic heating element'),
    ('Heating element for Soldering station 936 AD', 'h1901r', 'H1901R', '936 AD soldering station', 'Heating element'),
    ('Heating element for Soldering station 936 A,', 'a-1321a', 'A 1321 A', '936 A, 706, 700 soldering stations', 'Heating element'),
    ('Barrel for 936 AD', 'b-936ad', 'B-936AD', '936 AD soldering station', 'Barrel (with vents)'),
    ('Barrel for 937', 'b-937', 'B-937', '937 and 236 soldering stations', 'Barrel (with vents)'),
    ('Barrel for 936,', 'b-936', 'B-936', '936, 706 and 700 soldering stations', 'Barrel'),
    ('Nut for 936 A', 'nu-936', 'Nu-936', '936 A, 936 AD, 937, 236, 706, 700 soldering stations', 'Nut')]:
    add(pre, 'soldering-accessories', id_, part, f'{kind} for {fits}', specs=[('Part No.', part), ('Fits', fits), ('Pack', 'Pack of 1')])
for pre, id_, part, name, tip in [
    ('Soldering station bits - Pack of 1 (T-1.2 LD', 't-1-2-ld', 'T-1.2 LD', 'Long Double-Sided Soldering Bit', 'Pointed, long double-sided'),
    ('Soldering station bits - Pack of 1 (T-LB', 't-lb', 'T-LB', 'Long Pencil Soldering Bit', 'Pencil, long blunted'),
    ('Soldering station bits - Pack of 1 (T-J', 't-j', 'T-J', 'Bent Pointed Soldering Bit', 'Pointed, bent'),
    ('Soldering station bits - Pack of 1 (Small K', 't-sk', 'T-SK', 'Small Knife-Type Soldering Bit, 4 mm', 'Knife, 4 mm'),
    ('Soldering station bits - Pack of 1 (T-D', 't-d-series', 'T-D Series', 'Double-Sided Chisel Soldering Bit', 'Double-sided chisel; 0.8D, 1.2D, 1.6D, 2.4D, 3.2D, 4.2D, 5D'),
    ('Soldering station bits - Pack of 1 (T-C', 't-c-series', 'T-C Series', 'Single-Sided Spade Soldering Bit', 'Single-sided spade; 0.5C, 0.8C, 1C, 2C, 3C, 4C, 5C'),
    ('Soldering station bits - Pack of 1 (T-B', 't-b', 'T-B', 'Pencil Soldering Bit', 'Pencil, blunted'),
    ('Soldering station bits - Pack of 1 (T-I', 't-i', 'T-I', 'Pointed Soldering Bit', 'Pointed'),
    ('Soldering station bits - Pack of 1 (T-K', 't-k', 'T-K', 'Knife-Type Soldering Bit, 8 mm', 'Knife, 8 mm')]:
    add(pre, 'soldering-accessories', id_, part, name, specs=[('Type', tip), ('Fits', '936 A, 937, 236, 706 and 700 soldering stations'), ('Pack', 'Pack of 1')])
add('Red & Black Power supply cables', 'soldering-accessories', 'ps-cables-5a', 'Banana-2CC', 'Power Supply Cables, Banana to Crocodile Clips, 5 A',
    specs=[('Current', '5 A max.'), ('Length', '53 cm (end to end)'), ('Ends', 'Banana plug to crocodile clip'), ('Colours', 'Red and black pair')])

# ----------------------------------------------------------------------------- build
def sent(t): return re.split(r'(?<=[.!?])\s', t)[0]
new_by_cat = {}
for e in E:
    p = shop_item(e['prefix'])
    lines = shop_text(p['body_html'])
    feats, specs = [], list(e.get('specs') or [])
    pdf_src = None
    if e['pdf']:
        src, dest = e['pdf']
        if src != 'SERIES':
            assert os.path.exists(src), src
            pdf_src = src
            f, s = parse_pdf(src)
            feats = f
            if not specs: specs = s
    if not feats:
        feats = [l for l in lines[1:] if len(l) < 140][:8]
    desc = ' '.join(lines)[:900]
    if len(desc) < 60 and feats: desc = (desc + ' ' + ' '.join(feats[:3])).strip()
    tag = sent(lines[0])[:170] if lines else e['name']
    if e.get('features'): feats = e['features']
    if e.get('desc'): desc = e['desc']
    if e.get('tagline'): tag = e['tagline']
    elif len(tag) < 28 or tag.lower().startswith('model'): tag = e['name']
    ent = {'id': e['id'], 'model': e['model'], 'name': e['name'], 'tagline': tag, 'description': desc,
           'features': feats[:10], 'specs': [{'label': k, 'value': v} for k, v in specs][:14]}
    # photos
    imgs = []
    local = []
    if e['id'] == '936-a':
        local = [f'{PICS}/Soldering Stations/936 A Soldering station/{n}' for n in ('936AWeb.webp', '936ANew.webp', '936.2.webp')]
    if e['id'] == '989':
        local = [f'{PICS}/SMD Hot Tweezer/989 SMD Hot tweezer/989-square.webp']
    srcs = [f for f in local if os.path.exists(f)] or shop_photos(p)   # our own photo if we have one, else the watermark-free var-tech.com photo
    os.makedirs(f"{IMG}/{e['cat']}", exist_ok=True)
    for i, f in enumerate(srcs):
        name = f"{e['id']}.webp" if i == 0 else f"{e['id']}-{i + 1}.webp"
        normalise(f, f"{IMG}/{e['cat']}/{name}"); imgs.append(name)
    ent['images'] = imgs
    if e['pdf']:
        ent['catalogue'] = e['pdf'][1]
        if pdf_src:
            os.makedirs(f"{DL}/{e['cat']}", exist_ok=True)
            shutil.copy(pdf_src, f"{DL}/{e['cat']}/{e['pdf'][1]}")
    new_by_cat.setdefault(e['cat'], []).append(ent)
    print(f"{e['cat']:22} {e['id']:12} imgs={len(imgs)} feats={len(ent['features'])} specs={len(ent['specs'])} pdf={'Y' if e['pdf'] else '-'}")

for cat, ents in new_by_cat.items():
    fp = f'{DATA}/vartech-{cat}.json'
    cur = json.load(open(fp)) if os.path.exists(fp) else []
    have = {x['id'] for x in cur}
    cur += [x for x in ents if x['id'] not in have]
    json.dump(cur, open(fp, 'w'), indent=2, ensure_ascii=False)
    print('wrote', fp, len(cur))
