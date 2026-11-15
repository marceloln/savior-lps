# Leva as cenas de mesa renderizadas (gente_mpfb.py mesas) para public/assets/mesa, em WebP,
# e escreve mesas.json com quantos quadros cada boneco tem.
#   python arte/empacota_mesas.py /home/claude/pessoas/m
import sys, os, json, glob
from PIL import Image
origem = sys.argv[1]; destino = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'mesa')
os.makedirs(destino, exist_ok=True)
quadros, peso = {}, 0
for arq in sorted(glob.glob(os.path.join(origem, '*_[01].png'))):
    nome = os.path.basename(arq)[:-4]; id, n = nome.rsplit('_', 1)
    if n == '1' and not os.path.exists(os.path.join(origem, id + '_0.png')): continue
    sai = os.path.join(destino, nome + '.webp')
    Image.open(arq).convert('RGB').save(sai, quality=80, method=6); peso += os.path.getsize(sai)
    quadros[id] = max(quadros.get(id, 0), int(n) + 1)
json.dump(quadros, open(os.path.join(destino, 'mesas.json'), 'w'), sort_keys=True)
print(len(quadros), 'pessoas,', peso // 1024, 'KB')
