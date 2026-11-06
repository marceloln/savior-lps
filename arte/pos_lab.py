# Pós do render: o deck do lab fica nítido, o entorno vai para o desfoque com um véu claro.
import json, numpy as np
from PIL import Image, ImageFilter
L = json.load(open('lab.json'))
W, H, k = L['larg'], L['alt'], L['k']
R, U, D, C = (np.array(L[n]) for n in ('R', 'U', 'D', 'centro'))
im = Image.open('lab.png').convert('RGB')
d16 = np.array(Image.open('lab_prof_0001.png')).astype(np.float64)
prof = L['prof'][0] + d16 / 65535 * (L['prof'][1] - L['prof'][0])
ys, xs = np.mgrid[0:H, 0:W]
u = (xs + 0.5 - W / 2) / k; v = (H / 2 - ys - 0.5) / k; t = L['dist'] - prof
px = C[0] + R[0] * u + U[0] * v + D[0] * t
py = C[1] + R[1] * u + U[1] * v + D[1] * t
X, Y = L['X'], L['Y']
dentro = (px > -0.35) & (px < X + 0.35) & (py > -0.35) & (py < Y + 0.35)
dentro |= (px > -4.6) & (px < -2.2) & (py > 10.2) & (py < 15.8)   # escultura V30
# distância até o deck, para o desfoque crescer com a distância
dx = np.maximum(np.maximum(-px, px - X), 0); dy = np.maximum(np.maximum(-py, py - Y), 0)
dist = np.hypot(dx, dy)
m = Image.fromarray((dentro * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))
m = np.asarray(m) / 255.0
b1 = np.asarray(im.filter(ImageFilter.GaussianBlur(5))).astype(np.float64)
b2 = np.asarray(im.filter(ImageFilter.GaussianBlur(14))).astype(np.float64)
w2 = np.clip((dist - 4) / 10, 0, 1)[..., None]
fora = b1 * (1 - w2) + b2 * w2
veu = np.array([238, 233, 223], np.float64)
fora = fora * (0.8 - 0.1 * w2) + veu * (0.2 + 0.1 * w2)
cinza = fora.mean(axis=2, keepdims=True); fora = fora * 0.8 + cinza * 0.2
nit = np.asarray(im).astype(np.float64)
out = nit * m[..., None] + fora * (1 - m[..., None])
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save('lab.webp', quality=86, method=6)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).resize((W // 3, H // 3)).save('/tmp/claude-0/-home-claude/38bcdef3-8223-5140-b391-c4a3049f88a7/scratchpad/lab_pos.jpg', quality=88)
d = d16.astype(np.uint32); rg = np.zeros((H, W, 3), np.uint8); rg[..., 0] = d >> 8; rg[..., 1] = d & 255
Image.fromarray(rg).save('lab_prof_rg.png', optimize=True)
print('ok', W, H)
