# Sprites realistas das pessoas do Lab V30 na mesma câmera do render de fundo.
import asyncio, base64, io, sys, json, subprocess, time, math
from playwright.async_api import async_playwright
from PIL import Image
sys.path.insert(0, '.')
LAB = json.load(open('/home/claude/foto/lab.json'))
ESCALA = 1.25
S = LAB['k'] * ESCALA
ZC = {'estrategia':'#D46A47','planejamento':'#4F86C6','comercial':'#7FB069','arquivo':'#A88A5C','reuniao':'#5FA9C2','marca':'#C95C8A','trafego':'#E9B949','cx':'#3FA7A0','produto':'#E59A3C','dados':'#8E7CC3','academia':'#5FB6D9','lounge':'#B98B5E','atendimento':'#6FAE9E'}
PELES=['#F1C7A5','#E0AC85','#B87B54','#8A5636','#5E3A24']; CAB=['#2B1D14','#5B341A','#141414','#C9A15B','#9A9A9A','#7A2E1F','#3B2A20']; CALC=['#33384A','#2E3B36','#4A3A30','#2B2B33']
AG=[('lia','estrategia',0),('davi','estrategia',1),('rui','planejamento',1),('nina','planejamento',0),('caio','comercial',0),('bela','comercial',1),('iara','marca',0),('theo','marca',0),('duda','trafego',1),('rosa','cx',0),('beto','cx',0),('lara','dados',1),('otto','dados',1),('max','produto',0),('ana','produto',1),('nico','arquivo',1),('clara','atendimento',0)]
PERS=[]
for i,(id,z,oc) in enumerate(AG): PERS.append((id,{'pele':PELES[(i*3)%5],'cabelo':CAB[(i*5)%7],'camisa':ZC[z],'calca':CALC[i%4],'oculos':bool(oc)}))
for i,m in enumerate(['vera','otavio','iris','bento','sol']): PERS.append((m,{'pele':PELES[(i*2+1)%5],'cabelo':CAB[(i*3+2)%7],'camisa':'#5FB6D9','calca':'#2E5F6E','oculos':i%2==0}))
PERS.append(('visita',{'pele':'#B87B54','cabelo':'#141414','camisa':'#F0EAD6','calca':'#33384A','oculos':False}))
POSES=[('parado',2),('andar',4),('digitar',2)]
# 8 direções: d{k} olha para theta = k*45 graus; no lab isso é a direção (sin, -cos) em metros
VISTAS=[(f'd{k}', k * math.pi / 4) for k in range(8)]
async def main():
    srv = subprocess.Popen(['python3','-m','http.server','8765'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            pg = await b.new_page(); pg.on('pageerror', lambda e: print('ERR', e))
            await pg.goto('http://localhost:8765/render3.html'); await pg.wait_for_function('window.pronto===true')
            await pg.evaluate(f"window.S={S}; window.AUTOBOX=true")
            await pg.evaluate("prepChar('personagem.glb','pele_rotulos.png')")
            quadros = {}
            so = sys.argv[1:] or [p_[0] for p_ in PERS]
            for id, cores in PERS:
                if id not in so: continue
                for vista, th in VISTAS:
                    for pose, n in POSES:
                        if pose == 'digitar' and vista != 'd0': continue
                        for f in range(n):
                            o = await pg.evaluate("async ([c,t,p,f])=>await renderChar(c,t,p,f,1.7)", [cores, th, pose, f])
                            im = Image.open(io.BytesIO(base64.b64decode(o['png'].split(',')[1]))).convert('RGBA')
                            quadros[f'{id}_{vista}_{pose}{f}'] = (im, o['ax'], o['ay'])
                print(id, flush=True)
            await b.close()
    finally:
        srv.terminate()
    # recorta e empacota
    itens = []
    for k, (im, ax, ay) in quadros.items():
        bb = im.getbbox(); c = im.crop(bb); itens.append((k, c, ax - bb[0], ay - bb[1]))
    itens.sort(key=lambda t: -t[1].height)
    W = 4096; x = y = lh = 0; pos = {}
    for k, c, ax, ay in itens:
        if x + c.width > W: x = 0; y += lh + 2; lh = 0
        pos[k] = (x, y, c.width, c.height, ax, ay); x += c.width + 2; lh = max(lh, c.height)
    H = y + lh
    at = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for k, c, ax, ay in itens: at.paste(c, pos[k][:2])
    at.save('/home/claude/foto/gente8.png'); at.save('/home/claude/foto/gente8.webp', quality=86, method=6)
    json.dump({'escala': ESCALA, 'q': pos}, open('/home/claude/foto/gente8.json', 'w'))
    print('ATLAS', W, H, len(pos))
asyncio.run(main())
