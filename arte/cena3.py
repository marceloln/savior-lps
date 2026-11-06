# Lab V30: open space de inovação inteiro, isométrico, para render e para o motor do jogo.
#   ../blendenv/bin/python cena3.py render AMOSTRAS LARGURA   -> lab.png, lab_prof.png, lab.json
import sys, os, math, json
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_bpy.py')).read())
from mathutils import Vector, Matrix

X, Y, AL = 44.0, 26.0, 3.6

# ---------------- materiais ----------------
CARV = mat('carvalho', '#CDA87C', 0, 0.5, tex='carvalho.jpg', rug_tex='carvalho_rug.jpg')
PAREDE = mat('parede', '#F3F0EA', 0, 0.85)
VERDE = mat('verde_v30', '#20352F', 0, 0.7)
CREME = mat('creme_v30', '#F0EAD6', 0, 0.6)
AREIA = mat('areia_v30', '#C5AA81', 0, 0.6)
ALU = mat('aluminio', '#C9CCCB', 0.9, 0.3)
VIDRO = mat('vidro', '#E8F2F0', 0, 0.03, vidro=True)
FOLHA = mat('folha', '#3F7A4A', 0, 0.5); FOLHA2 = mat('folha_clara', '#5E9A5C', 0, 0.5)
TERRA = mat('terra', '#3A2A1E', 0, 0.9); CERAM = mat('ceramica', '#EDE7DB', 0, 0.3)
LUZ = mat('luz', '#FFF1D6', 0, 0.3, emis_forca=10)
AMARELO = mat('amarelo', '#E9B949', 0.2, 0.35)
LARANJA = mat('laranja', '#E59A3C', 0, 0.4)
AZUL = mat('azul_planta', '#ffffff', 0, 0.75, tex='planta_azul.jpg')
TEC = {k: mat('tecido_' + k, c, 0, 0.95, sheen=0.4) for k, c in {'salvia':'#8FA58A','terracota':'#C9603F','areia':'#D9C29A','verde':'#2F5A4C','azul':'#5E86B0','creme':'#E9E1CE','lilas':'#9C8DCB'}.items()}
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'moveis_bpy.py')).read())

# ---------------- peças com transformação e pegada ----------------
OBST, PONTOS, TELAS, OBJETOS = [], {}, {}, []
def peca(nome, x, y, rot, fn, obst=True, info=None, margem=0.12):
    antes = set(bpy.data.objects)
    fn()
    novos = [o for o in bpy.data.objects if o not in antes]
    vz = bpy.data.objects.new(nome, None); bpy.context.collection.objects.link(vz)
    for o in novos:
        if o.parent is None: o.parent = vz
    vz.location = (x, y, 0); vz.rotation_euler = (0, 0, math.radians(rot))
    bpy.context.view_layer.update()
    xs, ys, zs = [], [], []
    for o in novos:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c); xs.append(p.x); ys.append(p.y); zs.append(p.z)
    if xs:
        r = [min(xs) - margem, min(ys) - margem, max(xs) + margem, max(ys) + margem]
        if obst: OBST.append(r)
        if info: OBJETOS.append({'id': nome, 'info': info, 'r': [round(v, 3) for v in r], 'alt': round(max(zs), 2)})
    return vz
def loc(vz, lx, ly, lz=0.0):
    return list((vz.matrix_world @ Vector((lx, ly, lz)))[:])
def ponto(chave, p, olha=None):
    PONTOS.setdefault(chave, []).append({'x': round(p[0], 3), 'y': round(p[1], 3), 'olha': olha})
def tela(chave, vz, cx, cy, cz, w, h):
    # quadrilátero de uma tela que olha para +y local
    cs = [loc(vz, cx - w/2, cy, cz + h/2), loc(vz, cx + w/2, cy, cz + h/2), loc(vz, cx + w/2, cy, cz - h/2), loc(vz, cx - w/2, cy, cz - h/2)]
    TELAS[chave] = [[round(v, 3) for v in c] for c in cs]

# ---------------- móveis ----------------
def mesa_em_pe(telas=2, w=1.6, d=0.72, tela_mat=0):
    caixa('tampo', (w, d, 0.04), (0, 0, 1.06), COMP, ch=0.008)
    for sx in (-w/2 + 0.12, w/2 - 0.12):
        caixa('coluna', (0.07, 0.07, 1.04), (sx, 0, 0.52), PRETO); caixa('pe', (0.07, d - 0.06, 0.04), (sx, 0, 0.02), PRETO)
    caixa('barra', (w - 0.3, 0.04, 0.06), (0, -d/2 + 0.1, 0.7), PRETO)
    xs = [0] if telas == 1 else ([-0.36, 0.36] if telas == 2 else [-0.62, 0, 0.62])
    for k, dx in enumerate(xs):
        caixa('monitor', (0.62, 0.03, 0.38), (dx, -d/2 + 0.14, 1.5), TELA_P, ch=0.006)
        t = caixa('monitor_tela', (0.58, 0.004, 0.34), (dx, -d/2 + 0.156, 1.5), MON[(tela_mat + k) % 3])
        uv_plano(t, 'x', 'z', -0.29, 0.58, -0.17, 0.34)
        caixa('haste', (0.04, 0.04, 0.22), (dx, -d/2 + 0.12, 1.2), PRETO); caixa('base_mon', (0.2, 0.16, 0.012), (dx, -d/2 + 0.14, 1.086), PRETO)
    caixa('teclado', (0.42, 0.13, 0.015), (0, 0.06, 1.088), BRANCO, ch=0.004)
    caixa('mouse', (0.06, 0.1, 0.02), (0.32, 0.08, 1.09), BRANCO, ch=0.008)
    cil('caneca', 0.045, 0.1, (-w/2 + 0.2, 0.15, 1.13), cor_mat('#2F5A4C', 0.35), v=20)
def planta(alt=1.4, r=0.3, folhas=10, tipo=0):
    cil('vaso', r, r * 1.8, (0, 0, r * 0.9), CERAM if tipo != 1 else cor_mat('#20352F', 0.4), v=40, r2=r * 0.8); cil('terra', r * 0.9, 0.02, (0, 0, r * 1.8), TERRA)
    for k in range(folhas):
        a = k / folhas * math.tau + tipo; h = alt * (0.6 + (k % 3) * 0.17)
        fx_, fy_ = math.cos(a) * r * 1.2, math.sin(a) * r * 1.2
        tubo('caule', [(0, 0, r * 1.8), (fx_ / 2, fy_ / 2, h * 0.8), (fx_, fy_, h)], 0.012, FOLHA)
        bpy.ops.object.select_all(action='DESELECT'); bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(fx_, fy_, h), rotation=(0.5, 0.3, a), segments=16, ring_count=8)
        lf = bpy.context.object; lf.scale = (1.1, 0.5, 0.18); suave(liga(lf, FOLHA if k % 2 else FOLHA2))
def sofa(w=2.2, cor='salvia'):
    m = TEC[cor]
    caixa('base', (w, 0.85, 0.4), (0, 0, 0.22), m, ch=0.06); caixa('encosto', (w, 0.22, 0.45), (0, -0.32, 0.6), m, ch=0.08)
    caixa('braco', (0.2, 0.85, 0.3), (-w/2 + 0.1, 0, 0.55), m, ch=0.07); caixa('braco', (0.2, 0.85, 0.3), (w/2 - 0.1, 0, 0.55), m, ch=0.07)
    for dx in (-w/4, w/4): caixa('almofada', (w/2 - 0.2, 0.7, 0.14), (dx, 0.03, 0.48), m, ch=0.06)
    caixa('almofada_t', (0.42, 0.14, 0.38), (w/4, -0.18, 0.7), TEC['terracota'], rot=(-0.25, 0, -0.2), ch=0.06)
def pufe(cor): esfera('pufe', 0.32, (0, 0, 0.2), TEC[cor], esc=(1, 1, 0.62), seg=32)
def mesa_centro(r=0.42, h=0.42):
    cil('tampo', r, 0.035, (0, 0, h), COMP, v=48)
    for k in range(3):
        a = k / 3 * math.tau; caixa('pe', (0.03, 0.03, h), (math.cos(a) * r * 0.66, math.sin(a) * r * 0.66, h / 2), PRETO)
    cil('vasinho', 0.07, 0.12, (0.15, -0.1, h + 0.08), CERAM, v=20); esfera('suculenta', 0.08, (0.15, -0.1, h + 0.18), FOLHA2, seg=12)
def mesa_alta(r=0.4):
    cil('tampo', r, 0.04, (0, 0, 1.05), BRANCO, v=48); cil('pe', 0.04, 1.03, (0, 0, 0.52), PRETO); cil('base', 0.26, 0.03, (0, 0, 0.015), PRETO, v=32)
def banqueta(cor='areia'):
    cil('assento', 0.19, 0.06, (0, 0, 0.74), TEC[cor], v=24); cil('pe', 0.025, 0.72, (0, 0, 0.36), PRETO); toro('anel', 0.15, 0.012, (0, 0, 0.28), PRETO)
def estante(w=1.8, h=2.0, d=0.4, livros=True):
    caixa('lat', (0.03, d, h), (-w/2, 0, h/2), COMP); caixa('lat', (0.03, d, h), (w/2, 0, h/2), COMP); caixa('meio', (0.025, d, h), (0, 0, h/2), COMP)
    for z in (0.02, h * 0.25, h * 0.5, h * 0.75, h - 0.02): caixa('prat', (w, d, 0.025), (0, 0, z), COMP)
    cores = ['#C9603F', '#20352F', '#C5AA81', '#4F86C6', '#E9B949', '#8FA58A', '#F0EAD6']
    if livros:
        for zi, z in enumerate((0.03, h * 0.5 + 0.01)):
            for i in range(7):
                hh = 0.26 + (i % 3) * 0.04; caixa('livro', (0.05, d * 0.6, hh), (-w/2 + 0.08 + i * 0.07 + zi * 0.95, 0, z + hh/2 + 0.01), cor_mat(cores[(i + zi) % 7], 0.6))
    cil('vaso', 0.09, 0.16, (w/4, 0, h * 0.25 + 0.1), CERAM, v=20); esfera('pl', 0.15, (w/4, 0, h * 0.25 + 0.28), FOLHA, seg=14)
    caixa('obj', (0.16, 0.16, 0.16), (-w/4, 0, h * 0.75 + 0.1), AMARELO, ch=0.02); esfera('obj2', 0.09, (w/4 + 0.2, 0, h * 0.75 + 0.1), LARANJA, seg=16)
def lousa(w=1.6, tex='lousa.png'):
    m = mat('lousa_' + tex, '#ffffff', 0, 0.3, tex=tex)
    f = caixa('face', (w, 0.03, 1.0), (0, 0.02, 1.45), m); uv_plano(f, 'x', 'z', -w/2, w, -0.5, 1.0)
    caixa('moldura', (w + 0.06, 0.03, 1.06), (0, 0, 1.45), ALU)
    for s in (-w/2, w/2):
        caixa('pe', (0.04, 0.04, 1.95), (s, 0, 0.98), ALU); caixa('base', (0.04, 0.5, 0.04), (s, 0, 0.08), ALU)
        for t in (-0.22, 0.22): esfera('roda', 0.04, (s, t, 0.04), PRETO, seg=12)
def totem(w=3.0, h=1.7, tex_mat=None):
    caixa('painel', (w + 0.12, 0.1, h + 0.12), (0, 0, 0.9 + h/2), TELA_P, ch=0.01)
    caixa('tela', (w, 0.01, h), (0, 0.055, 0.9 + h/2), mat('tela_viva', '#1D2B27', 0, 0.2, emis_forca=0.0))
    for s in (-w/3, w/3): caixa('pe', (0.08, 0.08, 0.9), (s, 0, 0.45), PRETO); caixa('base', (0.08, 0.6, 0.03), (s, 0, 0.015), PRETO)
def mesa_projetos():
    caixa('tampo', (2.5, 1.4, 0.05), (0, 0, 0.95), COMP, ch=0.01)
    for sx in (-1.1, 1.1):
        for sy in (-0.58, 0.58): caixa('pe', (0.06, 0.06, 0.93), (sx, sy, 0.465), PRETO)
    p = caixa('planta', (2.3, 1.18, 0.004), (0, 0, 0.978), AZUL); uv_plano(p, 'x', 'y', -1.15, 2.3, -0.59, 1.18)
    for k, (dx, m) in enumerate(((-0.35, mat('papel_branco', '#F4F1EA', 0, 0.9)), (0.25, mat('argila', '#B9B2A6', 0, 0.8)), (0.85, cor_mat('#2F5A4C', 0.45)))):
        caixa('maquete', (0.22, 0.16, 0.1), (dx, -0.1, 1.03), m); caixa('cobertura', (0.3, 0.24, 0.015), (dx + 0.12, 0.05, 1.12), m)
    caixa('regua', (0.9, 0.06, 0.008), (-0.6, 0.45, 0.985), mat('regua', '#ffffff', 0, 0.6, tex='regua.png'), rot=(0, 0, 0.3))
    cil('lapis', 0.008, 0.3, (0.6, 0.45, 0.99), AMARELO, rot=(0, math.pi/2, 0.6), v=8)
def gondola():
    caixa('base', (2.0, 0.6, 0.12), (0, 0, 0.06), BRANCO)
    caixa('costas', (2.0, 0.05, 1.5), (0, -0.28, 0.85), BRANCO)
    for z in (0.5, 0.9, 1.3): caixa('prat', (2.0, 0.5, 0.025), (0, -0.02, z), BRANCO)
    cores = ['#C9603F', '#E9B949', '#4F86C6', '#7FB069', '#C95C8A', '#F0EAD6']
    for zi, z in enumerate((0.13, 0.52, 0.92, 1.32)):
        for i in range(9):
            hh = 0.16 + (i % 3) * 0.05; caixa('produto', (0.17, 0.3, hh), (-0.88 + i * 0.22, 0, z + hh/2), cor_mat(cores[(i + zi * 2) % 6], 0.45))
def cadeira(cor='areia'):
    caixa('assento', (0.46, 0.44, 0.05), (0, 0, 0.46), TEC[cor], ch=0.02); caixa('encosto', (0.46, 0.05, 0.36), (0, -0.2, 0.72), TEC[cor], ch=0.02)
    for sx in (-0.2, 0.2):
        for sy in (-0.18, 0.18): cil('pe', 0.015, 0.44, (sx, sy, 0.22), cor_mat('#B08A5E', 0.5), v=8)
def mesa_reuniao(w=3.6, d=1.2):
    caixa('tampo', (w, d, 0.05), (0, 0, 1.05), BRANCO, ch=0.015)
    for sx in (-w/2 + 0.3, w/2 - 0.3): caixa('pe', (0.08, d - 0.3, 1.02), (sx, 0, 0.51), PRETO)
    for k in range(4): caixa('caderno', (0.2, 0.28, 0.01), (-1.2 + k * 0.8, 0.25 if k % 2 else -0.25, 1.08), cor_mat(['#F0EAD6', '#C5AA81', '#E9B949', '#F0EAD6'][k], 0.8), rot=(0, 0, 0.2 * (k - 1.5)))
    cil('jarra', 0.07, 0.24, (0, 0, 1.2), VIDRO, v=24)
def tv_parede(w=2.4, h=1.35):
    for sx in (-w/3, w/3): caixa('pe_tv', (0.07, 0.07, 1.2), (sx, -0.06, 0.6), PRETO); caixa('base_tv', (0.08, 0.7, 0.03), (sx, -0.06, 0.015), PRETO)
    caixa('tv', (w, 0.05, h), (0, 0, 1.8), TELA_P, ch=0.01); caixa('tv_tela', (w - 0.08, 0.01, h - 0.08), (0, 0.03, 1.8), mat('tela_viva', '#1D2B27', 0, 0.2))
def arquivo(n=4):
    for i in range(n):
        caixa('arq', (0.5, 0.6, 1.3), (i * 0.54, 0, 0.65), BRANCO, ch=0.01)
        for k in range(3): caixa('gav', (0.44, 0.01, 0.36), (i * 0.54, 0.305, 0.25 + k * 0.42), cor_mat('#ECE8E0', 0.3)); caixa('puxa', (0.16, 0.02, 0.02), (i * 0.54, 0.315, 0.38 + k * 0.42), ALU)
def pingpong():
    for sx in (-1.2, 1.2):
        for sy in (-0.6, 0.6): caixa('pe', (0.05, 0.05, 0.74), (sx, sy, 0.37), PRETO)
    caixa('mesa', (2.74, 1.52, 0.03), (0, 0, 0.76), cor_mat('#2F5A4C', 0.35)); caixa('linha', (2.74, 0.02, 0.004), (0, 0, 0.778), BRANCO)
    caixa('borda1', (2.74, 0.02, 0.004), (0, 0.75, 0.778), BRANCO); caixa('borda2', (2.74, 0.02, 0.004), (0, -0.75, 0.778), BRANCO)
    caixa('rede', (0.015, 1.66, 0.15), (0, 0, 0.85), mat('rede', '#F0EAD6', 0, 0.9))
def cafe():
    caixa('balcao', (2.4, 0.65, 0.95), (0, 0, 0.475), BRANCO, ch=0.01); caixa('tampo', (2.48, 0.7, 0.04), (0, 0, 0.97), COMP, ch=0.006)
    caixa('maquina', (0.42, 0.38, 0.45), (-0.7, -0.08, 1.215), ALU, ch=0.02); caixa('maq_frente', (0.3, 0.01, 0.2), (-0.7, 0.115, 1.25), TELA_P)
    for i in range(5): cil('xicara', 0.04, 0.08, (-0.2 + i * 0.12, 0.15, 1.03), cor_mat(['#F0EAD6', '#2F5A4C', '#C9603F', '#E9B949', '#F0EAD6'][i], 0.35), v=16)
    cil('pote', 0.1, 0.22, (0.6, -0.1, 1.1), VIDRO, v=24); esfera('frutas', 0.08, (0.6, -0.1, 1.06), LARANJA, seg=12)
    caixa('geladeira', (0.65, 0.65, 1.85), (1.6, 0, 0.925), cor_mat('#E8E4DC', 0.25), ch=0.02); caixa('puxador', (0.03, 0.03, 0.5), (1.4, 0.33, 1.2), ALU)
def fliperama():
    caixa('gabinete', (0.6, 0.6, 1.75), (0, 0, 0.875), cor_mat('#20352F', 0.5), ch=0.01)
    caixa('tela', (0.48, 0.02, 0.4), (0, 0.3, 1.35), mat('tela_arcade', '#5FB6D9', 0, 0.2, emis_forca=1.6), rot=(0.25, 0, 0))
    caixa('painel', (0.6, 0.25, 0.06), (0, 0.38, 1.0), cor_mat('#C9603F', 0.4), rot=(0.3, 0, 0)); caixa('topo', (0.6, 0.02, 0.18), (0, 0.31, 1.68), AMARELO)
def arquibancada(w=4.4):
    cores = ['areia', 'terracota', 'salvia', 'verde', 'creme']
    for i in range(3):
        caixa('degrau', (w, 0.55, 0.38 * (i + 1)), (0, -i * 0.55, 0.19 * (i + 1)), COMP, ch=0.01)
        for k in range(5):
            if (i + k) % 2 == 0: caixa('almof', (0.6, 0.42, 0.07), (-w/2 + 0.5 + k * 0.85, -i * 0.55, 0.38 * (i + 1) + 0.035), TEC[cores[(i + k) % 5]], ch=0.03)
def estacao_vr(cor='#5FB6D9'):
    cil('pad', 0.55, 0.03, (0, 0, 0.015), cor_mat('#2B463E', 0.6), v=48); toro('anel', 0.52, 0.015, (0, 0, 0.035), mat('anel_luz' + cor, cor, 0, 0.3, emis_forca=2.0))
    caixa('suporte', (0.06, 0.06, 1.2), (0.62, -0.3, 0.6), PRETO); caixa('oculos', (0.18, 0.1, 0.08), (0.62, -0.3, 1.24), TELA_P, ch=0.02)
def impressoras():
    caixa('mesa', (1.8, 0.7, 0.04), (0, 0, 0.92), BRANCO);
    for sx in (-0.8, 0.8): caixa('pe', (0.05, 0.6, 0.9), (sx, 0, 0.45), PRETO)
    for dx in (-0.45, 0.45):
        caixa('imp', (0.42, 0.42, 0.5), (dx, 0, 1.19), PRETO, ch=0.01); caixa('vid', (0.36, 0.005, 0.38), (dx, 0.212, 1.19), VIDRO)
        caixa('peca', (0.1, 0.1, 0.12), (dx, 0.05, 1.03), LARANJA)
def cortadora():
    caixa('corpo', (1.2, 0.8, 0.95), (0, 0, 0.475), BRANCO, ch=0.015); caixa('tampa', (1.0, 0.6, 0.12), (0, 0, 1.01), mat('acrilico_laranja', '#E59A3C', 0, 0.1, vidro=True))
    caixa('painel', (0.25, 0.01, 0.15), (0.4, 0.405, 0.75), TELA_P)
def braco():
    caixa('base', (0.8, 0.8, 0.85), (0, 0, 0.425), cor_mat('#E8E4DC', 0.3), ch=0.01)
    cil('rot', 0.14, 0.12, (0, 0, 0.91), LARANJA); tubo('seg1', [(0, 0, 0.95), (0.05, 0, 1.45)], 0.06, LARANJA); tubo('seg2', [(0.05, 0, 1.45), (0.4, 0.05, 1.25)], 0.05, LARANJA)
    esfera('junta', 0.08, (0.05, 0, 1.45), TELA_P, seg=16); caixa('garra', (0.08, 0.12, 0.12), (0.42, 0.05, 1.15), TELA_P)
def bancada():
    caixa('tampo', (2.2, 0.75, 0.05), (0, 0, 0.92), COMP);
    for sx in (-1.0, 1.0): caixa('pe', (0.06, 0.65, 0.9), (sx, 0, 0.45), PRETO)
    caixa('painel', (2.2, 0.03, 1.0), (0, -0.36, 1.45), cor_mat('#E5CF9F', 0.7))
    for i, (c, x, z, w, h) in enumerate([('#C9603F', -0.8, 1.6, 0.05, 0.25), ('#4F86C6', -0.6, 1.55, 0.04, 0.3), ('#20352F', -0.35, 1.5, 0.2, 0.04), ('#E9B949', 0, 1.6, 0.06, 0.2), ('#3FA7A0', 0.3, 1.45, 0.25, 0.05), ('#20352F', 0.6, 1.6, 0.03, 0.28)]):
        caixa('ferr', (w, 0.03, h), (x, -0.33, z), cor_mat(c, 0.4))
    caixa('caixa_ferr', (0.4, 0.25, 0.18), (-0.6, 0.1, 1.03), cor_mat('#C9603F', 0.4), ch=0.01); caixa('placa', (0.4, 0.3, 0.01), (0.3, 0.05, 0.95), cor_mat('#3F7A4A', 0.4))
def estoque():
    estante(1.8, 1.9, 0.5, livros=False)
    for zi, z in enumerate((0.03, 0.5, 0.97)):
        for i in range(3): caixa('caixa', (0.4, 0.38, 0.3), (-0.6 + i * 0.6, 0, z + 0.16), cor_mat(['#D9B98C', '#C5AA81', '#E8E4DC'][(i + zi) % 3], 0.8))
def recepcao():
    caixa('balcao', (2.6, 0.7, 1.08), (0, 0, 0.54), BRANCO, ch=0.02); caixa('frente', (2.62, 0.02, 0.5), (0, 0.36, 0.55), COMP)
    caixa('tampo', (2.7, 0.78, 0.04), (0, 0, 1.1), COMP, ch=0.008)
    caixa('notebook', (0.34, 0.24, 0.015), (-0.4, -0.05, 1.13), ALU); caixa('nb_tela', (0.34, 0.01, 0.22), (-0.4, -0.17, 1.24), TELA_P, rot=(-0.25, 0, 0))
    caixa('letreiro', (0.9, 0.02, 0.16), (0.5, 0.37, 0.78), VERDE)
def bike():
    R = 0.33
    for dx in (-0.52, 0.52):
        toro('pneu', R, 0.025, (dx, 0, R + 0.025), PRETO, rot=(math.pi/2, 0, 0)); toro('aro', R - 0.03, 0.008, (dx, 0, R + 0.025), ALU, rot=(math.pi/2, 0, 0))
    y0 = R + 0.025
    for a, b in [((-0.52, 0, y0), (0, 0, y0)), ((0, 0, y0), (-0.15, 0, y0 + 0.55)), ((-0.52, 0, y0), (-0.15, 0, y0 + 0.55)), ((-0.15, 0, y0 + 0.55), (0.38, 0, y0 + 0.6)), ((0, 0, y0), (0.38, 0, y0 + 0.6)), ((0.52, 0, y0), (0.4, 0, y0 + 0.75))]:
        tubo('quadro', [a, b], 0.018, AMARELO)
    caixa('selim', (0.22, 0.08, 0.04), (-0.17, 0, y0 + 0.6), PRETO, ch=0.015); tubo('guidao', [(0.4, -0.22, y0 + 0.77), (0.4, 0.22, y0 + 0.77)], 0.014, PRETO)
def bicicletario():
    for i in range(3):
        antes = set(bpy.data.objects); bike(); novos = [o for o in bpy.data.objects if o not in antes]
        vz = bpy.data.objects.new('bk', None); bpy.context.collection.objects.link(vz)
        for o in novos: o.parent = vz
        vz.location = (i * 0.45 - 0.45, 0, 0); vz.rotation_euler = (0, 0, math.pi/2)
    caixa('suporte', (1.5, 0.04, 0.04), (0, -0.55, 0.35), ALU)
def moodboard(w=2.6):
    caixa('painel', (w, 0.05, 1.6), (0, 0, 1.25), cor_mat('#F7F4EE', 0.8))
    cores = ['#20352F', '#F0EAD6', '#C5AA81', '#C95C8A', '#3FA7A0', '#E59A3C', '#4F86C6', '#E9B949']
    for i in range(10):
        caixa('foto', (0.45 + (i % 3) * 0.08, 0.01, 0.35 + (i % 2) * 0.1), (-w/2 + 0.35 + (i % 5) * 0.48, 0.03, 0.8 + (i // 5) * 0.62 + (i % 2) * 0.05), cor_mat(cores[i % 8], 0.6))
    for s in (-w/2 + 0.1, w/2 - 0.1): caixa('pe', (0.06, 0.5, 0.06), (s, 0, 0.03), PRETO); caixa('poste', (0.05, 0.05, 0.5), (s, 0, 0.25), PRETO)
def tripe():
    for k in range(3):
        a = k / 3 * math.tau; tubo('perna', [(math.cos(a) * 0.35, math.sin(a) * 0.35, 0), (0, 0, 1.3)], 0.012, PRETO)
    caixa('camera', (0.16, 0.12, 0.1), (0, 0, 1.38), TELA_P, ch=0.02); cil('lente', 0.04, 0.08, (0, 0.09, 1.38), PRETO, rot=(math.pi/2, 0, 0), v=16)
def tapete_area(w, h, cor):
    caixa('tapete', (w, h, 0.012), (0, 0, 0.006), mat('tap' + cor, cor, 0, 0.98, sheen=0.4), ch=0.004)
def jardineira(w=2.4, n=5):
    caixa('caixa', (w, 0.42, 0.55), (0, 0, 0.275), COMP, ch=0.01); caixa('terra', (w - 0.06, 0.36, 0.02), (0, 0, 0.55), TERRA)
    for i in range(n):
        x = -w/2 + 0.3 + i * (w - 0.6) / max(1, n - 1)
        for j in range(3):
            esfera('moita', 0.2 + 0.05 * ((i + j) % 3), (x + (j - 1) * 0.12, (j % 2) * 0.08 - 0.04, 0.68 + 0.08 * j), FOLHA if (i + j) % 2 else FOLHA2, esc=(1, 0.9, 0.85), seg=14)
        if i % 2 == 0: tubo('haste', [(x, 0, 0.55), (x + 0.05, 0.02, 1.15)], 0.01, FOLHA); esfera('topo', 0.13, (x + 0.05, 0.02, 1.2), FOLHA2, seg=12)
def quadro(w=1.2, h=0.8, cor='#C9603F'):
    caixa('moldura', (w, 0.03, h), (0, 0, 0), cor_mat('#2B2B2B', 0.5)); caixa('arte', (w - 0.1, 0.01, h - 0.1), (0, 0.018, 0), cor_mat(cor, 0.7))
    caixa('forma', ((w - 0.1) * 0.45, 0.012, (h - 0.1) * 0.6), ((w - 0.1) * 0.15, 0.022, -(h - 0.1) * 0.1), cor_mat('#F0EAD6', 0.7))
def luminaria_pend(alt=2.4):
    cil('cabo', 0.006, AL - alt, (0, 0, (AL + alt) / 2), PRETO, v=8); cil('cupula', 0.26, 0.28, (0, 0, alt), PRETO, v=40, r2=0.03); esfera('lamp', 0.06, (0, 0, alt - 0.12), LUZ, seg=14)

# ---------------- piso, paredes, janelas ----------------
bpy.ops.mesh.primitive_plane_add(size=1, location=(X/2, Y/2, 0)); piso = bpy.context.object; piso.name = 'piso'; piso.scale = (X, Y, 1)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); liga(piso, CARV); uv_plano(piso, 'x', 'y', -X/2, 4, -Y/2, 4)
# ---------------- entorno: o lab é um deck solto num campus (fica desfocado no pós) ----------------
import random; random.seed(30)
GRAMA = mat('grama', '#8FAE6A', 0, 0.9, sheen=0.3); CONCRETO = mat('concreto', '#D9D4C9', 0, 0.8); ASFALTO = mat('asfalto', '#55595A', 0, 0.85)
FACHADA = mat('fachada', '#BFD3DA', 0.3, 0.12); PREDIO = mat('predio', '#E9E5DD', 0, 0.7)
caixa('grama', (260, 220, 0.1), (X/2, Y/2, -0.17), GRAMA)
caixa('deck_borda', (X + 0.3, Y + 0.3, 0.12), (X/2, Y/2, -0.066), COMP)
for (cx, cy, w, h) in ((X/2, -2.3, X + 8, 3.0), (X/2, Y + 2.3, X + 8, 3.0), (-2.3, Y/2, 3.0, Y + 1.6), (X + 2.3, Y/2, 3.0, Y + 1.6)):
    caixa('caminho', (w, h, 0.04), (cx, cy, -0.1), CONCRETO)
caixa('rua', (X + 70, 9, 0.04), (X/2 + 6, Y + 13, -0.1), ASFALTO)
for i in range(14): caixa('faixa_rua', (2.0, 0.18, 0.005), (X/2 - 26 + i * 5, Y + 13, -0.075), BRANCO)
RUA = {'faixas': [Y + 11.4, Y + 14.6], 'x0': X/2 + 6 - (X + 70)/2, 'x1': X/2 + 6 + (X + 70)/2}
ARVORES = []
def arvore(x, y, s=1.0):
    ARVORES.append({'x': round(x, 2), 'y': round(y, 2), 's': round(s, 2), 'v': len(ARVORES) % 3})
def arvore_dentro(x, y, s=1.0):
    cil('tronco', 0.18 * s, 2.4 * s, (x, y, 1.1 * s), mat('tronco', '#6B5440', 0, 0.85), v=10)
    for k in range(3): esfera('copa', (1.5 - k * 0.25) * s, (x + (k - 1) * 0.5 * s, y + ((k * 7) % 3 - 1) * 0.4 * s, (3.2 + k * 0.6) * s), FOLHA if k % 2 else FOLHA2, seg=14)
def arbusto(x, y, s=1.0): esfera('arbusto', 0.6 * s, (x, y, 0.3 * s), FOLHA2, esc=(1.2, 1, 0.75), seg=12)
# atrás do lab (topo da tela): árvores altas e prédios
for i in range(18): arvore(-6 - random.random() * 14, -6 + i * 3.4 + random.random(), 0.9 + random.random() * 0.5)
for i in range(22): arvore(-4 + i * 3.2 + random.random(), -6 - random.random() * 12, 0.9 + random.random() * 0.5)
for (px, py, w, d, h) in ((-26, 6, 12, 14, 14), (-26, 26, 12, 12, 10), (6, -24, 18, 10, 16), (30, -24, 16, 10, 12), (-14, -22, 10, 10, 20)):
    caixa('predio', (w, d, h), (px, py, h / 2 - 0.1), PREDIO)
    for f in range(int(h // 3.2)):
        caixa('faixa_vidro', (w + 0.04, d + 0.04, 1.6), (px, py, 1.6 + f * 3.2), FACHADA)
# na frente (base da tela): só coisa baixa
for i in range(30):
    x, y = random.choice([(X + 5 + random.random() * 14, random.random() * (Y + 10)), (random.random() * (X + 10), Y + 5 + random.random() * 4)])
    arbusto(x, y, 0.6 + random.random() * 0.6)
for i in range(6): arvore(X + 10 + i * 1.1, -2 + i * 5.2, 0.8)
for i in range(4):
    caixa('banco', (1.8, 0.5, 0.45), (X + 4.5, 4 + i * 6, 0.12), COMP, ch=0.03)
# escultura V30 no gramado, atrás do lab
caixa('plinto', (0.9, 4.6, 0.25), (-3.4, 13.0, 0.0), CONCRETO)
for corpo, tam, z, ext in (('V30', 2.4, 1.1, 0.35),):
    bpy.ops.object.text_add(location=(-3.4, 13.0, z + 0.05)); tx = bpy.context.object; tx.data.body = corpo; tx.data.size = tam; tx.data.extrude = ext
    tx.data.align_x = 'CENTER'; tx.data.align_y = 'CENTER'; tx.rotation_euler = (math.pi/2, 0, math.pi * 0.75); bpy.ops.object.convert(target='MESH'); liga(tx, VERDE if tam > 1 else AREIA)

# ---------------- áreas ----------------
ZONAS = {
 'estrategia':(1.5, 1.5, 8.5, 6.5, '#D46A47'), 'planejamento':(11.5, 1.5, 8.5, 6.5, '#4F86C6'), 'comercial':(21.5, 1.5, 7.5, 6.5, '#7FB069'),
 'arquivo':(30.5, 1.5, 5.5, 6.5, '#A88A5C'), 'reuniao':(37.5, 1.5, 6.0, 7.0, '#5FA9C2'),
 'marca':(1.5, 10.5, 8.5, 6.5, '#C95C8A'), 'trafego':(11.5, 10.5, 9.5, 7.0, '#E9B949'), 'cx':(22.5, 10.5, 7.5, 6.5, '#3FA7A0'), 'produto':(31.5, 10.5, 12.0, 7.0, '#E59A3C'),
 'dados':(1.5, 19.5, 8.5, 5.5, '#8E7CC3'), 'academia':(11.5, 19.5, 9.5, 5.5, '#5FB6D9'), 'lounge':(22.5, 19.5, 11.0, 5.5, '#B98B5E'), 'atendimento':(35.0, 19.5, 8.5, 5.5, '#6FAE9E'),
}
def mistura(a, b, t):
    pa = [int(a[i:i+2], 16) for i in (1, 3, 5)]; pb = [int(b[i:i+2], 16) for i in (1, 3, 5)]
    return '#' + ''.join('%02x' % round(pa[i] * (1 - t) + pb[i] * t) for i in range(3))
for z, (x0, y0, w, h, cor) in ZONAS.items():
    peca('tapete_' + z, x0 + w/2, y0 + h/2, 0, lambda w=w, h=h, cor=cor: tapete_area(w - 0.2, h - 0.2, mistura(cor, '#E9E2D2', 0.72)), obst=False)
def mesas(z, n=3, telas=2, dy=2.2, x1=1.5, passo=2.05):
    x0, y0 = ZONAS[z][:2]
    for i in range(n):
        vz = peca(f'mesa_{z}_{i}', x0 + x1 + i * passo, y0 + dy, 0, lambda i=i: mesa_trabalho(telas, 1.5, tela_mat=i), info='mesa')
        peca(f'cadeira_{z}_{i}', x0 + x1 + i * passo, y0 + dy + 0.66, 0, lambda i=i: cadeira_escritorio(['#2E3236', '#3B4A44', '#4A3F36'][i % 3]), obst=False, info='cadeira')
        ponto('mesa_' + z, loc(vz, 0, 0.66), 'n')
def P(z, dx, dy): x0, y0 = ZONAS[z][:2]; return x0 + dx, y0 + dy

# estratégia
mesas('estrategia'); peca('lousa_estrategia', *P('estrategia', 7.2, 1.1), 0, lousa, info='lousa')
peca('planta_e1', *P('estrategia', 0.5, 0.5), 0, lambda: planta(1.5)); peca('pufe_e1', *P('estrategia', 6.6, 4.9), 0, lambda: pufe('terracota')); peca('pufe_e2', *P('estrategia', 7.5, 5.4), 0, lambda: pufe('areia'))
peca('mesa_c_e', *P('estrategia', 7.4, 4.3), 0, lambda: mesa_centro(0.34))
# planejamento
mesas('planejamento', x1=1.6)
vz = peca('mesa_projetos', *P('planejamento', 6.5, 4.4), 0, mesa_projetos, info='mesa_projetos'); ponto('mesa_projetos', loc(vz, 0, 1.15), 'n')
peca('estante_p', *P('planejamento', 6.9, 0.4), 0, estante); peca('planta_p1', *P('planejamento', 8.1, 2.2), 0, lambda: planta(1.2, 0.26, 8, 1))
# comercial
mesas('comercial', x1=1.8)
peca('mesa_alta_c', *P('comercial', 5.6, 4.7), 0, mesa_alta, info='mesa_cliente')
peca('banq_c1', *P('comercial', 4.9, 5.3), 0, lambda: banqueta('verde')); peca('banq_c2', *P('comercial', 6.3, 5.3), 0, lambda: banqueta('terracota'))
peca('planta_c1', *P('comercial', 6.9, 0.5), 0, lambda: planta(1.4))
# arquivo
peca('arquivos', *P('arquivo', 0.6, 0.6), 0, lambda: arquivo(5), info='arquivos')
vz = peca('mesa_arquivo', *P('arquivo', 2.6, 3.0), 0, lambda: mesa_trabalho(1), info='mesa'); ponto('mesa_arquivo', loc(vz, 0, 0.66), 'n')
peca('cadeira_arquivo', *P('arquivo', 2.6, 3.66), 0, cadeira_escritorio, obst=False, info='cadeira')
peca('estante_a', *P('arquivo', 4.9, 3.6), 90, lambda: estante(1.6, 2.0, 0.4))
# reunião
vz = peca('mesa_reuniao', *P('reuniao', 3.0, 3.6), 0, mesa_reuniao, info='mesa_reuniao')
for i in range(4): ponto('reuniao', loc(vz, -1.35 + i * 0.9, 0.95), 'n')
for i in range(4): ponto('reuniao', loc(vz, -1.35 + i * 0.9, -0.95), 's')
vz = peca('tv_reuniao', *P('reuniao', 3.0, 0.6), 0, tv_parede, obst=True, info='tela_reuniao'); tela('reuniao', vz, 0, 0.036, 1.8, 2.32, 1.27)
peca('planta_r1', *P('reuniao', 5.5, 0.5), 0, lambda: planta(1.3)); peca('planta_r2', *P('reuniao', 0.4, 6.4), 0, lambda: planta(1.0, 0.24))
peca('pend_r', *P('reuniao', 3.0, 3.6), 0, lambda: luminaria_pend(2.5), obst=False)
# marca
mesas('marca'); peca('moodboard', *P('marca', 6.9, 0.9), 0, moodboard, info='moodboard')
peca('tripe', *P('marca', 7.6, 4.0), 0, tripe); peca('sofa_m', *P('marca', 2.6, 5.4), 0, lambda: sofa(2.0, 'lilas'))
peca('planta_m1', *P('marca', 0.5, 6.0), 0, lambda: planta(1.3, 0.28, 9, 2))
# tráfego: hub central
vz = peca('totem_trafego', *P('trafego', 4.75, 0.8), 0, lambda: totem(3.4, 1.9), info='totem'); tela('trafego', vz, 0, 0.061, 0.9 + 0.95, 3.4, 1.9)
vz = peca('mesa_trafego', *P('trafego', 4.75, 3.0), 0, lambda: mesa_trabalho(3, 2.2), info='mesa'); ponto('mesa_trafego', loc(vz, 0, 0.66), 'n')
peca('cadeira_trafego', *P('trafego', 4.75, 3.66), 0, lambda: cadeira_escritorio('#3B4A44'), obst=False, info='cadeira'); ponto('entrega_trafego', loc(vz, 0.9, 1.5), 'n')
peca('mesa_alta_t1', *P('trafego', 1.3, 5.4), 0, mesa_alta); peca('banq_t1', *P('trafego', 0.7, 6.0), 0, banqueta); peca('banq_t2', *P('trafego', 1.9, 6.1), 0, lambda: banqueta('salvia'))
peca('mesa_alta_t2', *P('trafego', 8.2, 5.4), 0, mesa_alta); peca('banq_t3', *P('trafego', 8.8, 6.0), 0, lambda: banqueta('terracota'))
peca('planta_t1', *P('trafego', 0.5, 0.6), 0, lambda: planta(1.7, 0.32)); peca('planta_t2', *P('trafego', 9.0, 0.6), 0, lambda: planta(1.5, 0.3, 10, 2))
# CX: mesas e gôndola de loja
mesas('cx', x1=1.6); peca('gondola', *P('cx', 5.6, 5.2), 0, gondola, info='gondola'); peca('planta_x1', *P('cx', 7.0, 0.5), 0, lambda: planta(1.2))
# lab de prototipagem
peca('impressoras', *P('produto', 1.6, 0.8), 0, impressoras, info='impressoras'); peca('cortadora', *P('produto', 4.4, 0.9), 0, cortadora, info='laser')
peca('braco', *P('produto', 6.6, 0.9), 0, braco, info='braco'); peca('bancada', *P('produto', 9.4, 0.9), 0, bancada, info='bancada')
mesas('produto', dy=4.4, x1=1.8); peca('estoque', *P('produto', 10.4, 4.8), 0, estoque, info='estoque'); peca('planta_l1', *P('produto', 7.4, 6.3), 0, lambda: planta(1.1, 0.26))
# dados
mesas('dados', dy=2.2); vz = peca('tela_dados', *P('dados', 6.9, 0.9), 0, lambda: totem(2.4, 1.4), info='tela_dados'); tela('dados', vz, 0, 0.061, 0.9 + 0.7, 2.4, 1.4)
peca('planta_d1', *P('dados', 0.5, 4.8), 0, lambda: planta(1.4))
# academia
peca('arquibancada', *P('academia', 4.75, 1.4), 0, arquibancada, info='arquibancada')
for i in range(3):
    vz = peca(f'vr_{i}', *P('academia', 1.6 + i * 3.1, 3.9), 0, lambda i=i: estacao_vr(['#5FB6D9', '#7FB069', '#E9B949'][i]), obst=False, info='vr'); ponto('treino', loc(vz, 0, 0), 'n')
peca('planta_ac1', *P('academia', 9.0, 0.5), 0, lambda: planta(1.3))
# lounge
vz = peca('pingpong', *P('lounge', 2.3, 2.6), 0, pingpong, info='pingpong'); ponto('pingpong', loc(vz, -1.75, 0), 'e'); ponto('pingpong', loc(vz, 1.75, 0), 'o')
vz = peca('sofa_l', *P('lounge', 6.3, 4.3), 0, lambda: sofa(2.4, 'salvia')); peca('mesa_c_l', *P('lounge', 6.3, 3.1), 0, mesa_centro)
for i in range(3): ponto('sofa', loc(vz, -0.7 + i * 0.7, 0.8), 'n')
vz = peca('cafe', *P('lounge', 9.0, 0.9), 0, cafe, info='cafe')
for i in range(3): ponto('cafe', loc(vz, -1.0 + i * 0.7, 0.85), 'n')
peca('fliperama', *P('lounge', 5.6, 0.7), 0, fliperama, info='fliperama'); peca('fliperama2', *P('lounge', 6.3, 0.7), 0, fliperama, info='fliperama')
peca('pufe_l1', *P('lounge', 4.6, 3.9), 0, lambda: pufe('areia')); peca('pufe_l2', *P('lounge', 8.2, 3.6), 0, lambda: pufe('terracota')); peca('pufe_l3', *P('lounge', 4.4, 4.9), 0, lambda: pufe('verde'))
peca('planta_lo1', *P('lounge', 0.5, 4.9), 0, lambda: planta(1.6, 0.32)); peca('pend_l', *P('lounge', 6.3, 3.4), 0, lambda: luminaria_pend(2.3), obst=False)
# atendimento
vz = peca('recepcao', *P('atendimento', 3.0, 2.2), 0, recepcao, info='balcao'); ponto('clara', loc(vz, 0, -0.8), 's'); ponto('cliente', loc(vz, 0, 1.0), 'n')
peca('sofa_espera', *P('atendimento', 2.2, 4.5), 180, lambda: sofa(2.0, 'areia'))
peca('bicicletario', *P('atendimento', 7.4, 1.4), 0, bicicletario, info='bicicletario'); peca('planta_at1', *P('atendimento', 0.5, 0.5), 0, lambda: planta(1.5))
peca('planta_at2', *P('atendimento', 6.0, 4.9), 0, lambda: planta(1.2, 0.26, 9, 1))

# divisórias verdes nas bordas das áreas e arte nas paredes
for z, (x0, y0, w, h, cor) in ZONAS.items():
    if z in ('arquivo', 'reuniao'): continue
    peca('jard_' + z, x0 + w - 1.5, y0 + h - 0.3, 0, lambda: jardineira(2.4, 4))
for (lx, ly) in ((15.75, 14.0), (17.0, 14.0), (14.5, 14.0), (40.5, 5.1), (27.8, 22.0), (34.5, 4.8)):
    peca('pend', lx, ly, 0, lambda: luminaria_pend(2.7), obst=False)

# salas de vidro, como num escritório de verdade, e árvores grandes no open space
def parede_vidro(comp, alt=2.5):
    caixa('vidro', (comp, 0.03, alt), (0, 0, alt/2), VIDRO)
    caixa('trilho_b', (comp, 0.06, 0.06), (0, 0, 0.03), ALU); caixa('trilho_t', (comp, 0.06, 0.06), (0, 0, alt), ALU)
    n = max(1, round(comp / 1.25))
    for i in range(n + 1): caixa('montante', (0.04, 0.05, alt), (-comp/2 + i * comp / n, 0, alt/2), ALU)
def sala(nome, x0, y0, x1, y1, portas):
    # portas: lista de (lado, centro) com vão de 1,3 m; lados: 'n' (y0), 's' (y1), 'o' (x0), 'l' (x1)
    for lado in 'nsol':
        if lado in 'ns': a, b, fixo, rot = x0, x1, (y0 if lado == 'n' else y1), 0
        else: a, b, fixo, rot = y0, y1, (x0 if lado == 'o' else x1), 90
        cortes = sorted(c for l, c in portas if l == lado); ini = a
        for c in cortes + [None]:
            fim = b if c is None else c - 0.65
            if fim - ini > 0.3:
                meio = (ini + fim) / 2; comp = fim - ini
                if rot == 0: peca(f'{nome}_{lado}_{ini:.1f}', meio, fixo, 0, lambda comp=comp: parede_vidro(comp), margem=0.08)
                else: peca(f'{nome}_{lado}_{ini:.1f}', fixo, meio, 90, lambda comp=comp: parede_vidro(comp), margem=0.08)
            if c is not None: ini = c + 0.65
sala('sala_reuniao', 37.3, 1.3, 43.7, 8.7, [('s', 40.2), ('o', 6.0)])
sala('sala_lab', 31.3, 10.3, 43.7, 17.7, [('s', 37.0), ('o', 14.0), ('n', 33.5)])
def figueira(alt=4.2):
    cil('vaso', 0.75, 0.55, (0, 0, 0.275), COMP, v=48, r2=0.7); cil('terra', 0.7, 0.02, (0, 0, 0.55), TERRA, v=32)
    tubo('tronco', [(0, 0, 0.5), (0.1, 0.05, alt * 0.45), (-0.05, 0, alt * 0.7)], 0.09, mat('tronco_d', '#7A6248', 0, 0.8))
    import random as _r; g = _r.Random(int(alt * 100))
    for k in range(26):
        a_ = g.random() * math.tau; rr = g.random() ** 0.6 * 0.95; z = alt * (0.62 + g.random() * 0.36)
        esfera('folhas', 0.28 + g.random() * 0.22, (math.cos(a_) * rr, math.sin(a_) * rr, z), FOLHA if k % 3 else FOLHA2, esc=(1, 1, 0.85), seg=12)
for (fx, fy) in ((10.75, 9.25), (21.0, 9.25), (21.75, 18.5), (30.75, 18.5)):
    peca(f'figueira_{fx}', fx, fy, 0, figueira, margem=0.1)
# ---------------- câmera isométrica que enquadra o lab ----------------
el, az = math.radians(30), math.radians(45)
d = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))
alvo0 = Vector((X/2, Y/2, 0))
cam_d = bpy.data.cameras.new('cam'); camo = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(camo); cena.camera = camo
cam_d.type = 'ORTHO'; cam_d.clip_start = 1; cam_d.clip_end = 300
camo.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
bpy.context.view_layer.update()
R = camo.matrix_world.to_3x3() @ Vector((1, 0, 0)); U = camo.matrix_world.to_3x3() @ Vector((0, 1, 0))
cantos = [Vector((a, b, c)) for a in (-0.3, X) for b in (-0.3, Y) for c in (-0.2, 2.6)]
us = [p.dot(R) for p in cantos]; vs = [p.dot(U) for p in cantos]
marg = 4.5
umin, umax, vmin, vmax = min(us) - marg, max(us) + marg, min(vs) - marg, max(vs) + marg
centro = R * ((umin + umax) / 2) + U * ((vmin + vmax) / 2)
DIST = 90.0
camo.location = centro + d * DIST
larg = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
k = larg / (umax - umin)
alt_px = int(round((vmax - vmin) * k))
cam_d.ortho_scale = umax - umin
cena.render.resolution_x = larg; cena.render.resolution_y = alt_px
info = {'X': X, 'Y': Y, 'AL': AL, 'k': k, 'larg': larg, 'alt': alt_px, 'R': list(R), 'U': list(U), 'D': list(d), 'centro': list(centro), 'dist': DIST,
        'prof': [20.0, 130.0], 'zonas': {z: v[:4] for z, v in ZONAS.items()}, 'obst': [[round(v, 3) for v in r] for r in OBST], 'pontos': PONTOS, 'telas': TELAS, 'objetos': OBJETOS, 'arvores': ARVORES, 'rua': RUA}
json.dump(info, open(os.path.join(AQUI, 'lab.json'), 'w'))
if MODO == 'json': print('JSON OK'); sys.exit(0)

# ---------------- luz ----------------
mundo = bpy.data.worlds.new('mundo'); cena.world = mundo; mundo.use_nodes = True
bg = mundo.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hx('#DDE7EC'); bg.inputs['Strength'].default_value = 0.55
bpy.ops.object.light_add(type='SUN'); sol = bpy.context.object; sol.data.energy = 5.0; sol.data.angle = math.radians(4); sol.data.color = hx('#FFF0DC')[:3]
sol.rotation_euler = (math.radians(55), 0, math.radians(-25))
for (ax, ay) in ((11, 7), (33, 7), (11, 19), (33, 19)):
    bpy.ops.object.light_add(type='AREA', location=(ax, ay, 8)); a = bpy.context.object; a.data.energy = 3400; a.data.size = 12; a.data.color = hx('#FFF6EA')[:3]
cena.render.engine = 'CYCLES'; cena.cycles.device = 'CPU'
cena.cycles.samples = int(sys.argv[2]) if len(sys.argv) > 2 else 64
cena.cycles.use_denoising = True; cena.cycles.max_bounces = 5
cena.render.film_transparent = False
cena.view_settings.view_transform = 'AgX'; cena.view_settings.look = 'AgX - Base Contrast'
# profundidade: passe Z mapeado de [30, 110] m para 0..1 em PNG de 16 bits
vl = cena.view_layers[0]; vl.use_pass_z = True
cena.use_nodes = True; nt = cena.node_tree
for n in list(nt.nodes): nt.nodes.remove(n)
rl = nt.nodes.new('CompositorNodeRLayers'); comp = nt.nodes.new('CompositorNodeComposite')
nt.links.new(rl.outputs['Image'], comp.inputs['Image'])
mr = nt.nodes.new('CompositorNodeMapRange'); mr.inputs[1].default_value = 20.0; mr.inputs[2].default_value = 130.0; mr.inputs[3].default_value = 0.0; mr.inputs[4].default_value = 1.0; mr.use_clamp = True
nt.links.new(rl.outputs['Depth'], mr.inputs[0])
fo = nt.nodes.new('CompositorNodeOutputFile'); fo.base_path = AQUI; fo.file_slots[0].path = 'lab_prof_'
fo.format.file_format = 'PNG'; fo.format.color_mode = 'BW'; fo.format.color_depth = '16'
nt.links.new(mr.outputs[0], fo.inputs[0])
cena.render.filepath = os.path.join(AQUI, 'lab.png')
cena.frame_set(1)
bpy.ops.render.render(write_still=True); print('RENDER OK', larg, alt_px)
