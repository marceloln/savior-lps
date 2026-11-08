# Árvores de fora e carros, cada um renderizado sozinho na mesma câmera do lab, para virar sprite vivo no mapa.
import sys, os, math, json, random
sys.argv = [sys.argv[0], 'render']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_bpy.py')).read())
from mathutils import Vector
LAB = json.load(open(os.path.join(AQUI, 'lab.json'))); K = LAB['k']
R = Vector(LAB['R']); U = Vector(LAB['U']); D = Vector(LAB['D'])
FOLHA = mat('folha', '#3F7A4A', 0, 0.5); FOLHA2 = mat('folha_clara', '#5E9A5C', 0, 0.5); FOLHA3 = mat('folha_amarela', '#8FA858', 0, 0.55)
TRONCO = mat('tronco', '#6B5440', 0, 0.85)
def limpa():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
def arvore(var):
    g = random.Random(var * 7 + 1); alt = [5.2, 6.0, 4.6][var]
    tubo('tronco', [(0, 0, 0), (0.15, 0.05, alt * 0.4), (0, 0.1, alt * 0.62)], 0.16, TRONCO)
    for k in range(46):
        a = g.random() * math.tau; r = g.random() ** 0.6 * 1.9; z = alt * (0.55 + g.random() * 0.42)
        esfera('folhas', 0.42 + g.random() * 0.3, (math.cos(a) * r, math.sin(a) * r, z), [FOLHA, FOLHA2, FOLHA3][(k + var) % 3] if var != 1 else [FOLHA, FOLHA2][k % 2], esc=(1, 1, 0.85), seg=12)
def carro(cor):
    corpo = mat('lata' + cor, cor, 0.6, 0.25); vid = mat('vidro_carro', '#1E2A2E', 0.2, 0.05); pn = mat('pneu', '#1A1A1A', 0, 0.8)
    caixa('base', (4.3, 1.8, 0.6), (0, 0, 0.55), corpo, ch=0.18)
    caixa('cabine', (2.3, 1.62, 0.55), (-0.2, 0, 1.08), vid, ch=0.2)
    caixa('teto', (2.0, 1.6, 0.06), (-0.25, 0, 1.36), corpo, ch=0.03)
    for sx in (-1.35, 1.35):
        for sy in (-0.82, 0.82): cil('roda', 0.34, 0.24, (sx, sy, 0.34), pn, rot=(math.pi/2, 0, 0), v=24)
    for sy in (-0.6, 0.6): caixa('farol', (0.04, 0.3, 0.12), (2.16, sy, 0.68), mat('farol', '#FFF6D8', 0, 0.2, emis_forca=2)); caixa('lanterna', (0.04, 0.3, 0.1), (-2.16, sy, 0.7), mat('lanterna', '#B3261E', 0, 0.3, emis_forca=1.5))
def luz_e_chao():
    mundo = bpy.data.worlds.new('mundo'); cena.world = mundo; mundo.use_nodes = True
    bg = mundo.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hx('#DDE7EC'); bg.inputs['Strength'].default_value = 0.55
    bpy.ops.object.light_add(type='SUN'); s = bpy.context.object; s.data.energy = 5.0; s.data.angle = math.radians(4); s.data.color = hx('#FFF0DC')[:3]
    s.rotation_euler = (math.radians(55), 0, math.radians(-25))
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); ch = bpy.context.object; ch.is_shadow_catcher = True
def renderiza(nome, larg, alt):
    # câmera ortográfica na mesma direção do lab, centrada no meio do objeto, k pixels por metro
    pts = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' and not o.is_shadow_catcher for c in o.bound_box]
    us = [p.dot(R) for p in pts]; vs = [p.dot(U) for p in pts]
    uc, vc = (min(us) + max(us)) / 2, (min(vs) + max(vs)) / 2 - 0.4
    cam_d = bpy.data.cameras.new('cam'); camo = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(camo); cena.camera = camo
    cam_d.type = 'ORTHO'; cam_d.ortho_scale = max(larg, alt) / K; cam_d.clip_start = 1; cam_d.clip_end = 200
    camo.location = R * uc + U * vc + D * 60; camo.rotation_euler = (-D).to_track_quat('-Z', 'Y').to_euler()
    cena.render.resolution_x = larg; cena.render.resolution_y = alt
    cena.render.engine = 'CYCLES'; cena.cycles.device = 'CPU'; cena.cycles.samples = 48; cena.cycles.use_denoising = True
    cena.render.film_transparent = True; cena.view_settings.view_transform = 'AgX'; cena.view_settings.look = 'AgX - Base Contrast'
    cena.render.filepath = os.path.join(AQUI, 'vivos', nome + '.png'); bpy.ops.render.render(write_still=True)
    # pé do objeto (origem) em pixels da imagem
    return [round(larg / 2 - uc * K, 2), round(alt / 2 + vc * K, 2)]
os.makedirs(os.path.join(AQUI, 'vivos'), exist_ok=True)
saida = {}
for v in range(3):
    limpa(); luz_e_chao(); arvore(v); saida[f'arvore{v}'] = renderiza(f'arvore{v}', 520, 600)
for i, c in enumerate(['#C9603F', '#4F86C6', '#E9E5DD', '#20352F']):
    limpa(); luz_e_chao(); carro(c); saida[f'carro{i}'] = renderiza(f'carro{i}', 420, 300)
json.dump(saida, open(os.path.join(AQUI, 'vivos', 'ancoras.json'), 'w')); print('VIVOS OK', saida)
