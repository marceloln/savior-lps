# Monta uma pessoa do Lab V30 com o MPFB (MakeHuman para Blender) e os pacotes CC0.
# Uso: from pessoa_mpfb import monta; arm, corpo = monta(ficha)
import bpy, addon_utils
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService

def ficha_base():
    return {"phenotype": {"gender": 0.5, "age": 0.5, "muscle": 0.5, "weight": 0.5, "proportions": 0.5, "height": 0.5,
                          "cupsize": 0.5, "firmness": 0.5, "race": {"asian": 0.33, "caucasian": 0.33, "african": 0.33}},
            "rig": "game_engine", "eyes": "high-poly/high-poly.mhclo", "eyebrows": "eyebrow001/eyebrow001.mhclo",
            "eyelashes": "eyelashes01/eyelashes01.mhclo", "teeth": "", "tongue": "", "hair": "", "proxy": "",
            "targets": [], "clothes": [], "skin_mhmat": "", "skin_material_type": "ENHANCED",
            "eyes_material_type": "MAKESKIN", "clothes_material_type": "MAKESKIN", "skin_material_settings": {},
            "eyes_material_settings": {}, "expressions": [], "alternative_materials": {}, "color_adjustments": {}}

def tinge(obj, cor):
    """Troca a cor de uma peça: passa a textura para tons de cinza e multiplica pela cor.
    Com '=' na frente, a cor vira sólida (útil para cabelo grisalho)."""
    solida = cor.startswith('='); cor = cor.lstrip('=')
    r, g, b = (int(cor[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = tuple(c ** 2.2 for c in (r, g, b)) + (1,)
    for slot in obj.material_slots:
        m = slot.material
        if not m or not m.use_nodes: continue
        nt = m.node_tree
        bs = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not bs: continue
        ent = bs.inputs['Base Color']
        if solida:
            for l in list(ent.links): nt.links.remove(l)
            ent.default_value = lin; continue
        cinza = nt.nodes.new('ShaderNodeRGBToBW')
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
        mix.inputs['Factor'].default_value = 1.0
        mix.inputs[7].default_value = lin
        if ent.is_linked: nt.links.new(ent.links[0].from_socket, cinza.inputs[0])
        else: cinza.inputs[0].default_value = ent.default_value
        # o cinza da textura sobe um pouco para a cor final não escurecer demais
        ajuste = nt.nodes.new('ShaderNodeMath'); ajuste.operation = 'POWER'; ajuste.inputs[1].default_value = 0.6
        nt.links.new(cinza.outputs[0], ajuste.inputs[0]); nt.links.new(ajuste.outputs[0], mix.inputs[6])
        nt.links.new(mix.outputs[2], ent)

def tira_camiseta(obj, cintura):
    """Apaga da roupa de baixo as faces da camiseta branca (o jeans fica), porque ela atravessa
    a peça de cima quando o corpo se mexe. Da cintura para cima, só fica o que tem cor de jeans na textura."""
    import bmesh
    img = next((n.image for s in obj.material_slots if s.material and s.material.use_nodes
                for n in s.material.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and 'diffuse' in n.image.name.lower()), None)
    if img is None: return
    w, h = img.size; px = list(img.pixels)
    def cor(u, v):
        x = min(w - 1, max(0, int(u % 1 * w))); y = min(h - 1, max(0, int(v % 1 * h))); i = (y * w + x) * 4
        return px[i:i + 3]
    bm = bmesh.new(); bm.from_mesh(obj.data); uv = bm.loops.layers.uv.active
    fora = []
    for f in bm.faces:
        u = sum(l[uv].uv.x for l in f.loops) / len(f.loops); v = sum(l[uv].uv.y for l in f.loops) / len(f.loops)
        r, g, b = cor(u, v)
        if f.calc_center_median().z > cintura and not (b - r > 0.08): fora.append(f)
    bmesh.ops.delete(bm, geom=fora, context='FACES'); bm.to_mesh(obj.data); bm.free()

def monta(f, nome="pessoa"):
    info = ficha_base()
    info.update({k: v for k, v in f.items() if k not in ("tinta", "fen", "por_cima")})
    info["phenotype"].update(f.get("fen", {}))
    info["name"] = nome
    cfg = HumanService.get_default_deserialization_settings(); cfg["subdiv_levels"] = 0
    corpo = HumanService.deserialize_from_dict(info, cfg)
    arm = corpo.parent
    for parte, cor in f.get("tinta", {}).items():
        for o in arm.children_recursive:
            if parte in o.name: tinge(o, cor)
    if f.get("por_cima"):
        base = f["clothes"][0].split("/")[0]
        for o in arm.children_recursive:
            if ("." + base) in o.name: tira_camiseta(o, arm.data.bones['pelvis'].head_local.z - 0.12)
    return arm, corpo
