"""Removes the var-tech.com watermark (pale pink diagonal 'VAR TECH' text + grey (R) ring) from the five heating-element
photos. Same watermark, same position in all five, so its opacity map is estimated from the pixels where the photo is plain
white background, then removed everywhere by inverting  pix = (1-a*s)*orig + a*s*C  (s = stroke coverage 0..1).
Output: cie-store/scripts/_src/vartech-img-clean/<same name>.jpg"""
import numpy as np, cv2, os, sys, glob
from PIL import Image
SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../cie-store/scripts/_src'))
files = sorted(glob.glob(f'{SRC}/vartech-img/*heating-element*-0.jpg'))
assert len(files) == 5, files
A = 0.172; C = np.array([237., 121., 127.])
imgs = [np.asarray(Image.open(f).convert('RGB')).astype(np.float32) for f in files]
H, W, _ = imgs[0].shape
# stroke coverage from plain-white-background pixels:  G drops by ~23 at full coverage
def own_cov(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    bright = (np.minimum(np.minimum(R, G), B) > 205) & (R > 244)
    s = np.clip((255 - G) / 23.0, 0, 1.2); s[s < 0.05] = 0
    return np.where(bright, s, np.nan)
own = [own_cov(a) for a in imgs]
# the watermark is the same artwork in all five but shifted/scaled in two of them, so: build one complete map from the three
# photos that share its placement, then align that to the other two (ECC affine) and use it where the product hides the text
def agree(i, j):
    m = np.isfinite(own[i]) & np.isfinite(own[j]); return float(np.nanmean(np.abs(own[i] - own[j])[m]))
ref = [i for i in range(5) if sum(agree(i, j) < 0.01 for j in range(5) if j != i) >= 2]
print('reference group', [os.path.basename(files[i])[:30] for i in ref])
S_ref = np.nanmedian(np.stack([own[i] for i in ref]), axis=0)
S_ref_valid = np.isfinite(S_ref)
u8 = (np.nan_to_num(S_ref) * 255).astype(np.uint8)
S_ref = cv2.inpaint(u8, ((~S_ref_valid) & (cv2.dilate((np.nan_to_num(S_ref) > 0).astype(np.uint8), np.ones((15, 15), np.uint8)) > 0)).astype(np.uint8), 5, cv2.INPAINT_TELEA).astype(np.float32) / 255
maps = {}
for i in range(5):
    if i in ref:
        maps[i] = S_ref; continue
    tgt = np.nan_to_num(own[i]).astype(np.float32)
    valid = np.isfinite(own[i])
    best = None
    for init_scale in (1.0,):
        warp = np.eye(2, 3, dtype=np.float32)
        try:
            cc, warp = cv2.findTransformECC(cv2.GaussianBlur(tgt, (0, 0), 3), cv2.GaussianBlur(S_ref, (0, 0), 3), warp, cv2.MOTION_AFFINE,
                                           (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-6), valid.astype(np.uint8), 5)
        except cv2.error as e:
            print('ECC failed', e); cc = 0
    warped = cv2.warpAffine(S_ref, warp, (W, H), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    print(os.path.basename(files[i])[:30], 'ECC', round(float(cc), 3), 'residual on bg', round(float(np.abs(warped - tgt)[valid].mean()), 4))
    maps[i] = np.where(valid, np.nan_to_num(own[i]), warped)
os.makedirs(f'{SRC}/vartech-img-clean', exist_ok=True)
for i, (f, a) in enumerate(zip(files, imgs)):
    S0 = np.clip(maps[i], 0, 1)
    S = cv2.GaussianBlur(cv2.dilate(S0, np.ones((5, 5), np.uint8)), (0, 0), 1.0)   # also cover anti-aliased / JPEG-ringing edges
    zone = cv2.dilate((S0 > 0.05).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    al = (A * S)[..., None]
    out = (a - al * C) / (1 - al)
    # grey registered-mark ring (top right, background only)
    out[150:300, 940:1100] = 255   # nothing but background up here in these shots
    out = np.clip(out, 0, 255)
    out[(out.min(axis=2) > 244)] = 255
    out[zone & (out.min(axis=2) > 226) & ((out.max(axis=2) - out.min(axis=2)) < 22)] = 255   # leftover faint tint of the text on background
    Image.fromarray(out.astype(np.uint8)).save(f'{SRC}/vartech-img-clean/{os.path.basename(f)}', quality=95)
    print('cleaned', os.path.basename(f))
