# Texturas da interface do diário de campo: papel, couro verde e madeira. Todas repetem sem emenda.
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(30)
def ruido(n, esc, oit=5):
    out = np.zeros((n, n))
    for o in range(oit):
        s = esc * 2 ** o; g = rng.random((s, s))
        g = np.tile(g, (3, 3))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((n * 3, n * 3), Image.BICUBIC)
        out += np.asarray(im)[n:2 * n, n:2 * n] / 255 / 2 ** o
    return (out - out.min()) / (out.max() - out.min())
N = 512
# papel: base creme quente, manchas suaves e fibras
n1, n2 = ruido(N, 3), ruido(N, 24, 3)
papel = np.zeros((N, N, 3)); papel[:] = [242, 232, 208]
papel *= (0.94 + 0.07 * n1[..., None]) * (0.975 + 0.03 * n2[..., None])
fib = np.zeros((N, N))
for _ in range(900):
    x, y = rng.integers(0, N, 2); L = rng.integers(6, 22); a = rng.random() * np.pi
    for t in range(L): fib[int(y + t * np.sin(a)) % N, int(x + t * np.cos(a)) % N] += 1
papel -= fib[..., None] * 6
Image.fromarray(np.clip(papel, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4)).save('src/ui/papel.webp', quality=82)
# couro verde V30
n3, n4 = ruido(N, 6), ruido(N, 64, 2)
couro = np.zeros((N, N, 3)); couro[:] = [44, 68, 55]
couro *= (0.82 + 0.25 * n3[..., None]) * (0.9 + 0.14 * n4[..., None])
Image.fromarray(np.clip(couro, 0, 255).astype(np.uint8)).save('src/ui/couro.webp', quality=82)
# madeira: veios horizontais
yy = np.arange(N)[:, None] / N
n5 = ruido(N, 4)
veio = np.sin((yy * 22 + n5 * 3.2) * np.pi * 2) * 0.5 + 0.5
mad = np.zeros((N, N, 3)); mad[:] = [120, 82, 52]
mad *= (0.78 + 0.18 * veio[..., None]) * (0.92 + 0.12 * ruido(N, 32, 2)[..., None])
Image.fromarray(np.clip(mad, 0, 255).astype(np.uint8)).save('src/ui/madeira.webp', quality=82)
print('ok')
