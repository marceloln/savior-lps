# Entorno vivo do lab: árvores, carros, motos, bicicletas e o drone de entrega.
# Cada um é renderizado sozinho na mesma câmera do lab para virar sprite no mapa.
# Todo veículo sai em duas versões, _ida (de frente para +x) e _volta (de frente para -x): no mapa ninguém anda de ré.
#   ../blendenv/bin/python cena_vivos.py [arvores|veiculos|drone]
import sys, os, math, json, random
SO = sys.argv[1:] or ['arvores', 'veiculos', 'drone']
sys.argv = [sys.argv[0], 'render']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_bpy.py')).read())
from mathutils import Vector
LAB = json.load(open(os.path.join(AQUI, 'lab.json'))); K = LAB['k']
R = Vector(LAB['R']); U = Vector(LAB['U']); D = Vector(LAB['D'])
def cm(c, rug=0.5, metal=0.0): return mat('c' + c + str(rug) + str(metal), c, metal, rug)
PRETO = cm('#1B1D1E', 0.6); PNEU = cm('#1A1A1A', 0.85); ARO = cm('#B9BCC0', 0.35, 0.5); VIDRO_C = cm('#1E2A2E', 0.08, 0.2)
FAROL = mat('farol', '#FFF6D8', 0, 0.2, emis_forca=1.6); LANTERNA = mat('lanterna', '#B3261E', 0, 0.3, emis_forca=1.0)
PELE = cm('#C99774', 0.6); CAIXA = cm('#C9A46E', 0.8)

def limpa():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
def gira_tudo(graus):
    vz = bpy.data.objects.new('giro', None); bpy.context.collection.objects.link(vz)
    for o in bpy.data.objects:
        if o is not vz and o.parent is None and not getattr(o, 'is_shadow_catcher', False) and o.type in ('MESH', 'EMPTY'): o.parent = vz
    vz.rotation_euler = (0, 0, math.radians(graus)); bpy.context.view_layer.update()

# ---------------- árvores ----------------
def folhagem(nome, escuro, claro, escala=2.6):
    """Folha com variação de tom por ruído, para a copa não parecer de plástico."""
    if nome in MATS: return MATS[nome]
    m = bpy.data.materials.new(nome); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); rd = nt.nodes.new('ShaderNodeTexNoise'); rd.inputs['Scale'].default_value = escala; rd.inputs['Detail'].default_value = 5.0
    rampa = nt.nodes.new('ShaderNodeValToRGB'); rampa.color_ramp.elements[0].position = 0.36; rampa.color_ramp.elements[0].color = hx(escuro); rampa.color_ramp.elements[1].position = 0.7; rampa.color_ramp.elements[1].color = hx(claro)
    nt.links.new(tc.outputs['Object'], rd.inputs['Vector']); nt.links.new(rd.outputs['Fac'], rampa.inputs['Fac']); nt.links.new(rampa.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.62; MATS[nome] = m; return m
TEX_NUVEM = {}
def tufo(r, pos, m, g, achata=0.8, forca=0.42):
    """Massa de folhas: esfera deformada por ruído, nunca uma bola perfeita."""
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=pos); o = bpy.context.object; o.name = 'tufo'
    o.scale = (1 + g.random() * 0.3, 1 + g.random() * 0.3, achata); o.rotation_euler = (g.random() * 0.5, g.random() * 0.5, g.random() * 6)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    chave = round(r, 1)
    if chave not in TEX_NUVEM:
        t = bpy.data.textures.new('nuvem%s' % chave, 'CLOUDS'); t.noise_scale = max(0.25, r * 0.55); t.noise_depth = 3; TEX_NUVEM[chave] = t
    md = o.modifiers.new('d', 'DISPLACE'); md.texture = TEX_NUVEM[chave]; md.strength = r * forca; md.texture_coords = 'GLOBAL'
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='d'); return suave(liga(o, m))
TRONCO = cm('#5E4A38', 0.9); TRONCO_C = cm('#8A7A66', 0.85)
def galhos(g, base, topo, n, abre, r=0.07, m=None):
    for k in range(n):
        a = k / n * math.tau + g.random(); d = abre * (0.6 + g.random() * 0.5)
        tubo('galho', [base, (base[0] + math.cos(a) * d * 0.45, base[1] + math.sin(a) * d * 0.45, (base[2] + topo) / 2), (math.cos(a) * d, math.sin(a) * d, topo)], r, m or TRONCO)
def copa(g, alt, raio, n, mats, achata=0.8, baixo=0.55, r0=0.75):
    for k in range(n):
        a = g.random() * math.tau; rr = g.random() ** 0.55 * raio; z = alt * (baixo + g.random() * (1 - baixo))
        # as massas de cima ficam mais para o meio, como numa copa de verdade
        rr *= 1 - 0.5 * max(0, (z / alt - 0.8) / 0.2)
        tufo(r0 * (0.75 + g.random() * 0.6), (math.cos(a) * rr, math.sin(a) * rr, z), mats[k % len(mats)], g, achata)
def arvore(v):
    g = random.Random(v * 7 + 3)
    if v == 0:    # sibipiruna: copa larga e aberta, sombra de calçada
        alt = 6.2; tubo('tronco', [(0, 0, 0), (0.12, 0.05, alt * 0.3), (0.02, 0.1, alt * 0.5)], 0.19, TRONCO); galhos(g, (0.02, 0.1, alt * 0.48), alt * 0.78, 5, 2.0)
        copa(g, alt, 2.5, 26, [folhagem('f_sibi', '#35662F', '#6FA24A'), folhagem('f_sibi2', '#3F7A3A', '#86B25A')], achata=0.62, baixo=0.62)
    elif v == 1:  # oiti: copa fechada, redonda e escura
        alt = 5.0; tubo('tronco', [(0, 0, 0), (-0.05, 0.04, alt * 0.3), (0, 0, alt * 0.5)], 0.2, TRONCO)
        copa(g, alt, 1.7, 22, [folhagem('f_oiti', '#234A2C', '#3F7444'), folhagem('f_oiti2', '#2B5A35', '#4B8550')], achata=0.9, baixo=0.5, r0=0.85)
    elif v == 2:  # ipê-amarelo florido: galhos à mostra e flor em cachos
        alt = 5.6; tubo('tronco', [(0, 0, 0), (0.1, -0.05, alt * 0.35), (0.05, 0, alt * 0.55)], 0.15, TRONCO_C); galhos(g, (0.05, 0, alt * 0.5), alt * 0.92, 7, 1.9, 0.05, TRONCO_C)
        copa(g, alt, 2.0, 24, [folhagem('f_ipe', '#D9A21E', '#F4D548', 4.0), folhagem('f_ipe2', '#E3B52C', '#F8E27A', 4.0), folhagem('f_ipe3', '#C9941A', '#EFC83A', 4.0)], achata=0.7, baixo=0.6, r0=0.55)
    elif v == 3:  # palmeira: tronco alto e fino, folhas em arco
        alt = 8.6; tubo('tronco', [(0, 0, 0), (0.18, 0.05, alt * 0.5), (0.1, 0.0, alt)], 0.16, TRONCO_C)
        for k in range(8): toro('anel', 0.17, 0.02, (0.02 * k, 0, 0.8 + k * 0.95), TRONCO)
        fm = [folhagem('f_palma', '#2F6A34', '#5E9A4A', 6.0), folhagem('f_palma2', '#3A7A3C', '#74AC58', 6.0)]
        esfera('coroa', 0.34, (0.1, 0, alt + 0.05), fm[0], esc=(1, 1, 1.3), seg=14)
        for k in range(13):
            a = k / 13 * math.tau + g.random() * 0.2; cai = 0.5 + (k % 3) * 0.45; comp = 2.5 + g.random() * 0.6
            ex, ey = math.cos(a), math.sin(a)
            tubo('raque', [(0.1, 0, alt + 0.1), (0.1 + ex * comp * 0.5, ey * comp * 0.5, alt + 0.75 - cai * 0.2), (0.1 + ex * comp, ey * comp, alt + 0.1 - cai)], 0.03, fm[1])
            for j in range(9):
                t = 0.18 + j / 9 * 0.8; px_ = 0.1 + ex * comp * t; py_ = ey * comp * t; pz_ = alt + 0.1 + (0.65 - cai * 0.2) * 4 * t * (1 - t) - cai * t * t
                esfera('foliolo', 0.42 * (1.05 - t * 0.6), (px_, py_, pz_ - 0.08), fm[(j + k) % 2], esc=(0.32, 1.0, 0.12), seg=8).rotation_euler = (0.55 if j % 2 else -0.55, 0, a)
    else:         # araucária: tronco reto e copa em taça no alto
        alt = 9.0; tubo('tronco', [(0, 0, 0), (0.03, 0, alt * 0.5), (0, 0, alt)], 0.2, TRONCO)
        fa = [folhagem('f_arau', '#1F4A2E', '#3A7046', 5.0), folhagem('f_arau2', '#285636', '#447C4E', 5.0)]
        for andar, (z, raio, n) in enumerate(((alt * 0.98, 2.3, 11), (alt * 0.86, 2.0, 9), (alt * 0.74, 1.5, 7))):
            for k in range(n):
                a = k / n * math.tau + andar * 0.4; ex, ey = math.cos(a), math.sin(a)
                tubo('ramo', [(0, 0, z - 0.5), (ex * raio * 0.6, ey * raio * 0.6, z - 0.35), (ex * raio, ey * raio, z + 0.15)], 0.05, TRONCO)
                tufo(0.55, (ex * raio, ey * raio, z + 0.25), fa[k % 2], g, 0.55, 0.3); tufo(0.42, (ex * raio * 0.6, ey * raio * 0.6, z - 0.1), fa[(k + 1) % 2], g, 0.5, 0.3)
        tufo(0.8, (0, 0, alt + 0.2), fa[0], g, 0.6, 0.3)

# ---------------- carros ----------------
def trapezio(nome, tam, pos, m, frente=0.25, tras=0.18, lado=0.1, ch=0.06):
    """Caixa com o topo recuado: cabine com para-brisa e vidro traseiro inclinados."""
    o = caixa(nome, tam, pos, m)
    for v in o.data.vertices:
        if v.co.z > 0:
            v.co.x += -frente * tam[0] if v.co.x > 0 else tras * tam[0]; v.co.y *= 1 - lado
    if ch: chanfro(o, ch, 3)
    return suave(o)
def roda(x, y, r=0.33, larg=0.24):
    cil('pneu', r, larg, (x, y, r), PNEU, rot=(math.pi / 2, 0, 0), v=28); cil('aro', r * 0.62, larg + 0.02, (x, y, r), ARO, rot=(math.pi / 2, 0, 0), v=20)
def carro(tipo, cor):
    # tipo: 0 hatch, 1 sedã, 2 utilitário, 3 van elétrica de entrega
    comp, larg, alt_c, alt_t, r = [(3.95, 1.74, 0.62, 0.58, 0.31), (4.5, 1.8, 0.6, 0.56, 0.32), (4.55, 1.88, 0.78, 0.66, 0.37), (5.1, 1.98, 0.95, 1.0, 0.36)][tipo]
    lata = cm(cor, 0.32, 0.35); zc = r * 0.75 + alt_c / 2
    suave(caixa('carroceria', (comp, larg, alt_c), (0, 0, zc), lata, ch=0.16 if tipo < 3 else 0.1))
    caixa('saia', (comp * 0.96, larg * 0.98, 0.14), (0, 0, r * 0.75 + 0.04), PRETO, ch=0.03)
    topo = zc + alt_c / 2
    if tipo == 3:
        # van elétrica de entrega: baú alto atrás, com a faixa verde, e cabine curta na frente
        cb = comp * 0.6; xb = -comp / 2 + cb / 2 + 0.05
        caixa('bau', (cb, larg * 0.99, alt_t + 0.1), (xb, 0, topo + (alt_t + 0.1) / 2 - 0.04), lata, ch=0.06); caixa('faixa', (cb * 0.98, larg * 1.0, 0.18), (xb, 0, topo + 0.3), cm('#20352F', 0.5))
        cc_ = comp * 0.3; xc = comp / 2 - cc_ / 2 - comp * 0.08
        trapezio('vidros', (cc_, larg * 0.92, alt_t * 0.8), (xc, 0, topo + alt_t * 0.4 - 0.03), VIDRO_C, frente=0.4, tras=0.0, lado=0.1)
        caixa('teto', (cc_ * 0.55, larg * 0.8, 0.05), (xc - cc_ * 0.2, 0, topo + alt_t * 0.8 - 0.04), lata, ch=0.02)
        ct, cc = 0.27, 0.3
    else:
        ct, cc = [(-0.12, 0.56), (-0.02, 0.5), (-0.1, 0.6), (-0.22, 0.82)][tipo]   # centro e comprimento da cabine, em fração do carro
        trapezio('vidros', (comp * cc, larg * 0.94, alt_t), (comp * ct, 0, topo + alt_t / 2 - 0.03), VIDRO_C, frente=[0.26, 0.26, 0.2, 0.1][tipo], tras=[0.12, 0.26, 0.1, 0.02][tipo], lado=0.12)
        f, t_ = [0.26, 0.26, 0.2, 0.1][tipo], [0.12, 0.26, 0.1, 0.02][tipo]
        teto_c = comp * cc * (1 - f - t_); teto_x = comp * ct + comp * cc * (t_ - f) / 2
        caixa('teto', (teto_c * 0.98, larg * 0.94 * 0.88, 0.05), (teto_x, 0, topo + alt_t - 0.035), lata, ch=0.02)
        for px_ in (teto_x - teto_c * 0.2, teto_x + teto_c * 0.28):   # colunas entre as janelas
            caixa('coluna', (0.07, larg * 0.9, alt_t * 0.92), (px_, 0, topo + alt_t / 2 - 0.03), lata)
    ex = comp / 2 - comp * 0.19
    for sx in (-ex, ex):
        for sy in (-larg / 2 + 0.1, larg / 2 - 0.1): roda(sx, sy, r)
    for sy in (-larg * 0.33, larg * 0.33):
        caixa('farol', (0.05, larg * 0.2, 0.11), (comp / 2 - 0.02, sy, zc + alt_c * 0.2), FAROL, ch=0.01); caixa('lanterna', (0.05, larg * 0.2, 0.1), (-comp / 2 + 0.02, sy, zc + alt_c * 0.22), LANTERNA, ch=0.01)
    caixa('grade', (0.04, larg * 0.42, 0.12), (comp / 2 - 0.01, 0, zc - alt_c * 0.12), PRETO); caixa('placa_t', (0.03, 0.4, 0.12), (-comp / 2 - 0.005, 0, zc - alt_c * 0.2), cm('#E8E4DC', 0.5))
    for sy in (-larg / 2 - 0.06, larg / 2 + 0.06): caixa('retrovisor', (0.1, 0.14, 0.09), (comp * ct + comp * cc * 0.34, sy, topo + 0.08), lata, ch=0.02)

# ---------------- gente sobre duas rodas ----------------
def piloto(x, z, cor, capacete, inclina=0.35, maos=(0.42, 0.0, 0.0), pes=(0.12, 0.0)):
    """Pessoa simples sentada: tronco inclinado, capacete, braços até o guidão e pernas até o pedal."""
    roupa = cm(cor, 0.8); calca = cm('#2E3440', 0.8)
    ox = x + math.sin(inclina) * 0.52; oz = z + math.cos(inclina) * 0.52   # ombro
    tubo('tronco', [(x, 0, z), (ox, 0, oz)], 0.15, roupa); esfera('capacete', 0.13, (ox + 0.1, 0, oz + 0.2), cm(capacete, 0.3), esc=(1.1, 1, 1), seg=16)
    caixa('viseira', (0.03, 0.18, 0.08), (ox + 0.225, 0, oz + 0.2), PRETO)
    for sy in (-0.19, 0.19):
        tubo('braco', [(ox, sy, oz - 0.05), (ox + (x + maos[0] - ox) * 0.55, sy * 1.15, oz - 0.22), (x + maos[0], sy * 1.2 + maos[1], z + 0.28 + maos[2])], 0.05, roupa)
        tubo('perna', [(x, sy * 0.6, z), (x + 0.36, sy * 0.85, z - 0.08), (x + pes[0] + 0.1, sy * 0.8, z - 0.52 + pes[1])], 0.065, calca)
        caixa('pe', (0.2, 0.08, 0.07), (x + pes[0] + 0.16, sy * 0.8, z - 0.56 + pes[1]), PRETO, ch=0.02)
def moto(cor, bau=True):
    r = 0.3
    for dx in (-0.66, 0.66): cil('pneu', r, 0.13, (dx, 0, r), PNEU, rot=(math.pi / 2, 0, 0), v=24); cil('aro', r * 0.6, 0.14, (dx, 0, r), ARO, rot=(math.pi / 2, 0, 0), v=16)
    lata = cm(cor, 0.35, 0.3)
    tubo('garfo', [(0.66, 0, r), (0.42, 0, 0.95)], 0.035, ARO); tubo('guidao', [(0.42, -0.3, 0.98), (0.42, 0.3, 0.98)], 0.022, PRETO)
    esfera('tanque', 0.24, (0.12, 0, 0.78), lata, esc=(1.3, 0.75, 0.75), seg=16); caixa('motor', (0.42, 0.26, 0.3), (0.02, 0, 0.45), PRETO, ch=0.04)
    caixa('banco', (0.62, 0.26, 0.1), (-0.36, 0, 0.8), PRETO, ch=0.04); caixa('rabeta', (0.3, 0.2, 0.12), (-0.7, 0, 0.74), lata, ch=0.03)
    caixa('farol_m', (0.06, 0.16, 0.14), (0.52, 0, 0.9), FAROL, ch=0.02); caixa('lant_m', (0.04, 0.12, 0.06), (-0.86, 0, 0.76), LANTERNA)
    tubo('escape', [(-0.1, 0.15, 0.36), (-0.7, 0.17, 0.42)], 0.04, ARO)
    if bau: caixa('bau_m', (0.46, 0.46, 0.44), (-0.78, 0, 1.08), cm('#C9603F', 0.5), ch=0.03); caixa('tampa_bau', (0.48, 0.48, 0.04), (-0.78, 0, 1.31), PRETO, ch=0.01)
    piloto(-0.3, 0.9, '#3B4A44' if bau else '#6B5440', '#F0EAD6' if bau else '#20352F', inclina=0.3, maos=(0.72, 0, 0.1), pes=(0.2, -0.02))
def bicicleta(cor, roupa, eletrica=False):
    r = 0.34; quadro = cm(cor, 0.4, 0.2); y0 = r
    for dx in (-0.52, 0.52): toro('pneu', r, 0.022, (dx, 0, r), PNEU, rot=(math.pi / 2, 0, 0)); toro('aro', r - 0.03, 0.008, (dx, 0, r), ARO, rot=(math.pi / 2, 0, 0))
    for a, b in [((-0.52, 0, y0), (-0.02, 0, y0 - 0.04)), ((-0.02, 0, y0 - 0.04), (-0.18, 0, y0 + 0.56)), ((-0.52, 0, y0), (-0.18, 0, y0 + 0.5)), ((-0.18, 0, y0 + 0.5), (0.36, 0, y0 + 0.56)), ((-0.02, 0, y0 - 0.04), (0.36, 0, y0 + 0.5)), ((0.52, 0, y0), (0.38, 0, y0 + 0.74))]:
        tubo('quadro', [a, b], 0.018 if not eletrica else 0.026, quadro)
    caixa('selim', (0.24, 0.1, 0.05), (-0.2, 0, y0 + 0.62), PRETO, ch=0.02); tubo('guidao', [(0.4, -0.24, y0 + 0.76), (0.4, 0.24, y0 + 0.76)], 0.014, PRETO)
    if eletrica: caixa('bateria', (0.3, 0.08, 0.1), (0.1, 0, y0 + 0.33), PRETO, ch=0.02, rot=(0, -0.5, 0)); caixa('cesto', (0.3, 0.36, 0.22), (-0.6, 0, y0 + 0.62), CAIXA, ch=0.02)
    piloto(-0.2, y0 + 0.7, roupa, '#F0EAD6' if eletrica else '#C9603F', inclina=0.5, maos=(0.6, 0, 0.05), pes=(0.06, 0.06))

# ---------------- drone de entrega ----------------
def drone():
    corpo = cm('#F0EAD6', 0.4); braco = cm('#2B3A35', 0.5)
    caixa('corpo', (0.42, 0.3, 0.14), (0, 0, 0.5), corpo, ch=0.05); caixa('faixa', (0.43, 0.31, 0.03), (0, 0, 0.47), cm('#20352F', 0.5))
    disco = mat('helice', '#9AA3A0', 0, 0.4); disco.blend_method = 'BLEND'
    b = disco.node_tree.nodes['Principled BSDF']; b.inputs['Alpha'].default_value = 0.34
    for sx in (-1, 1):
        for sy in (-1, 1):
            tubo('braco', [(sx * 0.14, sy * 0.1, 0.52), (sx * 0.4, sy * 0.36, 0.56)], 0.022, braco)
            cil('motor', 0.045, 0.07, (sx * 0.4, sy * 0.36, 0.59), braco, v=14); cil('helice', 0.24, 0.006, (sx * 0.4, sy * 0.36, 0.635), disco, v=28)
    for sy in (-0.14, 0.14): tubo('esqui', [(-0.2, sy, 0.3), (0.2, sy, 0.3)], 0.012, braco); tubo('perna_e', [(0, sy, 0.3), (0, sy * 0.8, 0.44)], 0.012, braco)
    caixa('pacote', (0.3, 0.24, 0.2), (0, 0, 0.3), CAIXA, ch=0.01); caixa('fita', (0.31, 0.05, 0.205), (0, 0, 0.3), cm('#B08A5E', 0.7))
    caixa('luz_d', (0.03, 0.08, 0.03), (0.215, 0, 0.5), FAROL)

def luz_e_chao(sombra=True):
    mundo = bpy.data.worlds.new('mundo'); cena.world = mundo; mundo.use_nodes = True
    bg = mundo.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hx('#DDE7EC'); bg.inputs['Strength'].default_value = 0.55
    bpy.ops.object.light_add(type='SUN'); s = bpy.context.object; s.data.energy = 5.0; s.data.angle = math.radians(4); s.data.color = hx('#FFF0DC')[:3]
    s.rotation_euler = (math.radians(55), 0, math.radians(-25))
    if sombra: bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0)); ch = bpy.context.object; ch.is_shadow_catcher = True
def renderiza(nome, larg, alt, amostras=48):
    # câmera ortográfica na mesma direção do lab, centrada no meio do objeto, k pixels por metro
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' and not o.is_shadow_catcher for c in o.bound_box]
    us = [p.dot(R) for p in pts]; vs = [p.dot(U) for p in pts]
    uc, vc = (min(us) + max(us)) / 2, (min(vs) + max(vs)) / 2 - (0.4 if any(o.is_shadow_catcher for o in bpy.data.objects) else 0)
    assert max(us) - min(us) < larg / K and max(vs) - min(vs) < alt / K, (nome, 'não cabe', (max(us) - min(us)) * K, (max(vs) - min(vs)) * K)
    cam_d = bpy.data.cameras.new('cam'); camo = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(camo); cena.camera = camo
    cam_d.type = 'ORTHO'; cam_d.ortho_scale = max(larg, alt) / K; cam_d.clip_start = 1; cam_d.clip_end = 200
    camo.location = R * uc + U * vc + D * 60; camo.rotation_euler = (-D).to_track_quat('-Z', 'Y').to_euler()
    cena.render.resolution_x = larg; cena.render.resolution_y = alt
    cena.render.engine = 'CYCLES'; cena.cycles.device = 'CPU'; cena.cycles.samples = amostras; cena.cycles.use_denoising = True
    cena.render.film_transparent = True; cena.view_settings.view_transform = 'AgX'; cena.view_settings.look = 'AgX - Base Contrast'
    cena.render.filepath = os.path.join(AQUI, 'vivos', nome + '.png'); bpy.ops.render.render(write_still=True)
    # pé do objeto (origem) em pixels da imagem
    return [round(larg / 2 - uc * K, 2), round(alt / 2 + vc * K, 2)]

os.makedirs(os.path.join(AQUI, 'vivos'), exist_ok=True)
arq = os.path.join(AQUI, 'vivos', 'ancoras.json')
saida = json.load(open(arq)) if os.path.exists(arq) else {}
def faz(nome, fn, larg, alt, giro=0, sombra=True):
    limpa(); luz_e_chao(sombra); fn()
    if giro: gira_tudo(giro)
    saida[nome] = renderiza(nome, larg, alt); print('PRONTO', nome, saida[nome], flush=True)
    json.dump(saida, open(arq, 'w'))
if 'arvores' in SO:
    for k in [k for k in saida if k.startswith('arvore')]: del saida[k]
    for v in range(5): faz(f'arvore{v}', lambda v=v: arvore(v), 600, 780)
if 'veiculos' in SO:
    SOMENTE = os.environ.get('SOMENTE')   # refaz só um veículo, por exemplo SOMENTE=carro3
    if not SOMENTE:
        for k in [k for k in saida if k.startswith(('carro', 'moto', 'bici'))]: del saida[k]
    FROTA = [('carro0', lambda: carro(0, '#B8472E'), 420, 300), ('carro1', lambda: carro(1, '#E4E0D8'), 440, 300), ('carro2', lambda: carro(2, '#2B3A35'), 450, 320),
             ('carro3', lambda: carro(3, '#F0EAD6'), 480, 380), ('carro4', lambda: carro(0, '#C5AA81'), 420, 300), ('carro5', lambda: carro(1, '#6E7672'), 440, 300),
             ('moto0', lambda: moto('#C9603F', True), 260, 260), ('moto1', lambda: moto('#2B3A35', False), 260, 260),
             ('bici0', lambda: bicicleta('#E9B949', '#2F5A4C'), 240, 250), ('bici1', lambda: bicicleta('#20352F', '#C9603F', True), 240, 250)]
    for nome, fn, w, h in FROTA:
        if SOMENTE and nome != SOMENTE: continue
        faz(nome + '_ida', fn, w, h); faz(nome + '_volta', fn, w, h, giro=180)
if 'drone' in SO:
    faz('drone0', drone, 200, 170, sombra=False)
print('VIVOS OK', sorted(saida))
