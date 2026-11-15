# Pessoas do Lab V30 feitas no MPFB (MakeHuman), animadas com a Universal Animation Library (CC0)
# e renderizadas na mesma câmera e luz do render do lab.
#   ../blendenv/bin/python gente_mpfb.py teste rui        -> quadros de teste em /home/claude/pessoas
#   ../blendenv/bin/python gente_mpfb.py sprites [ids]    -> quadros em /home/claude/pessoas/q/<id>/
#   ../blendenv/bin/python gente_mpfb.py retratos [ids]   -> retrato na estação em /home/claude/pessoas/r/<id>.png
#   ../blendenv/bin/python gente_mpfb.py mesas [ids]      -> cena da mesa, com objetos e mural, em /home/claude/pessoas/m/<id>_<quadro>.png
import sys, os, math, json
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_bpy.py')).read())
exec(open(os.path.join(AQUI, 'moveis_bpy.py')).read())
from mathutils import Vector, Matrix, Quaternion
from bpy_extras.object_utils import world_to_camera_view
sys.path.insert(0, '/home/claude/savior-lps/arte')
from pessoa_mpfb import monta
for _m in MATS.values(): _m.use_fake_user = True
from elenco import ELENCO, CADEIRA

MODO = sys.argv[1] if len(sys.argv) > 1 else 'teste'
SO = sys.argv[2:]
SAIDA = '/home/claude/pessoas'
LAB = json.load(open(os.path.join(AQUI, 'lab.json')))
ESCALA = 1.25
S = LAB['k'] * ESCALA * float(os.environ.get('ZOOM', '1'))            # pixels do sprite por metro
UAL = '/home/claude/assets_pesquisa/ual/x/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb'

# ---------------- animações de referência ----------------
bpy.ops.import_scene.gltf(filepath=UAL)
FONTE = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.parent == FONTE: bpy.data.objects.remove(o)
FONTE.animation_data_create()
ACOES = {a.name.replace('_Armature', ''): a for a in bpy.data.actions}

def ordem_ossos(arm):
    def prof(b): return 0 if b.parent is None else 1 + prof(b.parent)
    return sorted(arm.data.bones, key=prof)

FILHO = {'pelvis': 'spine_01', 'spine_01': 'spine_02', 'spine_02': 'spine_03', 'spine_03': 'neck_01', 'neck_01': 'head',
         'clavicle': 'upperarm', 'upperarm': 'lowerarm', 'lowerarm': 'hand', 'hand': 'middle_01',
         'thigh': 'calf', 'calf': 'foot', 'foot': 'ball'}

def direcao(arm, b, m):
    """Direção do osso até a cabeça do filho principal (o rabo do osso importado do glTF nem sempre aponta para ele)."""
    nome = b.name.lower(); lado = nome[-2:] if nome[-2:] in ('_l', '_r') else ''
    base = nome[:-2] if lado else nome
    alvo_f = FILHO.get(base)
    if alvo_f:
        filhos = {c.name.lower(): c for c in b.children}
        c = filhos.get(alvo_f + lado)
        if c: return (m @ c.head_local) - (m @ b.head_local)
    return (m @ b.tail_local) - (m @ b.head_local)

def moldura(d):
    """Base ortonormal com y na direção do osso e x apontando para a frente do corpo (-Y), ou para cima se o osso já aponta para a frente."""
    y = d.normalized(); ref = Vector((0, -1, 0))
    if abs(y.dot(ref)) > 0.8: ref = Vector((0, 0, 1))
    x = (ref - y * ref.dot(y)).normalized(); z = x.cross(y)
    return Matrix((x, y, z)).transposed().to_quaternion()

# Tronco copia só a variação em relação ao repouso. Casar a direção absoluta nesses ossos impunha ao MakeHuman
# a curva da coluna do esqueleto de referência, que é outra, e deixava todo mundo corcunda.
TRONCO = {'pelvis', 'spine_01', 'spine_02', 'spine_03'}

def prepara_alvo(alvo):
    """Calibra cada osso do alvo contra a fonte. Braços e pernas casam a direção do osso e a frente do corpo nas duas
    poses de repouso (o repouso da fonte é em T e o do alvo em A). O tronco mantém a curva do próprio alvo.
    As contas ficam no espaço da armadura do alvo, então girar o objeto gira a pessoa inteira."""
    mf, mi = FONTE.matrix_world, Matrix()
    nomes = {b.name.lower(): b.name for b in FONTE.data.bones}
    cal = {}
    for b in alvo.data.bones:
        nf = nomes.get(b.name.lower())
        if not nf: continue
        bf = FONTE.data.bones[nf]
        rf = (mf @ bf.matrix_local).to_quaternion()
        ra = b.matrix_local.to_quaternion()
        if b.name in TRONCO: casa = Quaternion()
        else: casa = moldura(direcao(FONTE, bf, mf)) @ moldura(direcao(alvo, b, mi)).inverted()
        cal[b.name] = (nf, rf.inverted() @ casa @ ra)
    pf = (mf @ FONTE.data.bones['pelvis'].head_local).z
    pa = alvo.data.bones['pelvis'].head_local.z
    return {'cal': cal, 'escala': pa / pf, 'ordem': ordem_ossos(alvo)}

ANDAR = dict(proprios=('neck_01', 'clavicle_l', 'clavicle_r'), nivela=0.85, inclina={'spine_02': -5, 'spine_03': -3})

def aplica(alvo, prep, acao, quadro, desloca=Vector((0, 0, 0)), proprios=('neck_01',), nivela=0.7, inclina={}):
    """Copia a pose da fonte no quadro dado para o alvo, osso a osso.
    proprios: ossos que só acompanham o pai, com a forma do repouso do alvo (a referência projeta o queixo
    e encolhe os ombros).
    nivela: quanto a cabeça volta para a orientação de repouso; a gente anda olhando para a frente, não para o chão.
    inclina: graus para a frente por osso, aplicados depois da cópia."""
    FONTE.animation_data.action = ACOES[acao]
    bpy.context.scene.frame_set(int(round(quadro)))
    mf = FONTE.matrix_world
    pose_m = {}
    for b in prep['ordem']:   # pais antes dos filhos
        pb = alvo.pose.bones[b.name]
        rel = None if b.parent is None else b.parent.matrix_local.inverted() @ b.matrix_local
        if b.name in prep['cal'] and b.name not in proprios and b.name != 'head':
            nf, off = prep['cal'][b.name]
            rot = (mf @ FONTE.pose.bones[nf].matrix).to_quaternion() @ off
        elif b.parent is None:
            rot = b.matrix_local.to_quaternion()
        else:
            rot = (pose_m[b.parent.name] @ rel).to_quaternion()
        if b.name == 'head' and nivela:
            rot = rot.slerp(b.matrix_local.to_quaternion(), nivela)
        if b.name in inclina:
            rot = Quaternion((1, 0, 0), math.radians(inclina[b.name])) @ rot
        if b.name == 'pelvis':
            pos = (mf @ FONTE.pose.bones['pelvis'].head) * prep['escala'] + desloca
        elif b.parent is None:
            pos = b.head_local.copy()
        else:
            pos = (pose_m[b.parent.name] @ rel).translation
        m = Matrix.Translation(pos) @ rot.to_matrix().to_4x4()
        pose_m[b.name] = m
        if b.parent is None: pb.matrix_basis = b.matrix_local.inverted() @ m
        else: pb.matrix_basis = rel.inverted() @ pose_m[b.parent.name].inverted() @ m
    bpy.context.view_layer.update()

# ---------------- em pé, parado ----------------
# O Idle da biblioteca tem peito caído e ombros para trás. Parado parte do repouso do MakeHuman, que é ereto,
# e só solta os braços ao lado do corpo. O segundo quadro é uma respiração.
def gira_osso(arm, nome, q):
    pb = arm.pose.bones[nome]; m = pb.matrix.copy()
    pb.matrix = Matrix.Translation(m.translation) @ (q @ m.to_quaternion()).to_matrix().to_4x4()
    bpy.context.view_layer.update()

def mira(arm, nome, filho, alvo_d):
    pb = arm.pose.bones[nome]; d = arm.pose.bones[filho].head - pb.head
    gira_osso(arm, nome, d.rotation_difference(Vector(alvo_d).normalized()))

def em_pe(arm, i=0):
    for pb in arm.pose.bones: pb.matrix_basis.identity()
    bpy.context.view_layer.update()
    if i: gira_osso(arm, 'spine_03', Quaternion((1, 0, 0), math.radians(-1.5)))
    for l, x in (('l', 1), ('r', -1)):
        mira(arm, 'upperarm_' + l, 'lowerarm_' + l, ((0.13 + 0.01 * i) * x, 0.02, -1))
        mira(arm, 'lowerarm_' + l, 'hand_' + l, (0.07 * x, -0.16, -1))
        mira(arm, 'hand_' + l, 'middle_01_' + l, (0.02 * x, -0.1, -1))

def comprimento(acao):
    a, b = ACOES[acao].frame_range
    return a, b

# ---------------- câmera e luz do lab ----------------
cena = bpy.context.scene
D = Vector(LAB['D'])
cam_d = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_d); cena.collection.objects.link(cam); cena.camera = cam
cam_d.type = 'ORTHO'; cam_d.clip_start = 0.1; cam_d.clip_end = 100
cam.rotation_euler = (-D).to_track_quat('-Z', 'Y').to_euler()
mundo = bpy.data.worlds.new('mundo'); cena.world = mundo; mundo.use_nodes = True
bg = mundo.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hx('#DDE7EC'); bg.inputs['Strength'].default_value = 0.55
bpy.ops.object.light_add(type='SUN'); sol = bpy.context.object; sol.data.energy = 5.0; sol.data.angle = math.radians(4); sol.data.color = hx('#FFF0DC')[:3]
sol.rotation_euler = (math.radians(55), 0, math.radians(-25))
bpy.ops.object.light_add(type='AREA', location=(-2.5, -2.0, 8)); luz = bpy.context.object; luz.data.energy = 3400; luz.data.size = 12; luz.data.color = hx('#FFF6EA')[:3]
cena.render.engine = 'CYCLES'; cena.cycles.device = 'CPU'; cena.cycles.samples = 48; cena.cycles.use_denoising = True
cena.cycles.max_bounces = 4; cena.render.film_transparent = True
cena.view_settings.view_transform = 'AgX'; cena.view_settings.look = 'AgX - Base Contrast'
cena.render.image_settings.file_format = 'PNG'; cena.render.image_settings.color_mode = 'RGBA'

def enquadra_sprite(alt=2.0, larg=1.3):
    """Câmera ortográfica do lab com o mesmo tamanho de pixel do sprite, centrada na pessoa."""
    largura_m = larg * 1.0
    alt_m = alt
    cam_d.ortho_scale = max(largura_m, alt_m)
    alvo = Vector((0, 0, alt * 0.42))
    cam.location = alvo + D * 20
    px = int(round(cam_d.ortho_scale * S))
    cena.render.resolution_x = px; cena.render.resolution_y = px
    bpy.context.view_layer.update()
    co = world_to_camera_view(cena, cam, Vector((0, 0, 0)))
    return px, co.x * px, (1 - co.y) * px

def render(caminho):
    cena.render.filepath = caminho
    bpy.ops.render.render(write_still=True)

# ---------------- cadeira e mesa ----------------
def objetos_novos(fn):
    antes = set(bpy.data.objects); fn(); return [o for o in bpy.data.objects if o not in antes]

def poe_cadeira(cor):
    novos = objetos_novos(lambda: cadeira_escritorio(cor))
    protege()
    return novos

def protege():
    # os materiais do cenário ficam no cache de base_bpy; o usuário falso evita que a limpeza os apague
    for m in MATS.values(): m.use_fake_user = True

def remove(objs):
    for o in objs:
        if o.name in bpy.data.objects: bpy.data.objects.remove(o, do_unlink=True)
    protege()
    for col in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.armatures):
        for x in list(col):
            if x.users == 0: col.remove(x)   # materiais do cenário têm usuário falso e ficam

# ---------------- pose sentada digitando ----------------
def senta_digitando(alvo, prep, quadro):
    """Usa o Sitting_Idle como base e leva as mãos ao teclado com IK."""
    a, b = comprimento('Sitting_Idle_Loop')
    # pernas da animação; pelve e coluna ficam no repouso (ereto), com uma leve inclinação para o teclado
    kw = dict(proprios=TRONCO | {'neck_01', 'clavicle_l', 'clavicle_r'}, nivela=0, inclina={'spine_01': 9, 'neck_01': 4})
    aplica(alvo, prep, 'Sitting_Idle_Loop', a + (b - a) * 0.25, **kw)
    # ajusta o quadril para sentar no meio do assento (topo a 0,485 m), perto da mesa
    coxa = alvo.pose.bones['thigh_l'].head
    aplica(alvo, prep, 'Sitting_Idle_Loop', a + (b - a) * 0.25, desloca=Vector((0, 0.0 - coxa.y, 0.56 - coxa.z)), **kw)

def ik_maos(alvo, quadro):
    vazios = []
    for lado, x in (('l', 1), ('r', -1)):
        alvo_ik = bpy.data.objects.new('ik_' + lado, None); cena.collection.objects.link(alvo_ik)
        z = 0.80 + (0.012 if (quadro + (lado == 'l')) % 2 else 0)
        alvo_ik.location = (0.14 * x, -0.42, z)
        polo = bpy.data.objects.new('polo_' + lado, None); cena.collection.objects.link(polo)
        polo.location = (0.3 * x, 0.3, 0.2)   # cotovelo para baixo e para trás, junto do corpo
        c = alvo.pose.bones['lowerarm_' + lado].constraints.new('IK')
        c.target = alvo_ik; c.pole_target = polo; c.chain_count = 2; c.pole_angle = math.radians(-90 if x > 0 else -90)
        vazios += [alvo_ik, polo]
    bpy.context.view_layer.update()
    return vazios

def tira_ik(alvo, vazios):
    for lado in 'lr':
        for nome in ('lowerarm_', 'hand_'):
            pb = alvo.pose.bones[nome + lado]
            for c in list(pb.constraints): pb.constraints.remove(c)
    remove(vazios)

# ---------------- execução ----------------
VISTAS = [(k, k * math.pi / 4) for k in range(8)]
POSES = {'parado': ('Idle_Loop', 2), 'andar': ('Walk_Formal_Loop', 4)}

def gira(arm, th):
    arm.rotation_euler = (0, 0, th); bpy.context.view_layer.update()

def pessoa(id):
    f = ELENCO[id]
    antes = set(bpy.data.objects)
    arm, corpo = monta(f, id)
    novos = [o for o in bpy.data.objects if o not in antes]
    return arm, novos

if MODO in ('teste', 'sprites'):
    ids = SO or list(ELENCO)
    for id in ids:
        arm, objs = pessoa(id)
        prep = prepara_alvo(arm)
        pasta = os.path.join(SAIDA, 'q', id); os.makedirs(pasta, exist_ok=True)
        px, ax, ay = enquadra_sprite()
        meta = {'px': px, 'ax': ax, 'ay': ay}
        vistas = [VISTAS[1], VISTAS[0]] if MODO == 'teste' else VISTAS
        for k, th in vistas:
            gira(arm, th)
            for pose, (acao, n) in POSES.items():
                a, b = comprimento(acao)
                for i in range(n):
                    if MODO == 'teste' and i > 0 and pose == 'parado': continue
                    if pose == 'parado': em_pe(arm, i)
                    else: aplica(arm, prep, acao, a + (b - a) * i / n, **ANDAR)
                    render(os.path.join(pasta, f'd{k}_{pose}{i}.png'))
        if id in CADEIRA:
            gira(arm, 0)
            cad = poe_cadeira(CADEIRA[id])
            for i in range(2):
                senta_digitando(arm, prep, i)
                vz = ik_maos(arm, i)
                render(os.path.join(pasta, f'd0_digitar{i}.png'))
                tira_ik(arm, vz)
            remove(cad)
        json.dump(meta, open(os.path.join(pasta, 'meta.json'), 'w'))
        remove(objs)
        print('PRONTO', id, flush=True)

if MODO == 'galeria':
    ids = SO or list(ELENCO)
    os.makedirs(os.path.join(SAIDA, 'g'), exist_ok=True)
    cam_d.ortho_scale = 2.1; cena.render.resolution_x = 420; cena.render.resolution_y = 520
    cam.location = Vector((0, 0, 0.95)) + Vector((0.45, -1, 0.25)).normalized() * 20
    cam.rotation_euler = (-Vector((0.45, -1, 0.25))).to_track_quat('-Z', 'Y').to_euler()
    for id in ids:
        arm, objs = pessoa(id); prep = prepara_alvo(arm)
        em_pe(arm)
        render(os.path.join(SAIDA, 'g', id + '.png')); remove(objs); print('PRONTO', id, flush=True)

if MODO == 'retratos':
    # rosto de frente (para os avatares) e a pessoa trabalhando na própria estação (para a ficha)
    ids = SO or list(ELENCO)
    os.makedirs(os.path.join(SAIDA, 'r'), exist_ok=True)
    cena.cycles.samples = 96
    chao = None
    bpy.ops.mesh.primitive_plane_add(size=8); chao = bpy.context.object; chao.is_shadow_catcher = True
    for id in ids:
        arm, objs = pessoa(id); prep = prepara_alvo(arm)
        # rosto
        em_pe(arm)
        cabeca = arm.matrix_world @ arm.pose.bones['head'].head
        alvo_c = cabeca + Vector((0, 0, 0.06)); dirc = Vector((0.35, -1, 0.12)).normalized()
        cam_d.ortho_scale = 0.42; cam.location = alvo_c + dirc * 10; cam.rotation_euler = (-dirc).to_track_quat('-Z', 'Y').to_euler()
        cena.render.resolution_x = cena.render.resolution_y = 256
        render(os.path.join(SAIDA, 'r', id + '_rosto.png'))
        if id in CADEIRA:
            mesa = objetos_novos(lambda: mesa_trabalho(2, 1.6, 0.72, len(id) % 3))
            for o in mesa: o.location.y -= 0.66
            mov = mesa + objetos_novos(lambda: cadeira_escritorio(CADEIRA[id]))
            senta_digitando(arm, prep, 0); vz = ik_maos(arm, 0)
            dire = Vector((-0.75, -0.62, 0.42)).normalized(); alvo_e = Vector((0.05, -0.4, 0.7))
            cam_d.ortho_scale = 2.5; cam.location = alvo_e + dire * 10; cam.rotation_euler = (-dire).to_track_quat('-Z', 'Y').to_euler()
            cena.render.resolution_x = 640; cena.render.resolution_y = 480
            render(os.path.join(SAIDA, 'r', id + '_estacao.png'))
            tira_ik(arm, vz); remove(mov)
        else:
            dire = Vector((0.5, -1, 0.3)).normalized(); alvo_e = Vector((0, 0, 0.9))
            cam_d.ortho_scale = 2.1; cam.location = alvo_e + dire * 10; cam.rotation_euler = (-dire).to_track_quat('-Z', 'Y').to_euler()
            cena.render.resolution_x = 640; cena.render.resolution_y = 480
            render(os.path.join(SAIDA, 'r', id + '_estacao.png'))
        remove(objs); print('PRONTO', id, flush=True)

if MODO == 'mesas':
    # A pessoa trabalhando na própria mesa, com o que a caracteriza em cima dela e o mural atrás.
    # São dois quadros por pessoa (as mãos alternam no teclado) para a tela animar. A câmera fica à direita e à frente de quem senta.
    exec(open(os.path.join(AQUI, 'pessoais_bpy.py')).read())
    ids = SO or list(ELENCO)
    os.makedirs(os.path.join(SAIDA, 'm'), exist_ok=True)
    cena.cycles.samples = int(os.environ.get('AMOSTRAS', '64')); cena.render.film_transparent = False
    cena.render.resolution_x = 1200; cena.render.resolution_y = 900
    dire = Vector((-0.9, -0.25, 0.42)).normalized(); alvo_e = Vector((0.3, -0.3, 1.31))
    cam_d.ortho_scale = 3.45; cam.location = alvo_e + dire * 10; cam.rotation_euler = (-dire).to_track_quat('-Z', 'Y').to_euler()
    luz.location = (-3.0, -1.5, 6); luz.data.energy = 2200
    cena.view_settings.exposure = -0.55; cena.view_settings.look = 'AgX - Medium High Contrast'
    # cenário fixo: piso de madeira e a parede do mural
    bpy.ops.mesh.primitive_plane_add(size=16, location=(0, 0, 0)); piso = bpy.context.object
    liga(piso, mat('carvalho', '#CDA87C', 0, 0.5, tex='carvalho.jpg', rug_tex='carvalho_rug.jpg')); uv_plano(piso, 'x', 'y', -8, 4, -8, 4)
    caixa('parede', (0.1, 9, 3.4), (1.45, -0.6, 1.7), mat('parede_mesa', '#E3DCCB', 0, 0.9)); caixa('rodape', (0.03, 9, 0.1), (1.385, -0.6, 0.05), cor_mat('#E4DFD4', 0.6))
    protege()
    MW, MH = 2.6, 2.6 * 920 / 1600
    def mural_de(id):
        tex = f'mural_{id}.png' if os.path.exists(os.path.join(TEX, f'mural_{id}.png')) else 'lousa.png'
        caixa('moldura_mural', (0.05, MW + 0.08, MH + 0.08), (1.385, -0.35, 1.45), cor_mat('#8A6A4A', 0.6))
        o = caixa('mural', (0.02, MW, MH), (1.36, -0.35, 1.45), mat('mural_' + tex, '#ffffff', 0, 0.8, tex=tex)); uv_plano(o, 'y', 'z', MW / 2, -MW, -MH / 2, MH)
    def tapete(cor): caixa('tapete', (2.6, 3.0, 0.012), (0.1, -0.45, 0.006), mat('tap' + cor, cor, 0, 0.98, sheen=0.4), ch=0.004)
    def balcao():
        caixa('balcao', (2.0, 0.6, 1.06), (0, 0, 0.53), BRANCO, ch=0.02); caixa('frente_b', (2.02, 0.02, 0.5), (0, -0.31, 0.55), COMP); caixa('tampo_b', (2.1, 0.68, 0.04), (0, 0, 1.08), COMP, ch=0.008)
    COR_TAPETE = ['#D9C7B4', '#C9D2C2', '#D8CDB0', '#CDBFA8']
    for n, id in enumerate(ids):
        arm, objs = pessoa(id); prep = prepara_alvo(arm)
        sentado = id in CADEIRA
        if sentado:
            cen = objetos_novos(lambda: mesa_trabalho(2, 1.6, 0.72, len(id) % 3)) + objetos_novos(lambda: pessoais(id, perto=True))
            for o in cen:
                if o.parent is None: o.location.y -= 0.66
            cen += objetos_novos(lambda: cadeira_escritorio(CADEIRA[id]))
        else:
            # quem trabalha de pé atende num balcão: o que é dela fica em cima dele
            cen = objetos_novos(balcao) + objetos_novos(lambda: pessoais(id, tampo=1.1, larg=2.0, fundo=0.0, perto=True))
            for o in cen:
                if o.parent is None: o.location.y -= 0.62
        cen += objetos_novos(lambda: mural_de(id)) + objetos_novos(lambda: tapete(COR_TAPETE[n % 4])) + objetos_novos(lambda: em(1.0, 1.25, lambda: planta_folhuda(0.95 + 0.1 * (n % 3), 0.24, 9, n))) + objetos_novos(lambda: em(1.05, -2.05, lambda: vasinho(n + 2, 2.0)))
        protege()
        for i in range(2 if sentado else 1):   # quem está de pé fica parado: um quadro basta
            if sentado: senta_digitando(arm, prep, i); vz = ik_maos(arm, i)
            else: em_pe(arm, i); vz = None
            render(os.path.join(SAIDA, 'm', f'{id}_{i}.png'))
            if vz: tira_ik(arm, vz)
        remove(cen); remove(objs); print('PRONTO', id, flush=True)
