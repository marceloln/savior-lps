# Pessoas do Lab V30 feitas no MPFB (MakeHuman), animadas com a Universal Animation Library (CC0)
# e renderizadas na mesma câmera e luz do render do lab.
#   ../blendenv/bin/python gente_mpfb.py teste rui        -> quadros de teste em /home/claude/pessoas
#   ../blendenv/bin/python gente_mpfb.py sprites [ids]    -> quadros em /home/claude/pessoas/q/<id>/
#   ../blendenv/bin/python gente_mpfb.py retratos [ids]   -> retrato na estação em /home/claude/pessoas/r/<id>.png
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

def prepara_alvo(alvo):
    """Calibra cada osso do alvo contra a fonte: casa a direção do osso e a frente do corpo nas duas poses de repouso.
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
        casa = moldura(direcao(FONTE, bf, mf)) @ moldura(direcao(alvo, b, mi)).inverted()
        cal[b.name] = (nf, rf.inverted() @ casa @ ra)
    pf = (mf @ FONTE.data.bones['pelvis'].head_local).z
    pa = alvo.data.bones['pelvis'].head_local.z
    return {'cal': cal, 'escala': pa / pf, 'ordem': ordem_ossos(alvo)}

ERGUE = {'neck_01': 8, 'head': 12}

def aplica(alvo, prep, acao, quadro, desloca=Vector((0, 0, 0))):
    """Copia a pose da fonte no quadro dado para o alvo, osso a osso."""
    FONTE.animation_data.action = ACOES[acao]
    bpy.context.scene.frame_set(int(round(quadro)))
    mf = FONTE.matrix_world
    pose_m = {}
    for b in prep['ordem']:   # pais antes dos filhos
        pb = alvo.pose.bones[b.name]
        rel = None if b.parent is None else b.parent.matrix_local.inverted() @ b.matrix_local
        if b.name in prep['cal']:
            nf, off = prep['cal'][b.name]
            rot = (mf @ FONTE.pose.bones[nf].matrix).to_quaternion() @ off
        elif b.parent is None:
            rot = b.matrix_local.to_quaternion()
        else:
            rot = (pose_m[b.parent.name] @ rel).to_quaternion()
        if b.name == 'pelvis':
            pos = (mf @ FONTE.pose.bones['pelvis'].head) * prep['escala'] + desloca
        elif b.parent is None:
            pos = b.head_local.copy()
        else:
            pos = (pose_m[b.parent.name] @ rel).translation
        if b.name in ERGUE:   # a animação de referência olha um pouco para baixo; levanta o olhar
            rot = Quaternion((1, 0, 0), math.radians(-ERGUE[b.name])) @ rot
        m = Matrix.Translation(pos) @ rot.to_matrix().to_4x4()
        pose_m[b.name] = m
        if b.parent is None: pb.matrix_basis = b.matrix_local.inverted() @ m
        else: pb.matrix_basis = rel.inverted() @ pose_m[b.parent.name].inverted() @ m
    bpy.context.view_layer.update()

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
    aplica(alvo, prep, 'Sitting_Idle_Loop', a + (b - a) * 0.25, desloca=Vector((0, 0, 0)))
    # ajusta o quadril para sentar no assento (topo a 0,485 m) e um pouco para trás no encosto
    coxa = alvo.pose.bones['thigh_l'].head
    aplica(alvo, prep, 'Sitting_Idle_Loop', a + (b - a) * 0.25, desloca=Vector((0, 0.07 - coxa.y, 0.56 - coxa.z)))

def ik_maos(alvo, quadro):
    vazios = []
    for lado, x in (('l', 1), ('r', -1)):
        alvo_ik = bpy.data.objects.new('ik_' + lado, None); cena.collection.objects.link(alvo_ik)
        z = 0.80 + (0.012 if (quadro + (lado == 'l')) % 2 else 0)
        alvo_ik.location = (0.14 * x, -0.42, z)
        polo = bpy.data.objects.new('polo_' + lado, None); cena.collection.objects.link(polo)
        polo.location = (0.35 * x, 0.25, 0.35)
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
                    aplica(arm, prep, acao, a + (b - a) * i / n)
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
        a, b = comprimento('Idle_Loop'); aplica(arm, prep, 'Idle_Loop', a)
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
        a, b = comprimento('Idle_Loop'); aplica(arm, prep, 'Idle_Loop', a)
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
