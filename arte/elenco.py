# Quem é quem no Lab V30: corpo, pele, cabelo e roupa de cada pessoa, montados pelo MPFB.
# Idade no MakeHuman: 0,5 = 25 anos, 1,0 = 90 anos (linear nesse trecho).
def idade(anos): return 0.5 + (anos - 25) / 130

def P(sexo, anos, raca, pele, cabelo, roupa, sapato, oculos=None, tinta=None, peso=0.5, musc=0.5, alt=0.5, sobr='eyebrow001'):
    r = dict(zip(('caucasian', 'african', 'asian'), raca))
    f = {'fen': {'gender': 1.0 if sexo == 'm' else 0.0, 'age': idade(anos), 'weight': peso, 'muscle': musc, 'height': alt, 'race': r},
         'skin_mhmat': f'{pele}/{pele}.mhmat', 'hair': f'{cabelo}/{cabelo}.mhclo', 'eyebrows': f'{sobr}/{sobr}.mhclo',
         'clothes': [f'{c}/{c}.mhclo' for c in roupa + [sapato] + ([oculos] if oculos else [])]}
    if tinta: f['tinta'] = tinta
    if len(roupa) > 1: f['por_cima'] = roupa[1:]
    return f

ELENCO = {
    'lia':   P('f', 31, (.7, .2, .1), 'young_caucasian_female', 'toigo_curled_under_bob', ['toigo_female_suit'], 'toigo_flats', sobr='eyebrow010'),
    'davi':  P('m', 34, (.45, .45, .1), 'young_african_male', 'short04', ['male_casualsuit03'], 'shoes01', 'spamrakuen_tbm_glasses_frames_01', sobr='eyebrow003'),
    'rui':   P('m', 46, (.8, .1, .1), 'middleage_caucasian_male', 'short02', ['toigo_male_suit_3'], 'shoes04', 'kwnet_at_optical_glasses', peso=0.6),
    'nina':  P('f', 29, (.3, .1, .6), 'young_asian_female', 'ponytail01', ['female_elegantsuit01'], 'toigo_ballet_flats', sobr='eyebrow011'),
    'caio':  P('m', 38, (.2, .75, .05), 'middleage_african_male', 'afro01', ['male_elegantsuit01'], 'shoes04', musc=0.6, alt=0.6, sobr='eyebrow002'),
    'bela':  P('f', 33, (.55, .35, .1), 'young_caucasian_female2', 'long01', ['toigo_female_double-breasted_suit'], 'toigo_ankle_boots_female', 'kwnet_at_optical_glasses', sobr='eyebrow009'),
    'iara':  P('f', 36, (.15, .8, .05), 'middleage_african_female', 'braid01', ['toigo_female_suit_2'], 'toigo_flats', tinta={'toigo_female_suit_2': '#D98A66'}, sobr='eyebrow012'),
    'theo':  P('m', 28, (.85, .05, .1), 'young_caucasian_male', 'short01', ['male_casualsuit05'], 'shoes05', sobr='eyebrow004'),
    'duda':  P('f', 26, (.5, .4, .1), 'young_caucasian_female', 'toigo_blunt_bob_with_bangs', ['male_casualsuit06', 'joepal_crude_t-shirt_female'], 'shoes06', 'spamrakuen_tbm_glasses_frames_01', tinta={'joepal_crude_t-shirt_female': '#F2CF6B'}, sobr='eyebrow010'),
    'rosa':  P('f', 42, (.3, .65, .05), 'middleage_african_female', 'rehmanpolanski_hair_bun_brown', ['male_casualsuit06', 'toigo_fisherman_sweater'], 'toigo_ankle_boots_female', tinta={'toigo_fisherman_sweater': '#8FD3CC'}, peso=0.6, sobr='eyebrow012'),
    'beto':  P('m', 47, (.55, .4, .05), 'middleage_caucasian_male', 'short03', ['male_casualsuit06', 'namuhekam_male_polo_shirt'], 'shoes01', tinta={'namuhekam_male_polo_shirt': '#9FE0D8'}, peso=0.65, sobr='eyebrow005'),
    'lara':  P('f', 30, (.15, .05, .8), 'young_asian_female', 'toigo_inverted_bob_with_bangs', ['male_casualsuit06', 'joepal_crude_t-shirt_female'], 'toigo_mj_cloth_shoes', 'spamrakuen_tbm_glasses_frames_01', tinta={'joepal_crude_t-shirt_female': '#C6B8F0'}, sobr='eyebrow011'),
    'otto':  P('m', 53, (.85, .05, .1), 'middleage_caucasian_male', 'culturalibre_hair_02', ['toigo_male_suit_tie_and_jacket'], 'shoes01', 'kwnet_at_optical_glasses', peso=0.62, sobr='eyebrow006'),
    'max':   P('m', 27, (.35, .55, .1), 'young_african_male', 'short04', ['male_casualsuit06', 'toigo_fisherman_sweater'], 'shoes05', tinta={'toigo_fisherman_sweater': '#5E7F6A'}, sobr='eyebrow003'),
    'ana':   P('f', 29, (.6, .1, .3), 'young_caucasian_female2', 'toigo_blunt_bob', ['male_casualsuit06', 'toigo_fisherman_sweater'], 'shoes06', tinta={'toigo_fisherman_sweater': '#F0A35E'}, sobr='eyebrow009'),
    'nico':  P('m', 39, (.75, .15, .1), 'middleage_caucasian_male', 'short02', ['male_casualsuit01'], 'shoes03', 'kwnet_at_optical_glasses', sobr='eyebrow007'),
    'clara': P('f', 32, (.4, .5, .1), 'young_african_female', 'long01', ['toigo_female_double-breasted_suit'], 'toigo_flats', tinta={'toigo_female_double-breasted_suit': '#B9E3D6'}, sobr='eyebrow012'),
    # mentores da academia e a visita
    'vera':   P('f', 62, (.85, .1, .05), 'old_caucasian_female', 'bob02', ['toigo_female_suit'], 'toigo_ankle_boots_female', 'kwnet_at_optical_glasses', peso=0.58),
    'otavio': P('m', 64, (.7, .25, .05), 'old_caucasian_male', 'short01', ['toigo_male_double-breasted_suit'], 'shoes01', peso=0.6, tinta={'short01': '=#A7A39C'}),
    'iris':   P('f', 50, (.1, .05, .85), 'middleage_asian_female', 'toigo_curled_under_bob_with_bangs', ['female_elegantsuit01'], 'toigo_ballet_flats', 'spamrakuen_tbm_glasses_frames_01'),
    'bento':  P('m', 58, (.1, .85, .05), 'old_african_male', 'short04', ['male_casualsuit03'], 'shoes04', 'kwnet_at_optical_glasses', peso=0.6),
    'sol':    P('f', 45, (.5, .45, .05), 'middleage_caucasian_female', 'sonntag78_blond_with_headband', ['male_casualsuit06', 'toigo_fisherman_sweater'], 'toigo_flats', tinta={'toigo_fisherman_sweater': '#F6E3A0'}),
    'visita': P('m', 35, (.5, .45, .05), 'young_caucasian_male2', 'short03', ['male_casualsuit06', 'namuhekam_male_polo_shirt'], 'shoes04', tinta={'namuhekam_male_polo_shirt': '#7E9CC9'}),
}

# Cor da cadeira de cada pessoa que trabalha sentada, igual à do render do lab (mesas por sala, na ordem da equipe).
_C = ['#2E3236', '#3B4A44', '#4A3F36']
CADEIRA = {'lia': _C[0], 'davi': _C[1], 'rui': _C[0], 'nina': _C[1], 'caio': _C[0], 'bela': _C[1], 'iara': _C[0], 'theo': _C[1],
           'duda': '#3B4A44', 'rosa': _C[0], 'beto': _C[1], 'lara': _C[0], 'otto': _C[1], 'max': _C[0], 'ana': _C[1], 'nico': '#2E3236'}
