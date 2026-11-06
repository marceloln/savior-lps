# Retratos de frente de cada pessoa, na mesma luz dos sprites, para a interface.
import asyncio, base64, io, json, subprocess, time, sys
from playwright.async_api import async_playwright
from PIL import Image
sys.argv = [sys.argv[0]]
exec(open('sprites3.py').read().split('POSES=')[0].split("LAB = json.load")[0])
src = open('sprites3.py').read(); exec(src[src.index('ZC = {'):src.index('POSES=')])
async def main():
    srv = subprocess.Popen(['python3','-m','http.server','8765'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    out = {}
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            pg = await b.new_page(); await pg.goto('http://localhost:8765/render3.html'); await pg.wait_for_function('window.pronto===true')
            await pg.evaluate("window.S=260; window.AUTOBOX=true"); await pg.evaluate("prepChar('personagem.glb','pele_rotulos.png')")
            for id, cores in PERS:
                o = await pg.evaluate("async ([c])=>await renderChar(c, 2.356, 'parado', 0, 1.7)", [cores])
                im = Image.open(io.BytesIO(base64.b64decode(o['png'].split(',')[1]))).convert('RGBA'); bb = im.getbbox(); im = im.crop(bb)
                lado = int(im.height * 0.56); top = im.crop(((im.width - lado) // 2, -int(lado * 0.04), (im.width - lado) // 2 + lado, lado - int(lado * 0.04))).resize((128, 128), Image.LANCZOS)
                out[id] = top
            await b.close()
    finally: srv.terminate()
    ids = list(out); at = Image.new('RGBA', (128 * len(ids), 128))
    for i, k in enumerate(ids): at.paste(out[k], (i * 128, 0))
    at.save('/home/claude/savior-lps/public/assets/retratos.webp', quality=90, method=6)
    json.dump(ids, open('/home/claude/savior-lps/public/assets/retratos.json', 'w')); print('ok', len(ids))
asyncio.run(main())
