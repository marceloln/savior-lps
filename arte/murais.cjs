// Mural de cada especialista: lê src/lib/peculiaridades.json e desenha um painel de cortiça com os cartões de cada um.
// O resultado vira textura da cena da mesa (arte/gente_mpfb.py mesas).
//   node arte/murais.cjs <pasta de saída> [ids]
// Precisa do playwright e da fonte Roboto (@fontsource/roboto). O logo é o arquivo oficial, nunca redesenhado.
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const SAIDA = process.argv[2] || '.', SO = process.argv.slice(3);
const DADOS = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/peculiaridades.json'), 'utf8'));
const FONTES = process.env.ROBOTO || path.join(__dirname, '../node_modules/@fontsource/roboto/files');
const LOGO = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(__dirname, '../src/ui/marca/vetor30-verde.svg')).toString('base64');
const V = '#20352F', C = '#F0EAD6', A = '#C5AA81', T = '#C9603F', AM = '#E9B949';
const svg = (w, h, miolo) => `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet">${miolo}</svg>`;

const CARTAO = {
  frase: c => `<div class="frase">${c.x}</div>`,
  lista: c => `<ul class="lista">${c.i.map((x, k) => `<li><i class="${k < 2 ? 'ok' : ''}"></i>${x}</li>`).join('')}</ul>`,
  postits: c => `<div class="postits">${c.i.map((x, k) => `<span style="background:${[AM, '#F0A58A', '#B9D8A6'][k % 3]};transform:rotate(${[-4, 3, -2][k % 3]}deg)">${x}</span>`).join('')}</div>`,
  espinha: () => svg(300, 150, `<g stroke="${V}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M14 75H250"/>${[60, 120, 180].map(x => `<path d="M${x} 75l-28-52M${x} 75l-28 52"/>`).join('')}</g><path d="M250 45l40 30-40 30z" fill="${T}"/>`),
  barras: () => svg(300, 150, [70, 112, 54, 130, 92].map((h, k) => `<rect x="${18 + k * 56}" y="${140 - h}" width="38" height="${h}" rx="4" fill="${k === 3 ? T : k % 2 ? A : V}"/>`).join('') + `<path d="M8 142H292" stroke="${V}" stroke-width="4"/>`),
  linha: () => svg(300, 150, `<path d="M8 142H292" stroke="${V}" stroke-width="4"/><polyline points="14,112 62,84 110,96 158,52 206,66 254,28 286,40" fill="none" stroke="${T}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>${[[62, 84], [158, 52], [254, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${V}"/>`).join('')}`),
  funil: c => `<div class="funil">${c.i.map((x, k) => `<span style="width:${100 - k * 17}%;background:${[V, '#2F5A4C', A, T][k % 4]};color:${k === 2 ? V : C}">${x}</span>`).join('')}</div>`,
  dispersao: () => svg(300, 150, `<path d="M10 6V142H292" stroke="${V}" stroke-width="4" fill="none"/>` + [[40, 118], [66, 96], [84, 110], [110, 84], [128, 92], [150, 62], [176, 74], [196, 46], [222, 54], [250, 26], [236, 100], [90, 44]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="9" fill="${k > 9 ? T : k % 2 ? A : V}"/>`).join('') + `<path d="M30 126L270 22" stroke="${T}" stroke-width="3" stroke-dasharray="8 8"/>`),
  calendario: () => `<div class="cal">${Array.from({ length: 28 }, (_, k) => `<i class="${[2, 9, 16, 23].includes(k) ? 'a' : [4, 11, 18, 25].includes(k) ? 'b' : k % 7 > 4 ? 'f' : ''}"></i>`).join('')}</div>`,
  paleta: () => `<div class="paleta"><span style="background:${V};color:${C}">Verde<small>#20352F</small></span><span style="background:${C};color:${V}">Creme<small>#F0EAD6</small></span><span style="background:${A};color:${V}">Areia<small>#C5AA81</small></span></div>`,
  jornada: c => `<div class="jornada">${c.i.map((x, k) => `<span><i style="background:${k === 3 ? T : V}">${k + 1}</i>${x}</span>`).join('')}</div>`,
  fluxo: c => `<div class="fluxo">${c.i.map(x => `<span>${x}</span>`).join('<b>›</b>')}</div>`,
  cronograma: () => `<div class="crono">${[[0, 23], [23, 24], [47, 40], [87, 13]].map(([x, w], k) => `<span style="left:${x}%;width:${w}%;top:${k * 25}%;background:${[V, '#2F5A4C', A, T][k]}"></span>`).join('')}<em>Dia 1</em><em style="right:0">Dia 30</em></div>`,
  mapa: () => svg(300, 150, `<rect width="300" height="150" rx="8" fill="#E4EAD8"/><g stroke="#fff" stroke-width="12" fill="none"><path d="M-5 100C80 90 120 30 305 44"/><path d="M90-5C100 60 180 100 190 155"/></g><g stroke="${T}" stroke-width="4" fill="none" stroke-dasharray="9 7"><path d="M52 96C100 80 130 60 152 76S220 60 248 46"/></g>${[[52, 96], [152, 76], [248, 46]].map(([x, y]) => `<path d="M${x} ${y}c-14-18-14-30 0-32 14 2 14 14 0 32z" fill="${V}"/><circle cx="${x}" cy="${y - 20}" r="5" fill="${C}"/>`).join('')}`),
  foto: c => `<div class="foto">${svg(300, 190, {
    pista: `<rect width="300" height="190" fill="#DDE7EC"/><rect y="128" width="300" height="62" fill="#B9B7AE"/><rect x="40" y="38" width="220" height="20" rx="4" fill="${V}"/><rect x="60" y="58" width="12" height="74" fill="#F5F3EE"/><rect x="228" y="58" width="12" height="74" fill="#F5F3EE"/><rect x="130" y="86" width="40" height="46" rx="5" fill="${C}" stroke="${V}" stroke-width="4"/><rect x="138" y="94" width="24" height="12" fill="${V}"/><path d="M176 142h76l-8-22h-52z" fill="${T}"/><circle cx="192" cy="146" r="9" fill="#222"/><circle cx="238" cy="146" r="9" fill="#222"/>`,
    loja: `<rect width="300" height="190" fill="${C}"/><rect y="150" width="300" height="40" fill="#D9B98C"/>${[0, 1, 2].map(r => `<rect x="24" y="${34 + r * 38}" width="252" height="6" fill="${V}"/>` + [0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${34 + k * 34}" y="${12 + r * 38 + (k % 3) * 3}" width="22" height="${22 - (k % 3) * 3}" rx="3" fill="${[T, AM, A, '#7FB069', V][(k + r) % 5]}"/>`).join('')).join('')}`,
    time: `<rect width="300" height="190" fill="#E9E2D2"/><rect x="40" y="118" width="220" height="14" rx="6" fill="#D9B98C"/>${[[84, V], [150, T], [216, A]].map(([x, cor]) => `<circle cx="${x}" cy="70" r="20" fill="#D9A982"/><path d="M${x - 30} 122c0-36 60-36 60 0z" fill="${cor}"/>`).join('')}<rect x="126" y="104" width="18" height="14" rx="3" fill="#fff"/><rect x="166" y="104" width="18" height="14" rx="3" fill="#fff"/>`,
  }[c.c] || '')}</div>`,
  recorte: () => `<div class="recorte"><b></b>${'<i></i>'.repeat(8)}</div>`,
  paginas: () => `<div class="paginas">${[0, 1, 2].map(k => `<span style="transform:rotate(${[-3, 0, 3][k]}deg)"><b style="background:${[V, A, T][k]}"></b>${'<i></i>'.repeat(5)}</span>`).join('')}</div>`,
  telas: () => `<div class="telas">${[0, 1, 2].map(k => `<span><b></b>${k === 1 ? '<u></u><u></u><u></u>' : '<i></i><i></i><i style="width:50%"></i>'}<em style="background:${k === 1 ? T : V}"></em></span>`).join('')}</div>`,
  logo: () => `<div class="logo"><img src="${LOGO}"></div>`,
};
const LARGO = new Set(['frase', 'fluxo', 'jornada', 'postits', 'cronograma', 'paleta', 'logo']);

const pagina = (id, m) => `<!doctype html><meta charset="utf-8"><style>
${[400, 500, 700, 900].map(p => `@font-face{font-family:Roboto;font-weight:${p};src:url(file://${FONTES}/roboto-latin-${p}-normal.woff2)}`).join('')}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1600px;height:920px;font-family:Roboto,sans-serif;color:${V};background:#8A6A4A;padding:22px}
.cortica{width:100%;height:100%;border-radius:6px;padding:30px 34px;background:#DCC7A0 radial-gradient(rgba(120,90,50,.28) 1.4px,transparent 1.6px) 0 0/13px 13px;box-shadow:inset 0 0 0 4px rgba(90,65,35,.35),inset 0 10px 30px rgba(60,40,20,.25);display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:min-content;gap:26px 28px;align-content:start;align-items:start}
.titulo{grid-column:span 2;background:${V};color:${C};padding:26px 30px;border-radius:6px;font-weight:900;font-size:68px;line-height:1;letter-spacing:-1px;box-shadow:0 8px 14px -6px rgba(40,30,15,.6);position:relative}
.titulo small{display:block;font-weight:700;font-size:24px;letter-spacing:5px;text-transform:uppercase;color:${A};margin-bottom:12px}
.cartao{background:#FBF7EC;border-radius:5px;padding:20px 22px 22px;box-shadow:0 8px 14px -6px rgba(40,30,15,.55);position:relative}
.cartao.largo{grid-column:span 2}
.cartao::before,.titulo::before{content:'';position:absolute;left:50%;top:-9px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:${T};box-shadow:0 3px 4px rgba(0,0,0,.35),inset -3px -3px 0 rgba(0,0,0,.18)}
.cartao:nth-child(odd)::before{background:${V}}.cartao:nth-child(3n)::before{background:${AM}}
.cartao h3{font-weight:700;font-size:25px;letter-spacing:3px;text-transform:uppercase;color:rgba(32,53,47,.62);margin-bottom:14px}
.cartao:nth-child(2){transform:rotate(-1.2deg)}.cartao:nth-child(3){transform:rotate(1deg)}.cartao:nth-child(5){transform:rotate(-.8deg)}.cartao:nth-child(6){transform:rotate(1.4deg)}
.frase{font-weight:900;font-size:50px;line-height:1.06;letter-spacing:-.5px}
.lista{list-style:none;font-weight:500;font-size:34px;line-height:1.5}.lista i{display:inline-block;width:26px;height:26px;border:4px solid ${V};border-radius:5px;margin-right:14px;vertical-align:-3px}.lista i.ok{background:${V}}
.postits{display:flex;gap:18px;flex-wrap:wrap}.postits span{flex:1;min-width:150px;min-height:120px;padding:14px;font-weight:700;font-size:28px;line-height:1.12;box-shadow:0 5px 8px -4px rgba(40,30,15,.5)}
.funil{display:grid;gap:8px;justify-items:center}.funil span{padding:9px 6px;text-align:center;font-weight:700;font-size:25px;border-radius:5px}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}.cal i{aspect-ratio:1;border-radius:5px;background:rgba(32,53,47,.12)}.cal i.a{background:${V}}.cal i.b{background:${T}}.cal i.f{background:rgba(197,170,129,.5)}
.paleta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.paleta span{padding:54px 14px 14px;border-radius:6px;font-weight:900;font-size:30px;border:2px solid rgba(32,53,47,.15)}.paleta small{display:block;font-weight:500;font-size:20px;opacity:.75}
.jornada{display:flex;justify-content:space-between;position:relative}.jornada::before{content:'';position:absolute;left:30px;right:30px;top:27px;height:6px;background:${A}}
.jornada span{position:relative;display:grid;justify-items:center;gap:8px;font-weight:700;font-size:25px}.jornada i{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;color:${C};font-style:normal;font-weight:900;font-size:28px}
.fluxo{display:flex;align-items:center;gap:8px}.fluxo span{flex:1;padding:16px 6px;text-align:center;border:4px solid ${V};border-radius:8px;font-weight:700;font-size:27px;background:${C}}.fluxo span:last-child{background:${V};color:${C}}.fluxo b{font-size:44px;color:${T}}
.crono{position:relative;height:150px;border-left:5px solid ${V};border-bottom:5px solid ${V}}.crono span{position:absolute;height:20%;border-radius:5px}.crono em{position:absolute;bottom:-34px;font-style:normal;font-weight:700;font-size:22px}
.foto{padding:0;background:#fff;border:10px solid #fff;border-bottom-width:0}.foto svg{display:block}
.recorte{background:#EFEBE0;padding:4px}.recorte b{display:block;height:26px;background:${V};margin-bottom:12px;width:86%}.recorte i{display:block;height:9px;background:rgba(32,53,47,.32);margin-bottom:9px}.recorte i:nth-child(3n){width:72%}
.paginas{display:flex;gap:14px;justify-content:center}.paginas span{width:30%;aspect-ratio:.74;background:#fff;border:2px solid rgba(32,53,47,.2);padding:12px;box-shadow:0 4px 6px -3px rgba(0,0,0,.4)}.paginas b{display:block;height:22%;margin-bottom:10px;border-radius:3px}.paginas i{display:block;height:6px;background:rgba(32,53,47,.3);margin-bottom:8px}
.telas{display:flex;gap:14px;justify-content:center}.telas span{width:29%;aspect-ratio:.56;border:5px solid ${V};border-radius:14px;padding:12px 10px;background:#fff;display:flex;flex-direction:column;gap:8px}.telas b{height:14px;background:${A};border-radius:3px;width:60%}.telas i{display:block;height:8px;background:rgba(32,53,47,.3)}.telas u{display:block;height:26px;border-radius:6px;background:rgba(32,53,47,.14)}.telas em{margin-top:auto;height:20px;border-radius:10px}
.logo{display:grid;place-items:center;padding:26px 10px;background:${C};border-radius:4px}.logo img{width:78%}
</style><div class="cortica"><div class="titulo"><small>${id[0].toUpperCase() + id.slice(1)}</small>${m.titulo}</div>
${m.cartoes.map(c => `<div class="cartao ${LARGO.has(c.t) ? 'largo' : ''}">${c.r ? `<h3>${c.r}</h3>` : ''}${CARTAO[c.t](c)}</div>`).join('\n')}</div>`;

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 920 } });
  for (const [id, d] of Object.entries(DADOS)) {
    if (SO.length && !SO.includes(id)) continue;
    await p.setContent(pagina(id, d.mural)); await p.evaluate(() => document.fonts.ready);
    const sobra = await p.evaluate(() => { const c = document.querySelector('.cortica'); return c.scrollHeight - c.clientHeight; });
    if (sobra > 0) console.warn('AVISO', id, 'passa da cortiça em', sobra, 'px');
    await p.screenshot({ path: path.join(SAIDA, `mural_${id}.png`) }); console.log('mural', id);
  }
  await b.close();
})();
