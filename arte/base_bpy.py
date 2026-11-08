# Hub do Tráfego do Lab V30 como ambiente de inovação, isométrico realista.
#   blendenv/bin/python cena2.py glb            -> cena2.glb (sem pessoas, para o three.js)
#   blendenv/bin/python cena2.py render N L      -> render2.png com N amostras e L de largura
import bpy, math, sys, os, json
from mathutils import Vector
AQUI = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(AQUI, 'tex')
MODO = sys.argv[1] if len(sys.argv) > 1 else 'render'
bpy.ops.wm.read_factory_settings(use_empty=True)
cena = bpy.context.scene

def hx(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [a]
MATS = {}
def mat(nome, cor='#ffffff', metal=0.0, rug=0.5, tex=None, rug_tex=None, emis_tex=False, emis_forca=0.0, vidro=False, sheen=0.0):
    if nome in MATS: return MATS[nome]
    m = bpy.data.materials.new(nome); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hx(cor); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rug
    if sheen: b.inputs['Sheen Weight'].default_value = sheen
    if tex:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, tex))
        nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
        if emis_tex: nt.links.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emis_forca
    if rug_tex:
        t2 = nt.nodes.new('ShaderNodeTexImage'); t2.image = bpy.data.images.load(os.path.join(TEX, rug_tex)); t2.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(t2.outputs['Color'], b.inputs['Roughness'])
    if vidro:
        b.inputs['Transmission Weight'].default_value = 1.0; b.inputs['Roughness'].default_value = 0.03; b.inputs['IOR'].default_value = 1.45; m.blend_method = 'BLEND'
    if emis_forca and not emis_tex:
        b.inputs['Emission Color'].default_value = hx(cor); b.inputs['Emission Strength'].default_value = emis_forca
    MATS[nome] = m; return m
def liga(o, m): o.data.materials.clear(); o.data.materials.append(m); return o
def suave(o):
    for p in o.data.polygons: p.use_smooth = True
    return o
def chanfro(o, w=0.012, seg=2):
    md = o.modifiers.new('ch', 'BEVEL'); md.width = w; md.segments = seg; md.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='ch'); return o
def caixa(nome, tam, pos, m, rot=(0, 0, 0), ch=0.0):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot); o = bpy.context.object; o.name = nome; o.scale = tam
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); liga(o, m)
    if ch: chanfro(o, ch)
    return o
def cil(nome, r, h, pos, m, rot=(0, 0, 0), v=32, r2=None):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=pos, rotation=rot, vertices=v)
    else: bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=pos, rotation=rot, vertices=v)
    o = bpy.context.object; o.name = nome; return suave(liga(o, m))
def esfera(nome, r, pos, m, esc=(1, 1, 1), seg=24):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=pos, segments=seg, ring_count=seg // 2); o = bpy.context.object; o.name = nome
    o.scale = esc; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); return suave(liga(o, m))
def toro(nome, R, r, pos, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=pos, rotation=rot, major_segments=48, minor_segments=12)
    o = bpy.context.object; o.name = nome; return suave(liga(o, m))
def tubo(nome, pontos, r, m):
    cd = bpy.data.curves.new(nome, 'CURVE'); cd.dimensions = '3D'; cd.bevel_depth = r; cd.bevel_resolution = 3; cd.use_fill_caps = True
    sp = cd.splines.new('BEZIER'); sp.bezier_points.add(len(pontos) - 1)
    for bp, p in zip(sp.bezier_points, pontos): bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(nome, cd); bpy.context.collection.objects.link(o); o.data.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o.select_set(False); return o
def uv_plano(o, eixo_u, eixo_v, u0, du, v0, dv):
    me = o.data; uvl = me.uv_layers.active.data
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uvl[li].uv = ((getattr(co, eixo_u) - u0) / du, (getattr(co, eixo_v) - v0) / dv)

