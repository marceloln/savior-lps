# Quem é quem no Lab V30: corpo, pele, cabelo e roupa de cada pessoa, montados pelo MPFB.
# Idade no MakeHuman: 0,5 = 25 anos, 1,0 = 90 anos (linear nesse trecho).
def idade(anos): return 0.5 + (anos - 25) / 130

def P(sexo, anos, raca, pele, cabelo, roupa, sapato, oculos=None, tinta=None, peso=0.5, musc=0.5, alt=0.5, sobr='eyebrow001', bermuda=None):
    r = dict(zip(('caucasian', 'african', 'asian'), raca))
    f = {'fen': {'gender': 1.0 if sexo == 'm' else 0.0, 'age': idade(anos), 'weight': peso, 'muscle': musc, 'height': alt, 'race': r},
         'skin_mhmat': f'{pele}/{pele}.mhmat', 'hair': f'{cabelo}/{cabelo}.mhclo', 'eyebrows': f'{sobr}/{sobr}.mhclo',
         'clothes': [f'{c}/{c}.mhclo' for c in roupa + [sapato] + ([oculos] if oculos else [])]}
    if tinta: f['tinta'] = tinta
    if len(roupa) > 1: f['por_cima'] = roupa[1:]
    # bermuda: quantos metros acima do joelho a calça da primeira peça é cortada
    if bermuda is not None: f['bermuda'] = bermuda
    return f

# Roupa de empresa do Rio: ninguém de terno. Camiseta, polo, bermuda e tênis, com um ou outro de calça.
# A primeira peça dá a calça (o jeans do conjunto casual); a segunda vai por cima e substitui a camiseta do conjunto.
JEANS, CAMISETA_M, CAMISETA_F, POLO, MALHA = 'male_casualsuit06', 'elvs_crude_t-shirt_male', 'joepal_crude_t-shirt_female', 'namuhekam_male_polo_shirt', 'toigo_fisherman_sweater'
CAQUI, MARINHO, AREIA, OLIVA, CRU, GRAFITE = '#C9B48A', '#46546B', '#DCCBA6', '#757C5C', '#EFE8D8', '#4A4A48'
OCULOS, ARO = 'kwnet_at_optical_glasses', 'spamrakuen_tbm_glasses_frames_01'

ELENCO = {
    'lia':   P('f', 31, (.7, .2, .1), 'young_caucasian_female', 'toigo_curled_under_bob', [JEANS, CAMISETA_F], 'shoes06', tinta={CAMISETA_F: '#F1E7D0'}, bermuda=0.12, sobr='eyebrow010'),
    'davi':  P('m', 34, (.45, .45, .1), 'young_african_male', 'short04', ['male_casualsuit03'], 'shoes05', ARO, sobr='eyebrow003'),
    'rui':   P('m', 46, (.8, .1, .1), 'middleage_caucasian_male', 'short02', [JEANS, POLO], 'shoes05', OCULOS, tinta={POLO: '#6E8F78', JEANS: CAQUI}, bermuda=0.04, peso=0.6),
    'nina':  P('f', 29, (.3, .1, .6), 'young_asian_female', 'ponytail01', [JEANS, CAMISETA_F], 'toigo_ballet_flats', tinta={CAMISETA_F: '#F2B6A0'}, bermuda=0.20, sobr='eyebrow011'),
    'caio':  P('m', 38, (.2, .75, .05), 'middleage_african_male', 'afro01', [JEANS, CAMISETA_M], 'shoes05', tinta={CAMISETA_M: '#F4F1EA', JEANS: MARINHO}, bermuda=0.03, musc=0.6, alt=0.6, sobr='eyebrow002'),
    'bela':  P('f', 33, (.55, .35, .1), 'young_caucasian_female2', 'long01', [JEANS, MALHA], 'toigo_ankle_boots_female', OCULOS, tinta={MALHA: '#E7D3B0'}, sobr='eyebrow009'),
    'iara':  P('f', 36, (.15, .8, .05), 'middleage_african_female', 'braid01', [JEANS, 'toigo_turtleneck_halter_top'], 'toigo_flats', tinta={'toigo_turtleneck_halter_top': '#D98A66', JEANS: CRU}, bermuda=0.10, sobr='eyebrow012'),
    'theo':  P('m', 28, (.85, .05, .1), 'young_caucasian_male', 'short01', [JEANS, CAMISETA_M], 'shoes06', tinta={CAMISETA_M: '#3F5A4C', JEANS: AREIA}, bermuda=0.05, sobr='eyebrow004'),
    'duda':  P('f', 26, (.5, .4, .1), 'young_caucasian_female', 'toigo_blunt_bob_with_bangs', [JEANS, CAMISETA_F], 'shoes06', ARO, tinta={CAMISETA_F: '#F2CF6B'}, bermuda=0.18, sobr='eyebrow010'),
    'rosa':  P('f', 42, (.3, .65, .05), 'middleage_african_female', 'rehmanpolanski_hair_bun_brown', [JEANS, MALHA], 'toigo_flats', tinta={MALHA: '#8FD3CC'}, peso=0.6, sobr='eyebrow012'),
    'beto':  P('m', 47, (.55, .4, .05), 'middleage_caucasian_male', 'short03', [JEANS, POLO], 'shoes05', tinta={POLO: '#9FE0D8', JEANS: CAQUI}, bermuda=0.03, peso=0.65, sobr='eyebrow005'),
    'lara':  P('f', 30, (.15, .05, .8), 'young_asian_female', 'toigo_inverted_bob_with_bangs', [JEANS, CAMISETA_F], 'toigo_mj_cloth_shoes', ARO, tinta={CAMISETA_F: '#C6B8F0'}, sobr='eyebrow011'),
    'otto':  P('m', 53, (.85, .05, .1), 'middleage_caucasian_male', 'culturalibre_hair_02', [JEANS, POLO], 'shoes02', OCULOS, tinta={POLO: '#EFE8D8', JEANS: MARINHO}, bermuda=0.02, peso=0.62, sobr='eyebrow006'),
    'max':   P('m', 27, (.35, .55, .1), 'young_african_male', 'short04', [JEANS, CAMISETA_M], 'shoes05', tinta={CAMISETA_M: '#6E8F78', JEANS: GRAFITE}, bermuda=0.06, sobr='eyebrow003'),
    'ana':   P('f', 29, (.6, .1, .3), 'young_caucasian_female2', 'toigo_blunt_bob', [JEANS, MALHA], 'shoes06', tinta={MALHA: '#F0A35E'}, sobr='eyebrow009'),
    'nico':  P('m', 39, (.75, .15, .1), 'middleage_caucasian_male', 'short02', ['male_casualsuit01'], 'shoes06', OCULOS, bermuda=0.04, sobr='eyebrow007'),
    'clara': P('f', 32, (.4, .5, .1), 'young_african_female', 'long01', [JEANS, 'toigo_camisole_top'], 'toigo_flats', tinta={'toigo_camisole_top': '#B9E3D6'}, sobr='eyebrow012'),
    # mentores da academia e a visita
    'vera':   P('f', 62, (.85, .1, .05), 'old_caucasian_female', 'bob02', [JEANS, MALHA], 'toigo_ankle_boots_female', OCULOS, tinta={MALHA: '#CDBBA2'}, peso=0.58),
    'otavio': P('m', 64, (.7, .25, .05), 'old_caucasian_male', 'short01', [JEANS, POLO], 'shoes02', tinta={'short01': '=#A7A39C', POLO: '#F0EAD6', JEANS: CAQUI}, bermuda=0.02, peso=0.6),
    'iris':   P('f', 50, (.1, .05, .85), 'middleage_asian_female', 'toigo_curled_under_bob_with_bangs', [JEANS, 'toigo_basic_tucked_t-shirt'], 'toigo_ballet_flats', ARO, tinta={'toigo_basic_tucked_t-shirt': '#4F6258'}),
    'bento':  P('m', 58, (.1, .85, .05), 'old_african_male', 'short04', ['male_casualsuit03'], 'shoes05', OCULOS, peso=0.6),
    'sol':    P('f', 45, (.5, .45, .05), 'middleage_caucasian_female', 'sonntag78_blond_with_headband', [JEANS, MALHA], 'toigo_flats', tinta={MALHA: '#F6E3A0'}),
    'visita': P('m', 35, (.5, .45, .05), 'young_caucasian_male2', 'short03', [JEANS, CAMISETA_M], 'shoes05', tinta={CAMISETA_M: '#D9A066', JEANS: OLIVA}, bermuda=0.04),
}

# Cor da cadeira de cada pessoa que trabalha sentada, igual à do render do lab (mesas por sala, na ordem da equipe).
_C = ['#2E3236', '#3B4A44', '#4A3F36']
CADEIRA = {'lia': _C[0], 'davi': _C[1], 'rui': _C[0], 'nina': _C[1], 'caio': _C[0], 'bela': _C[1], 'iara': _C[0], 'theo': _C[1],
           'duda': '#3B4A44', 'rosa': _C[0], 'beto': _C[1], 'lara': _C[0], 'otto': _C[1], 'max': _C[0], 'ana': _C[1], 'nico': '#2E3236'}
