// Rasteriza o logo oficial (SVG) em PNG, sobre a cor de fundo pedida, sem redesenhar nada.
const {chromium}=require(process.env.PLAYWRIGHT || 'playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();
 for(const [arq,fundo,saida,larg] of JSON.parse(process.argv[2])){
  const svg=fs.readFileSync(arq,'utf8'); const m=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const w=+m[1],h=+m[2]; const H=Math.round(larg*h/w);
  const p=await b.newPage({viewport:{width:larg,height:H}});
  await p.setContent(`<body style="margin:0;background:${fundo}"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="display:block;width:${larg}px;height:${H}px"></body>`);
  await p.screenshot({path:saida,omitBackground:fundo==='transparent'}); await p.close(); console.log(saida,larg,H);
 } await b.close()})()
