# Junta os quadros renderizados por gente_mpfb.py num atlas só (gente8.webp + gente8.json) e os rostos em retratos.webp.
import json, os, glob, sys
from PIL import Image
Q = '/home/claude/pessoas/q'; R = '/home/claude/pessoas/r'; AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, '/home/claude/savior-lps/arte')
from elenco import ELENCO

itens = []
for id in ELENCO:
    meta = json.load(open(os.path.join(Q, id, 'meta.json')))
    for f in sorted(glob.glob(os.path.join(Q, id, 'd*.png'))):
        im = Image.open(f).convert('RGBA'); bb = im.getbbox()
        if not bb: continue
        c = im.crop(bb)
        nome = f'{id}_{os.path.basename(f)[:-4]}'
        itens.append((nome, c, meta['ax'] - bb[0], meta['ay'] - bb[1]))
itens.sort(key=lambda t: -t[1].height)
W = 4096; x = y = lh = 0; pos = {}
for k, c, ax, ay in itens:
    if x + c.width > W: x = 0; y += lh + 2; lh = 0
    pos[k] = (x, y, c.width, c.height, round(ax, 2), round(ay, 2)); x += c.width + 2; lh = max(lh, c.height)
H = y + lh
at = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for k, c, ax, ay in itens: at.paste(c, pos[k][:2])
at.save(os.path.join(AQUI, 'gente8.webp'), quality=88, method=6)
json.dump({'escala': 1.25, 'q': pos}, open(os.path.join(AQUI, 'gente8.json'), 'w'))
print('ATLAS', W, H, len(pos))

if os.path.isdir(R):
    ids = [i for i in ELENCO if os.path.exists(os.path.join(R, i + '_rosto.png'))]
    L = 256; ret = Image.new('RGBA', (L * len(ids), L))
    for i, id in enumerate(ids): ret.paste(Image.open(os.path.join(R, id + '_rosto.png')).convert('RGBA').resize((L, L)), (i * L, 0))
    ret.save(os.path.join(AQUI, 'retratos.webp'), quality=90, method=6)
    json.dump(ids, open(os.path.join(AQUI, 'retratos.json'), 'w'))
    os.makedirs(os.path.join(AQUI, 'estacao'), exist_ok=True)
    for id in ids:
        p = os.path.join(R, id + '_estacao.png')
        if os.path.exists(p):
            im = Image.open(p).convert('RGBA'); bb = im.getbbox(); im = im.crop(bb)
            im.save(os.path.join(AQUI, 'estacao', id + '.webp'), quality=88, method=6)
    print('RETRATOS', len(ids))
