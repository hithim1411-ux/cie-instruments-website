"""Builds the Systems Tech datasheet PDFs from the manufacturer's 16-page all-products brochure (rasterised pages).
Per page: removes the '1 YEAR WARRANTY' seal, the page number, and the footer bar's phone / email / website (replaced with the CIE logo and website); drops the NIST-traceable row of the TS-201 page (claim not on our site). Writes
  <out>/systems-tech/<slug>/<id>.pdf        one page per model (linked as `catalogue` from the product json)
  <out>/systems-tech/systems-tech-product-range.pdf   cover + at-a-glance table + all 13 model pages (page numbers re-set)
Brochure pages 1 (cover, certification badges, social icons), 15 (services) and 16 (their contact details) are not used.
Usage: BROCHURE=/path/to/brochure.pdf OUT=../cie-downloads python3 scripts/make-systems-tech-catalogues.py"""
import os, json, io
import numpy as np, cv2, fitz
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BRO = os.environ.get('BROCHURE', '/Users/hitesh/Downloads/Brochure All Products Systems Tech.pdf')
OUT = os.path.abspath(os.environ.get('OUT', os.path.join(ROOT, '..', 'cie-downloads')))
PAGES = {2: ('handheld-tachometers', 'htm-560'), 3: ('handheld-tachometers', 'htm-590'), 4: ('handheld-tachometers', 'htm-890'),
         5: ('panel-tachometers', 'tm-801'), 6: ('tachometer-sensors', 'tm-801-tachogenerator'), 7: ('panel-tachometers', 'tm-802'),
         8: ('tachometer-sensors', 'tm-802-magnetic-pickup'), 9: ('panel-tachometers', 'tm-803'), 10: ('tachometer-sensors', 'tm-803-proximity-switch'),
         11: ('panel-tachometers', 'tm-804'), 12: ('tachometer-sensors', 'tm-804-photo-reflective'), 13: ('temperature-humidity-sensors', 'ts-200'),
         14: ('temperature-humidity-sensors', 'ts-201')}
RED = (233, 41, 36)
IMG_RECT = fitz.Rect(15, 55, 580, 787)
src = fitz.open(BRO)

def page_image(n):
    xr = src[n - 1].get_images(full=True)[0][0]
    pix = fitz.Pixmap(src, xr)
    if pix.n >= 4: pix = fitz.Pixmap(fitz.csRGB, pix)
    return np.asarray(Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')).copy()

def seal_mask(im):
    hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
    gold = (hsv[:, :, 0] >= 15) & (hsv[:, :, 0] <= 34) & (hsv[:, :, 1] > 55) & (hsv[:, :, 2] > 90); gold[3170:] = False
    strong = (hsv[:, :, 0] >= 17) & (hsv[:, :, 0] <= 32) & (hsv[:, :, 1] > 100) & (hsv[:, :, 2] > 110); strong[3170:] = False
    g = cv2.morphologyEx(strong.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((61, 61), np.uint8))
    _, lab, st, _ = cv2.connectedComponentsWithStats(g); core = lab == 1 + np.argmax(st[1:, 4])
    near = cv2.dilate(core.astype(np.uint8), np.ones((401, 401), np.uint8)) > 0
    red = (im[:, :, 0] > 130) & (im[:, :, 1] < 100) & (im[:, :, 2] < 100); red[3170:] = False
    m = core | (red & near) | (gold & near)
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((51, 51), np.uint8))
    return cv2.dilate(m, np.ones((61, 61), np.uint8)) > 0

def clean(n):
    im = page_image(n)
    im[seal_mask(im)] = 255
    if n == 14:   # drop the 'NIST traceable' row (3 text lines, y 2220-2337) and close the gap
        im[2220:2220 + (3170 - 2369)] = im[2369:3170].copy(); im[2220 + (3170 - 2369):3170] = 255
    im[60:175, 2330:2550] = 255          # brochure page number
    im[3170:] = 255                      # footer bar (their phone / email / website) removed
    return im

CIE_LOGO_PNG = os.path.join(ROOT, 'public/logo/cie-logo-transparent.webp')
_cl = Image.open(CIE_LOGO_PNG).convert('RGBA'); _bb = _cl.getbbox(); _cl = _cl.crop(_bb); _b = io.BytesIO(); _cl.save(_b, 'PNG'); CIE_LOGO_BYTES = _b.getvalue()
def draw_page(doc, im, number=None):
    pg = doc.new_page(width=595, height=842)
    buf = io.BytesIO(); Image.fromarray(im).resize((1700, 2200), Image.LANCZOS).save(buf, 'JPEG', quality=84, optimize=True)
    pg.insert_image(IMG_RECT, stream=buf.getvalue())
    h = 30; w = h * _cl.width / _cl.height
    pg.insert_image(fitz.Rect(30, 770 - h / 2 + 3, 30 + w, 770 + h / 2 + 3), stream=CIE_LOGO_BYTES)
    f = fitz.Font('hebo'); txt = 'www.cieinstruments.in'; tw = f.text_length(txt, 10)
    pg.insert_text((565 - tw, 774), txt, fontsize=10, fontname='hebo', color=(0.1, 0.1, 0.12))
    pg.draw_line((30, 751), (565, 751), color=(0.85, 0.85, 0.87), width=0.6)
    if number: pg.insert_text((580 - fitz.Font('hebo').text_length(str(number), 15), 84), str(number), fontsize=15, fontname='hebo', color=(0.1, 0.1, 0.12))
    return pg

cleaned = {n: clean(n) for n in PAGES}
os.makedirs(f'{OUT}/systems-tech', exist_ok=True)
for n, (slug, pid) in PAGES.items():
    d = fitz.open(); draw_page(d, cleaned[n])
    os.makedirs(f'{OUT}/systems-tech/{slug}', exist_ok=True)
    d.save(f'{OUT}/systems-tech/{slug}/{pid}.pdf', garbage=4, deflate=True); d.close()

# ---- combined range catalogue
logo_src = cleaned[2][60:175, 100:1100]; ys, xs = np.where(logo_src.min(axis=2) < 235)
logo = logo_src[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
lb = io.BytesIO(); Image.fromarray(logo).save(lb, 'PNG'); LOGO = lb.getvalue(); lh, lw = logo.shape[:2]
CIE_LOGO = open(os.path.join(ROOT, 'public/logo/cie-logo.png'), 'rb').read()
D = lambda s: json.load(open(os.path.join(ROOT, f'src/data/systems-tech-{s}.json')))
cats = [('Handheld digital tachometers', 'handheld-tachometers'), ('Digital panel mount tachometers', 'panel-tachometers'),
        ('Tachometer speed sensors', 'tachometer-sensors'), ('Wireless temperature and humidity sensors', 'temperature-humidity-sensors')]
page_no = {pid: i + 3 for i, (n, (s, pid)) in enumerate(PAGES.items())}   # cover 1, contents 2, model pages from 3
doc = fitz.open()
# cover
c = doc.new_page(width=595, height=842)
c.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=(1, 1, 1))
c.draw_rect(fitz.Rect(0, 560, 595, 842), color=None, fill=tuple(x / 255 for x in RED))
c.insert_image(fitz.Rect(48, 54, 48 + 220, 54 + 220 * lh / lw), stream=LOGO)
c.insert_text((48, 250), 'PRODUCT RANGE', fontsize=13, fontname='hebo', color=tuple(x / 255 for x in RED))
c.insert_text((48, 300), 'Digital Tachometers,', fontsize=34, fontname='hebo', color=(0.08, 0.08, 0.1))
c.insert_text((48, 342), 'Speed Sensors and', fontsize=34, fontname='hebo', color=(0.08, 0.08, 0.1))
c.insert_text((48, 384), 'Wireless Sensors', fontsize=34, fontname='hebo', color=(0.08, 0.08, 0.1))
for k, line in enumerate(['Handheld and panel mount tachometers, tacho-', 'generators, magnetic pick-up, proximity and', 'photo-reflective sensors, temperature and', 'humidity sensors.']):
    c.insert_text((48, 414 + 14 * k), line, fontsize=10.5, fontname='helv', color=(0.3, 0.3, 0.33))
def photo(slug, f, rect):
    im = Image.open(os.path.join(ROOT, 'public/images/systems-tech', slug, f)).convert('RGB'); b = io.BytesIO(); im.save(b, 'JPEG', quality=88)
    ar = im.width / im.height; w, h = rect.width, rect.height
    if w / h > ar: nw = h * ar; r = fitz.Rect(rect.x0 + (w - nw) / 2, rect.y0, rect.x0 + (w + nw) / 2, rect.y1)
    else: nh = w / ar; r = fitz.Rect(rect.x0, rect.y0 + (h - nh) / 2, rect.x1, rect.y0 + (h + nh) / 2)
    c.insert_image(r, stream=b.getvalue())
photo('handheld-tachometers', 'htm-590.webp', fitz.Rect(395, 70, 555, 290))
photo('panel-tachometers', 'tm-802.webp', fitz.Rect(392, 290, 562, 420))
photo('temperature-humidity-sensors', 'ts-201.webp', fitz.Rect(48, 480, 230, 556))
photo('tachometer-sensors', 'tm-804-photo-reflective.webp', fitz.Rect(260, 480, 440, 556))
c.insert_text((48, 780), 'www.cieinstruments.in', fontsize=12, fontname='hebo', color=(1, 1, 1))
# contents / at-a-glance
t = doc.new_page(width=595, height=842)
t.insert_image(fitz.Rect(48, 40, 48 + 150, 40 + 150 * lh / lw), stream=LOGO)
t.insert_text((48, 118), 'Models at a glance', fontsize=24, fontname='hebo', color=(0.08, 0.08, 0.1))
y = 150
def clip(s, w, size, font='helv'):
    f = fitz.Font(font)
    while f.text_length(s, size) > w and len(s) > 4: s = s[:-2]
    return s if f.text_length(s, size) <= w else s[:-1]
for title, slug in cats:
    t.draw_rect(fitz.Rect(48, y, 547, y + 22), color=None, fill=tuple(x / 255 for x in RED))
    t.insert_text((56, y + 15), title, fontsize=11, fontname='hebo', color=(1, 1, 1))
    y += 28
    for p in D(slug):
        t.insert_text((56, y + 11), clip(p['model'], 80, 10, 'hebo'), fontsize=10, fontname='hebo', color=(0.08, 0.08, 0.1))
        t.insert_text((140, y + 11), clip(p['name'], 330, 9.5), fontsize=9.5, fontname='helv', color=(0.2, 0.2, 0.22))
        if p['id'] in page_no:
            t.insert_text((510, y + 11), f"p. {page_no[p['id']]}", fontsize=9.5, fontname='helv', color=(0.4, 0.4, 0.43))
        y += 20
    y += 12
t.insert_text((48, 800), 'Models without a datasheet page: TM-802 UNF pick-up (see cieinstruments.in).', fontsize=8.5, fontname='helv', color=(0.4, 0.4, 0.43))
for i, n in enumerate(PAGES, start=3):
    draw_page(doc, cleaned[n], i)
doc.save(f'{OUT}/systems-tech/systems-tech-product-range.pdf', garbage=4, deflate=True)
print('wrote', len(PAGES), 'datasheets + range catalogue to', OUT)
