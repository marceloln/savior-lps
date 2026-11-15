# Marca no lab

O logo nunca é redesenhado, nem em fonte nem por modelo. Vale sempre o arquivo oficial.

## De onde vêm os arquivos

Os SVG oficiais ficam em `src/ui/marca/`:

- `vetor30-creme.svg` e `vetor30-verde.svg`, o logo completo
- `v30-creme.svg` e `v30-verde.svg`, a versão curta

A família oficial tem também VetorLAB, VLAB, VetorRUN e VRUN. Eles não entraram porque o lab usa a marca mãe.

## Onde cada um entra

| Lugar | Arquivo | Regra |
|---|---|---|
| Menu lateral aberto | vetor30-creme | 164 px de largura, acima do mínimo de 140 |
| Menu recolhido | v30-creme | versão curta |
| Celular e tela de espera | v30-verde e vetor30-verde | sobre papel claro |
| Ícone da aba | v30-creme sobre o verde | `public/favicon.svg`, montado a partir do arquivo oficial |
| Totem no gramado | vetor30-creme como textura | painel inclinado de frente para a câmera, sem distorção |
| Parede da recepção | vetor30-creme como textura | parede baixa, 1,5 m, para não tampar o corredor |
| Mural da Iara | vetor30-verde | cartão do mural, sobre creme |

## Regras do guia que o lab segue

- Fundo escuro pede creme com areia. Fundo claro pede verde com areia.
- Sem bisel, brilho, sombra, contorno ou gradiente novo. O degradê do V faz parte do arquivo.
- Área de respiro em volta do logo, da altura do zero.
- Nunca esticar. No 3D, o totem fica inclinado para a câmera justamente para o logo aparecer reto.
- Verde nunca vira preto.

## Como refazer as texturas do 3D

A textura é o SVG oficial rasterizado sobre a cor de fundo do painel. O comando usa o Playwright:

```
node arte/raster.cjs '[["src/ui/marca/vetor30-creme.svg","#20352F","tex/logo_vetor30_creme.png",2060]]'
```

`pessoais_bpy.py` aplica a textura com `logo_em_painel`. `pos_lab.py` deixa o totem fora do desfoque do entorno.

## Em aberto

- A marca pede Roboto. A interface do lab usa Alegreya, do tema de diário de campo. Trocar é decisão dos sócios.
- Se o lab for assumido como produto VetorLAB, o logo do menu e do totem troca para o arquivo VetorLAB.
