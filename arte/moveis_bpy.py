# Móveis de estação de trabalho usados no render do lab e nos sprites das pessoas sentadas.
# Depende de base_bpy.py (mat, caixa, cil, esfera, uv_plano).
PRETO = mat('metal_preto', '#1E2120', 0.6, 0.38)
BRANCO = mat('laminado_branco', '#F5F3EE', 0, 0.32)
COMP = mat('compensado', '#D9B98C', 0, 0.55, tex='carvalho.jpg')
TELA_P = mat('tela_preta', '#0E1513', 0.1, 0.15)
MON = [mat(f'monitor{k}', '#ffffff', 0, 0.25, tex=f'monitor{k}.png', emis_tex=True, emis_forca=1.3) for k in range(3)]
def cor_mat(c, rug=0.5, metal=0.0): return mat('c' + c, c, metal, rug)
def mesa_trabalho(telas=2, w=1.6, d=0.72, tela_mat=0):
    # mesa na altura de quem trabalha sentado: tampo a 74 cm, monitores na linha dos olhos sentado
    caixa('tampo', (w, d, 0.035), (0, 0, 0.74), COMP, ch=0.008)
    for sx in (-w/2 + 0.12, w/2 - 0.12):
        caixa('coluna', (0.06, 0.06, 0.72), (sx, 0, 0.36), PRETO); caixa('pe', (0.06, d - 0.06, 0.035), (sx, 0, 0.018), PRETO)
    caixa('barra', (w - 0.3, 0.035, 0.05), (0, -d/2 + 0.1, 0.5), PRETO)
    xs = [0] if telas == 1 else ([-0.36, 0.36] if telas == 2 else [-0.62, 0, 0.62])
    for k, dx in enumerate(xs):
        caixa('monitor', (0.62, 0.03, 0.38), (dx, -d/2 + 0.14, 1.12), TELA_P, ch=0.006)
        t = caixa('monitor_tela', (0.58, 0.004, 0.34), (dx, -d/2 + 0.156, 1.12), MON[(tela_mat + k) % 3])
        uv_plano(t, 'x', 'z', -0.29, 0.58, -0.17, 0.34)
        caixa('haste', (0.04, 0.04, 0.2), (dx, -d/2 + 0.12, 0.85), PRETO); caixa('base_mon', (0.2, 0.16, 0.012), (dx, -d/2 + 0.14, 0.763), PRETO)
    caixa('teclado', (0.42, 0.13, 0.015), (0, 0.06, 0.765), BRANCO, ch=0.004)
    caixa('mouse', (0.06, 0.1, 0.02), (0.32, 0.08, 0.767), BRANCO, ch=0.008)
    cil('caneca', 0.045, 0.1, (-w/2 + 0.2, 0.15, 0.81), cor_mat('#2F5A4C', 0.35), v=20)
def cadeira_escritorio(cor='#2E3236'):
    # cadeira giratória: base de cinco pés com rodízio, coluna a gás, assento, encosto curvo de tela e braços
    tec = cor_mat(cor, 0.85); metal = cor_mat('#B9BCC0', 0.3, 0.6); preto = cor_mat('#1E2124', 0.5)
    for k in range(5):
        a = k * 2 * math.pi / 5
        b = caixa('pe_cad', (0.3, 0.035, 0.03), (math.cos(a) * 0.15, math.sin(a) * 0.15, 0.07), metal, ch=0.01); b.rotation_euler[2] = a
        esfera('rodizio', 0.025, (math.cos(a) * 0.29, math.sin(a) * 0.29, 0.03), preto, seg=10)
    cil('coluna_gas', 0.025, 0.32, (0, 0, 0.24), metal, v=16)
    caixa('assento', (0.5, 0.48, 0.07), (0, 0, 0.45), tec, ch=0.03)
    caixa('encosto', (0.46, 0.05, 0.52), (0, 0.24, 0.78), tec, ch=0.03)
    caixa('suporte_enc', (0.06, 0.04, 0.3), (0, 0.27, 0.52), preto, ch=0.01)
    for sx in (-0.27, 0.27):
        caixa('braco_cad', (0.04, 0.05, 0.2), (sx, 0.04, 0.56), preto, ch=0.01); caixa('apoio', (0.06, 0.26, 0.03), (sx, 0.02, 0.665), preto, ch=0.012)
