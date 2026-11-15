# Objetos pessoais de cada especialista, plantas pequenas e a marca oficial aplicada em 3D.
# Depende de base_bpy.py e moveis_bpy.py. Cada objeto nasce na origem, apoiado em z = 0, de frente para +y.
# A marca nunca é redesenhada: o logo é o arquivo oficial rasterizado em tex/ (ver arte/marca.md).
FOLHA_A = mat('folha', '#3F7A4A', 0, 0.5); FOLHA_B = mat('folha_clara', '#5E9A5C', 0, 0.5); FOLHA_C = mat('folha_funda', '#2E5E3C', 0, 0.55)
CERAM_P = mat('ceramica', '#EDE7DB', 0, 0.3); TERRA_P = mat('terra', '#3A2A1E', 0, 0.9)
VIDRO_P = mat('vidro', '#E8F2F0', 0, 0.03, vidro=True); ALU_P = mat('aluminio', '#C9CCCB', 0.9, 0.3)
PAPEL_P = cor_mat('#F7F4EE', 0.85); MADEIRA_P = cor_mat('#8A6A4A', 0.6); OURO_P = cor_mat('#C9A24A', 0.45)
V_VERDE = cor_mat('#20352F', 0.6); V_CREME = cor_mat('#F0EAD6', 0.6); V_AREIA = cor_mat('#C5AA81', 0.6)
TERRACOTA = cor_mat('#C9603F', 0.55); AMARELO_P = cor_mat('#E9B949', 0.5); LARANJA_P = cor_mat('#E59A3C', 0.5)

def em(dx, dy, fn, dz=0.0, rot=0.0):
    """Monta fn() e leva o conjunto para (dx, dy, dz), girado rot graus."""
    antes = set(bpy.data.objects); fn()
    vz = bpy.data.objects.new('grupo', None); bpy.context.collection.objects.link(vz)
    for o in [o for o in bpy.data.objects if o not in antes and o is not vz]:
        if o.parent is None: o.parent = vz
    vz.location = (dx, dy, dz); vz.rotation_euler = (0, 0, math.radians(rot)); return vz

# ---------------- plantas pequenas ----------------
def vasinho(tipo=0, s=1.0):
    """Planta de mesa ou de chão. Com s = 1 tem uns 30 cm; nenhuma passa de 90 cm."""
    vaso = [CERAM_P, TERRACOTA, V_VERDE, V_AREIA][tipo % 4]
    cil('vaso', 0.07 * s, 0.11 * s, (0, 0, 0.055 * s), vaso, v=20, r2=0.055 * s); cil('terra', 0.062 * s, 0.006 * s, (0, 0, 0.109 * s), TERRA_P, v=16)
    k3 = tipo % 3
    if k3 == 0:   # suculenta
        for k in range(7):
            a = k / 7 * math.tau; esfera('folha', 0.05 * s, (math.cos(a) * 0.045 * s, math.sin(a) * 0.045 * s, 0.14 * s), FOLHA_B if k % 2 else FOLHA_A, esc=(1, 1, 0.7), seg=10)
        esfera('miolo', 0.045 * s, (0, 0, 0.175 * s), FOLHA_B, seg=10)
    elif k3 == 1:  # espada-de-são-jorge
        for k in range(6):
            a = k / 6 * math.tau; h = (0.24 + 0.05 * (k % 3)) * s
            caixa('lamina', (0.034 * s, 0.008 * s, h), (math.cos(a) * 0.028 * s, math.sin(a) * 0.028 * s, 0.11 * s + h / 2), FOLHA_C if k % 2 else FOLHA_A, rot=(0.1 * math.sin(a), -0.1 * math.cos(a), a))
    else:          # jiboia, com folhas caindo pela borda
        for k in range(9):
            a = k / 9 * math.tau; r = (0.06 + 0.035 * (k % 2)) * s
            esfera('folha', 0.05 * s, (math.cos(a) * r, math.sin(a) * r, (0.15 - 0.035 * (k % 3)) * s), FOLHA_A if k % 2 else FOLHA_B, esc=(1.25, 0.85, 0.4), seg=10)
def planta_folhuda(alt=0.95, r=0.24, folhas=9, tipo=0):
    """Planta de chão com caule e folha larga, para a cena da mesa. Fica abaixo de 1,2 m."""
    cil('vaso', r, r * 1.8, (0, 0, r * 0.9), [CERAM_P, V_VERDE, TERRACOTA, V_AREIA][tipo % 4], v=40, r2=r * 0.8); cil('terra', r * 0.9, 0.02, (0, 0, r * 1.8), TERRA_P)
    for k in range(folhas):
        a = k / folhas * math.tau + tipo; h = alt * (0.6 + (k % 3) * 0.17); fx_, fy_ = math.cos(a) * r * 1.25, math.sin(a) * r * 1.25
        tubo('caule', [(0, 0, r * 1.8), (fx_ / 2, fy_ / 2, h * 0.8), (fx_, fy_, h)], 0.012, FOLHA_A)
        esfera('folha', 0.22, (fx_, fy_, h), FOLHA_A if k % 2 else FOLHA_B, esc=(1.1, 0.5, 0.18), seg=16).rotation_euler = (0.5, 0.3, a)
def canteiro():
    """Três vasos baixos juntos. Fica onde antes havia uma árvore grande."""
    em(0, 0, lambda: vasinho(1, 2.6)); em(0.48, 0.22, lambda: vasinho(2, 2.1)); em(-0.2, 0.5, lambda: vasinho(0, 1.9)); em(0.3, -0.42, lambda: vasinho(3, 1.5))

# ---------------- o que cada um tem na mesa ----------------
def porta_retrato(cor='#C5AA81'):
    """Porta-retrato com a foto da família: céu claro e três figuras."""
    inc = -0.22
    caixa('moldura', (0.19, 0.014, 0.145), (0, 0, 0.074), MADEIRA_P, rot=(inc, 0, 0)); caixa('foto', (0.16, 0.004, 0.115), (0, 0.009, 0.075), cor_mat('#DDE7EC', 0.6), rot=(inc, 0, 0))
    caixa('chao_foto', (0.16, 0.005, 0.035), (0, 0.0185, 0.037), cor_mat('#8FAE6A', 0.7), rot=(inc, 0, 0))
    for dx, h, c in ((-0.035, 0.062, cor), (0.012, 0.07, '#C9603F'), (0.05, 0.04, '#E9B949')):
        caixa('pessoa_foto', (0.026, 0.005, h), (dx, 0.0165 - h * 0.11, 0.03 + h / 2), cor_mat(c, 0.7), rot=(inc, 0, 0))
        esfera('rosto_foto', 0.012, (dx, 0.012 - h * 0.22, 0.045 + h), cor_mat('#D9A982', 0.7), esc=(1, 0.3, 1), seg=10)
    caixa('pe_retrato', (0.02, 0.07, 0.008), (0, -0.045, 0.004), MADEIRA_P)
def lupa():
    toro('aro', 0.055, 0.008, (0, 0, 0.009), PRETO); cil('lente', 0.05, 0.004, (0, 0, 0.009), VIDRO_P, v=24)
    cil('cabo', 0.011, 0.12, (0.115, 0, 0.011), MADEIRA_P, rot=(0, math.pi / 2, 0), v=12)
def prancheta():
    caixa('base', (0.23, 0.32, 0.006), (0, 0, 0.003), MADEIRA_P); caixa('folha', (0.2, 0.27, 0.003), (0, -0.012, 0.0075), PAPEL_P); caixa('clipe', (0.09, 0.028, 0.012), (0, 0.142, 0.012), ALU_P)
    for k in range(5):
        caixa('linha', (0.12, 0.007, 0.001), (0.02, 0.085 - k * 0.045, 0.0095), V_VERDE); caixa('check', (0.016, 0.016, 0.001), (-0.07, 0.085 - k * 0.045, 0.0095), TERRACOTA if k < 3 else V_AREIA)
def binoculo():
    for sx in (-0.036, 0.036):
        cil('tubo_bin', 0.03, 0.12, (sx, 0, 0.032), PRETO, rot=(math.pi / 2, 0, 0), v=20); cil('lente_bin', 0.026, 0.004, (sx, 0.061, 0.032), VIDRO_P, rot=(math.pi / 2, 0, 0), v=20)
    caixa('ponte', (0.05, 0.04, 0.02), (0, 0, 0.04), PRETO)
def jornais():
    for k, c in enumerate(('#E8E4DC', '#F0EAD6', '#DDD8CC')):
        caixa('jornal', (0.3, 0.22, 0.012), (0.01 * k, 0, 0.006 + k * 0.012), cor_mat(c, 0.9), rot=(0, 0, 0.08 * (k - 1)))
    caixa('manchete', (0.2, 0.03, 0.001), (0, 0.06, 0.0365), V_VERDE)
def ampulheta():
    for z in (0.005, 0.165): cil('tampa', 0.045, 0.01, (0, 0, z), MADEIRA_P, v=24)
    cil('bojo_b', 0.036, 0.07, (0, 0, 0.047), VIDRO_P, v=24, r2=0.007); cil('bojo_t', 0.007, 0.07, (0, 0, 0.123), VIDRO_P, v=24, r2=0.036)
    cil('areia_b', 0.03, 0.022, (0, 0, 0.022), V_AREIA, v=20, r2=0.02); cil('areia_t', 0.012, 0.03, (0, 0, 0.11), V_AREIA, v=20, r2=0.026)
    for k in range(3):
        a = k / 3 * math.tau; cil('haste', 0.004, 0.16, (math.cos(a) * 0.04, math.sin(a) * 0.04, 0.085), MADEIRA_P, v=8)
def cronometro():
    cil('caixa_cr', 0.05, 0.018, (0, 0, 0.009), ALU_P, v=32); cil('face_cr', 0.043, 0.002, (0, 0, 0.019), V_CREME, v=32)
    caixa('ponteiro', (0.004, 0.036, 0.002), (0.008, 0.012, 0.021), TERRACOTA, rot=(0, 0, -0.6)); cil('botao_cr', 0.008, 0.02, (0, 0.058, 0.009), ALU_P, rot=(math.pi / 2, 0, 0), v=12)
def postits():
    for k, c in enumerate(('#E9B949', '#F0A58A', '#B9D8A6')):
        caixa('bloco', (0.076, 0.076, 0.018 + 0.006 * k), (k * 0.09 - 0.09, 0.01 * k, 0.009 + 0.003 * k), cor_mat(c, 0.85), rot=(0, 0, 0.12 * (k - 1)))
def trofeu():
    caixa('base_tr', (0.075, 0.075, 0.03), (0, 0, 0.015), PRETO, ch=0.004); cil('haste_tr', 0.01, 0.05, (0, 0, 0.055), OURO_P, v=12)
    cil('taca', 0.018, 0.075, (0, 0, 0.117), OURO_P, v=28, r2=0.046)
    for sx in (-1, 1): toro('alca', 0.02, 0.005, (sx * 0.05, 0, 0.12), OURO_P, rot=(math.pi / 2, 0, 0))
def propostas():
    for k, m in enumerate((V_VERDE, V_CREME, V_AREIA)):
        caixa('proposta', (0.22, 0.3, 0.014), (0.012 * k, -0.008 * k, 0.007 + k * 0.014), m, rot=(0, 0, 0.06 * k), ch=0.002)
    caixa('etiqueta', (0.1, 0.03, 0.001), (0.03, 0.06, 0.0425), V_VERDE, rot=(0, 0, 0.12)); cil('caneta', 0.006, 0.14, (0.17, 0.02, 0.006), V_VERDE, rot=(math.pi / 2, 0, 0.5), v=10)
def leque_cores():
    cores = ['#20352F', '#2F5A4C', '#8FA58A', '#F0EAD6', '#C5AA81', '#E9B949', '#E59A3C', '#C9603F', '#C95C8A']
    for k, c in enumerate(cores):
        a = math.radians(-64 + k * 16)
        caixa('tira', (0.042, 0.17, 0.003), (math.sin(a) * 0.085, math.cos(a) * 0.085, 0.002 + k * 0.0031), cor_mat(c, 0.6), rot=(0, 0, -a))
    cil('pino', 0.008, 0.034, (0, 0, 0.017), ALU_P, v=12)
def camera_foto():
    caixa('corpo_cam', (0.135, 0.06, 0.088), (0, 0, 0.044), TELA_P, ch=0.008); cil('lente_cam', 0.034, 0.062, (0, 0.058, 0.044), PRETO, rot=(math.pi / 2, 0, 0), v=24)
    cil('vidro_cam', 0.027, 0.004, (0, 0.09, 0.044), VIDRO_P, rot=(math.pi / 2, 0, 0), v=20); caixa('visor', (0.05, 0.05, 0.03), (0, -0.005, 0.1), TELA_P, ch=0.005); cil('disparo', 0.01, 0.008, (0.045, 0, 0.092), ALU_P, v=12)
def microfone():
    cil('base_mic', 0.045, 0.01, (0, 0, 0.005), PRETO, v=24); cil('haste_mic', 0.006, 0.15, (0, 0, 0.085), PRETO, v=10)
    esfera('capsula', 0.03, (0, 0, 0.185), cor_mat('#8A8D8C', 0.5, 0.4), esc=(1, 1, 1.5), seg=18); toro('anel_mic', 0.031, 0.004, (0, 0, 0.165), PRETO)
def radio():
    caixa('corpo_rd', (0.062, 0.036, 0.13), (0, 0, 0.065), PRETO, ch=0.006); cil('antena', 0.005, 0.09, (0.018, 0, 0.175), PRETO, v=8)
    caixa('tela_rd', (0.04, 0.003, 0.03), (0, 0.019, 0.095), cor_mat('#B9D8A6', 0.3)); caixa('grade_rd', (0.04, 0.003, 0.04), (0, 0.019, 0.045), cor_mat('#3A3F3D', 0.6)); cil('botao_rd', 0.008, 0.012, (-0.018, 0, 0.136), TERRACOTA, v=10)
def bandeirinhas():
    caixa('base_bd', (0.11, 0.045, 0.014), (0, 0, 0.007), MADEIRA_P)
    for sx, m in ((-0.03, V_VERDE), (0.03, V_AREIA)):
        cil('mastro', 0.004, 0.17, (sx, 0, 0.099), ALU_P, v=8); caixa('pano', (0.07, 0.003, 0.045), (sx + 0.036, 0, 0.158), m)
def blocos():
    for k, m in enumerate((V_AREIA, AMARELO_P, TERRACOTA, V_VERDE)):
        h = 0.03 + k * 0.022; caixa('degrau_bl', (0.05, 0.05, h), (k * 0.054 - 0.08, 0, h / 2), m, ch=0.004)
    esfera('cliente_bl', 0.016, (0.082, 0, 0.112), V_CREME, seg=12)
def bomba():
    """Miniatura de bomba de combustível, lembrança de pista."""
    caixa('base_bb', (0.09, 0.06, 0.012), (0, 0, 0.006), PRETO); caixa('corpo_bb', (0.07, 0.042, 0.14), (0, 0, 0.082), V_VERDE, ch=0.006)
    caixa('visor_bb', (0.048, 0.003, 0.034), (0, 0.0225, 0.118), V_CREME); caixa('topo_bb', (0.08, 0.05, 0.018), (0, 0, 0.161), V_AREIA, ch=0.004)
    tubo('mangueira', [(0.036, 0, 0.13), (0.07, 0.01, 0.09), (0.05, 0.012, 0.04), (0.04, 0.012, 0.075)], 0.005, PRETO); caixa('bico', (0.012, 0.012, 0.035), (0.04, 0.012, 0.085), ALU_P)
def cone():
    caixa('base_cn', (0.09, 0.09, 0.006), (0, 0, 0.003), LARANJA_P); cil('corpo_cn', 0.034, 0.105, (0, 0, 0.058), LARANJA_P, v=20, r2=0.008); cil('faixa_cn', 0.0235, 0.022, (0, 0, 0.066), PAPEL_P, v=20, r2=0.0175)
def cubo_magico():
    caixa('cubo', (0.057, 0.057, 0.057), (0, 0, 0.0285), PRETO)
    cores = ['#F0EAD6', '#C9603F', '#E9B949', '#2F5A4C', '#E59A3C', '#F0EAD6', '#2F5A4C', '#C9603F', '#E9B949']
    for i in range(3):
        for j in range(3):
            u, v = (i - 1) * 0.0185, (j - 1) * 0.0185
            caixa('face_t', (0.016, 0.016, 0.001), (u, v, 0.0575), cor_mat(cores[i * 3 + j], 0.4))
            caixa('face_f', (0.016, 0.001, 0.016), (u, 0.029, 0.0285 + v), cor_mat(cores[(i * 3 + j + 4) % 9], 0.4))
            caixa('face_l', (0.001, 0.016, 0.016), (0.029, u, 0.0285 + v), cor_mat(cores[(i * 3 + j + 7) % 9], 0.4))
def calculadora():
    caixa('corpo_cl', (0.09, 0.14, 0.012), (0, 0, 0.006), PRETO, ch=0.003); caixa('visor_cl', (0.07, 0.03, 0.002), (0, 0.045, 0.013), cor_mat('#C9D6BE', 0.3))
    for i in range(4):
        for j in range(4): caixa('tecla', (0.014, 0.014, 0.003), (-0.027 + i * 0.018, 0.012 - j * 0.02, 0.0135), TERRACOTA if (i == 3 and j == 3) else V_CREME)
def cofrinho():
    rosa = cor_mat('#E3A5A0', 0.45)
    esfera('corpo_cf', 0.05, (0, 0, 0.066), rosa, esc=(1.3, 1, 1), seg=20); cil('focinho', 0.02, 0.02, (0.07, 0, 0.066), rosa, rot=(0, math.pi / 2, 0), v=16)
    for sx in (-0.03, 0.03):
        for sy in (-0.025, 0.025): cil('perna_cf', 0.011, 0.03, (sx, sy, 0.015), rosa, v=10)
    for sy in (-0.022, 0.022): cil('orelha', 0.012, 0.02, (0.04, sy, 0.118), rosa, v=8, r2=0.001)
    caixa('fenda', (0.03, 0.006, 0.002), (-0.005, 0, 0.1165), PRETO)
def placa():
    caixa('placa', (0.15, 0.1, 0.004), (0, 0, 0.004), cor_mat('#2F7A4F', 0.45))
    for (x, y, w, d) in ((-0.035, 0.012, 0.04, 0.04), (0.035, -0.015, 0.03, 0.022), (0.03, 0.03, 0.022, 0.012)): caixa('chip', (w, d, 0.006), (x, y, 0.009), PRETO)
    for k in range(4): cil('capacitor', 0.006, 0.014, (-0.06 + k * 0.014, -0.032, 0.013), [AMARELO_P, TERRACOTA][k % 2], v=10)
    for k in range(6): caixa('pino_pl', (0.004, 0.012, 0.01), (0.068, -0.03 + k * 0.012, 0.011), OURO_P)
def chave():
    cil('cabo_ch', 0.012, 0.09, (-0.05, 0, 0.012), TERRACOTA, rot=(0, math.pi / 2, 0), v=12); cil('haste_ch', 0.004, 0.11, (0.05, 0, 0.012), ALU_P, rot=(0, math.pi / 2, 0), v=8)
def robo():
    """Robozinho de mesa, mascote só da mesa de quem cuida dos agentes."""
    caixa('corpo_rb', (0.075, 0.055, 0.08), (0, 0, 0.068), V_CREME, ch=0.01); caixa('cabeca_rb', (0.066, 0.05, 0.046), (0, 0, 0.138), V_CREME, ch=0.01)
    for sx in (-0.016, 0.016): esfera('olho_rb', 0.008, (sx, 0.026, 0.141), mat('olho_rb', '#2F5A4C', 0, 0.3, emis_forca=0.6), seg=10)
    cil('antena_rb', 0.003, 0.03, (0, 0, 0.176), ALU_P, v=8); esfera('ponta_rb', 0.008, (0, 0, 0.194), TERRACOTA, seg=10)
    for sx in (-0.047, 0.047): caixa('braco_rb', (0.014, 0.02, 0.055), (sx, 0, 0.07), V_AREIA, ch=0.004)
    for sx in (-0.02, 0.02): caixa('pe_rb', (0.026, 0.04, 0.028), (sx, 0.004, 0.014), V_VERDE, ch=0.004)
    caixa('peito_rb', (0.036, 0.002, 0.026), (0, 0.0285, 0.07), V_VERDE)
def livros():
    for k, (c, w, d) in enumerate((('#20352F', 0.2, 0.27), ('#C5AA81', 0.18, 0.25), ('#C9603F', 0.19, 0.26), ('#F0EAD6', 0.16, 0.23))):
        caixa('livro_p', (w, d, 0.032), (0.008 * (k % 2), 0, 0.016 + k * 0.032), cor_mat(c, 0.7), rot=(0, 0, 0.1 * (k - 1.5)), ch=0.003)
def fichario():
    for k, m in enumerate((V_VERDE, V_AREIA)):
        caixa('fichario', (0.075, 0.27, 0.31), (k * 0.082 - 0.04, 0, 0.155), m, ch=0.004); caixa('etiq_fc', (0.05, 0.002, 0.1), (k * 0.082 - 0.04, 0.136, 0.19), PAPEL_P); toro('argola', 0.014, 0.003, (k * 0.082 - 0.04, 0.137, 0.07), ALU_P, rot=(math.pi / 2, 0, 0))
def sino():
    cil('base_sn', 0.052, 0.012, (0, 0, 0.006), PRETO, v=28); esfera('cupula', 0.044, (0, 0, 0.014), OURO_P, esc=(1, 1, 0.72), seg=24); cil('botao_sn', 0.008, 0.02, (0, 0, 0.052), OURO_P, v=12)
def flores():
    cil('jarro', 0.04, 0.13, (0, 0, 0.065), CERAM_P, v=24, r2=0.03)
    for k, c in enumerate(('#E9B949', '#C9603F', '#F0EAD6', '#E9B949', '#E59A3C')):
        a = k / 5 * math.tau; fx, fy, fz = math.cos(a) * 0.05, math.sin(a) * 0.05, 0.24 + 0.03 * (k % 2)
        tubo('talo', [(0, 0, 0.12), (fx * 0.5, fy * 0.5, fz * 0.8), (fx, fy, fz)], 0.004, FOLHA_A); esfera('flor', 0.026, (fx, fy, fz), cor_mat(c, 0.6), esc=(1, 1, 0.7), seg=12)
def caderno():
    caixa('caderno', (0.17, 0.23, 0.016), (0, 0, 0.008), V_VERDE, ch=0.003); caixa('elastico', (0.008, 0.232, 0.017), (0.06, 0, 0.0085), V_AREIA); cil('caneta_cd', 0.005, 0.14, (0.13, 0, 0.005), PRETO, rot=(math.pi / 2, 0, 0.2), v=10)

# Dois objetos por pessoa. O primeiro vai à esquerda do teclado, o segundo à direita, perto do porta-retrato.
PESSOAIS = {
    'lia': (prancheta, lupa), 'davi': (jornais, binoculo), 'rui': (ampulheta, caderno), 'nina': (postits, cronometro),
    'caio': (trofeu, caderno), 'bela': (propostas, None), 'iara': (leque_cores, None), 'theo': (camera_foto, microfone),
    'duda': (bandeirinhas, radio), 'rosa': (blocos, postits), 'beto': (bomba, cone), 'lara': (cubo_magico, caderno),
    'otto': (calculadora, cofrinho), 'max': (placa, chave), 'ana': (robo, caderno), 'nico': (livros, fichario), 'clara': (sino, flores),
}
COR_DA_FOTO = {'lia': '#4F86C6', 'davi': '#2F5A4C', 'rui': '#20352F', 'nina': '#C95C8A', 'caio': '#2F5A4C', 'bela': '#8E7CC3', 'iara': '#D98A66', 'theo': '#5E7F6A',
               'duda': '#F2CF6B', 'rosa': '#8FD3CC', 'beto': '#9FE0D8', 'lara': '#C6B8F0', 'otto': '#20352F', 'max': '#5E7F6A', 'ana': '#F0A35E', 'nico': '#C5AA81', 'clara': '#B9E3D6'}
def pessoais(id, tampo=0.7575, larg=1.6, fundo=-0.14, perto=False):
    """O que a pessoa tem na mesa, em coordenadas da mesa: porta-retrato, plantinha e os dois objetos dela.
    Com perto=True é o arranjo da cena da mesa: o porta-retrato vira para a câmera, que fica à direita de quem senta."""
    a, b = PESSOAIS.get(id, (caderno, None)); k = sum(map(ord, id)); foto = COR_DA_FOTO.get(id, '#C5AA81')
    deitado = a in (prancheta, propostas, jornais, livros)
    if perto:
        em(-larg / 2 + 0.17, -0.1, lambda: porta_retrato(foto), tampo, 60); em(larg / 2 - 0.13, fundo, lambda: vasinho(k % 6, 0.9), tampo, k * 40)
        em(-0.37, 0.2, a, tampo, -12 if deitado else 0)
        if b: em(0.52, 0.2, b, tampo, 20)
        return
    em(larg / 2 - 0.17, 0.2, lambda: porta_retrato(foto), tampo, -18)
    em(-larg / 2 + 0.13, fundo, lambda: vasinho(k % 6, 0.9), tampo, k * 40)
    em(-0.4, 0.2, a, tampo, -12 if deitado else 0)
    if b: em(0.5, -0.02, b, tampo, 20)

# ---------------- marca oficial ----------------
PROP_LOGO = 108 / 515   # altura sobre largura do logo Vetor30
def logo_em_painel(lw, pos, rot=(0, 0, 0), claro=False):
    """Logo oficial como textura numa face que olha para +y local. Sem bisel, brilho ou contorno."""
    m = mat('logo_verde' if claro else 'logo_creme', '#ffffff', 0, 0.6, tex='logo_vetor30_verde.png' if claro else 'logo_vetor30_creme.png')
    lh = lw * PROP_LOGO
    f = caixa('logo', (lw, 0.004, lh), pos, m, rot=rot); uv_plano(f, 'x', 'z', lw / 2, -lw, -lh / 2, lh); return f
def painel_marca(w=4.2, h=1.5, lw=3.4):
    """Parede baixa de marca atrás da recepção: verde com o logo creme e areia."""
    caixa('painel_marca', (w, 0.12, h), (0, 0, h / 2 + 0.02), V_VERDE, ch=0.008); caixa('rodape_marca', (w, 0.14, 0.04), (0, 0, 0.02), PRETO)
    logo_em_painel(lw, (0, 0.063, h / 2 + 0.03))
