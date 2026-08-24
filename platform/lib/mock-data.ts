// Real data from SofitView API — 88 vehicles + 45 employees
// Will be replaced by Supabase queries in production

export function slaLevel(minutes: number): 'ok' | 'warn' | 'crit' {
  if (minutes <= 10) return 'ok';
  if (minutes <= 20) return 'warn';
  return 'crit';
}

export const slaColors = {
  ok: { bg: 'var(--green-l)', text: 'var(--green-d)', dot: 'var(--green)' },
  warn: { bg: 'var(--amber-l)', text: 'var(--amber)', dot: 'var(--amber)' },
  crit: { bg: 'var(--red-l)', text: 'var(--red)', dot: 'var(--red)' },
};

export type VtrTipo = 'uti' | 'basica' | 'moto';
export type VtrStatus = 'disponivel' | 'em_atendimento' | 'manutencao';
export type ChamadoStatus = 'aberto' | 'em_cotacao' | 'aprovado' | 'despacho' | 'em_transito' | 'no_local' | 'em_transporte' | 'concluido' | 'cancelado';
export type ChamadoServico = 'uti' | 'basica' | 'remocao' | 'evento' | 'cobertura';
export type ChamadoCanal = 'whatsapp' | 'telefone' | 'site' | 'email' | 'manual';
export type ChamadoPrioridade = 'urgente' | 'normal' | 'baixa';

export interface Vtr {
  id: string;
  nome: string;
  placa: string;
  tipo: VtrTipo;
  status: VtrStatus;
  modelo: string;
  latitude: number;
  longitude: number;
  sofit_id: number;
}

export interface Employee {
  id: string;
  nome: string;
  funcao: string;
  sofit_id: number;
}

export interface Chamado {
  id: string;
  numero: number;
  status: ChamadoStatus;
  prioridade: ChamadoPrioridade;
  servico: ChamadoServico;
  canal: ChamadoCanal;
  paciente_nome: string;
  paciente_telefone: string;
  paciente_idade: number;
  solicitante_nome: string;
  origem: string;
  destino: string;
  vtr_placa: string | null;
  vtr_nome: string | null;
  equipe: string | null;
  valor_cotado: number | null;
  created_at: string;
  eta_minutos: number | null;
  distancia_km: number | null;
  pagamento_status: 'pendente' | 'aprovado' | 'pago';
  bot_managed: boolean;
  sla_minutos: number;
  created_at_ts: number;
  atendente?: string;
}

// ── Real vehicles from SofitView (88 units) ──────────────────────────

export const mockVtrs: Vtr[] = [
  // ── RJ: em_atendimento spread across real neighborhoods ──
  { id: '129', nome: '196', placa: 'LSR6356', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9519, longitude: -43.1729, sofit_id: 129 }, // Botafogo
  // ── RJ: disponivel clustered at base São Cristóvão ──
  { id: '123', nome: '204', placa: 'KWE5647', tipo: 'basica', status: 'disponivel', modelo: 'Renault Kangoo 1.6', latitude: -22.8961, longitude: -43.2179, sofit_id: 123 }, // São Cristóvão base
  { id: '26', nome: '340', placa: 'LSG7033', tipo: 'uti', status: 'disponivel', modelo: 'Mercedes Sprinter 415', latitude: -22.8968, longitude: -43.2192, sofit_id: 26 }, // São Cristóvão base
  { id: '27', nome: '341', placa: 'LSG7030', tipo: 'uti', status: 'disponivel', modelo: 'Mercedes Sprinter 415', latitude: -22.8958, longitude: -43.2171, sofit_id: 27 }, // São Cristóvão base
  // ── RJ: em_atendimento across neighborhoods ──
  { id: '28', nome: '342', placa: 'LSG7034', tipo: 'uti', status: 'em_atendimento', modelo: 'Mercedes Sprinter 415', latitude: -22.9271, longitude: -43.2344, sofit_id: 28 }, // Tijuca
  { id: '29', nome: '343', placa: 'LSG7031', tipo: 'uti', status: 'em_atendimento', modelo: 'Mercedes Sprinter 415', latitude: -22.9711, longitude: -43.1822, sofit_id: 29 }, // Copacabana
  // ── RJ: manutencao near base ──
  { id: '30', nome: '344', placa: 'LSG7032', tipo: 'uti', status: 'manutencao', modelo: 'Mercedes Sprinter 415', latitude: -22.8972, longitude: -43.2198, sofit_id: 30 }, // São Cristóvão (oficina)
  { id: '31', nome: '345', placa: 'LSG7029', tipo: 'uti', status: 'manutencao', modelo: 'Mercedes Sprinter 415', latitude: -22.8955, longitude: -43.2205, sofit_id: 31 }, // São Cristóvão (oficina)
  { id: '74', nome: '348', placa: 'LSH9562', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -22.8978, longitude: -43.2168, sofit_id: 74 }, // São Cristóvão (oficina)
  // ── RJ: em_atendimento ──
  { id: '104', nome: '350', placa: 'KRK7698', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9024, longitude: -43.2801, sofit_id: 104 }, // Méier
  { id: '33', nome: '351', placa: 'LSI5434', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.8833, longitude: -43.1037, sofit_id: 33 }, // Niterói
  { id: '130', nome: '352', placa: 'KRK7699', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -22.8949, longitude: -43.2212, sofit_id: 130 }, // São Cristóvão (oficina)
  { id: '71', nome: '353', placa: 'KRK7697', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.8129, longitude: -43.2140, sofit_id: 71 }, // Ilha do Governador
  { id: '86', nome: '354', placa: 'KRL3687', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9991, longitude: -43.3652, sofit_id: 86 }, // Barra da Tijuca
  // ── RJ: disponivel at base ──
  { id: '13', nome: '402', placa: 'KPL6507', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8970, longitude: -43.2188, sofit_id: 13 }, // São Cristóvão base
  // ── RJ: em_atendimento ──
  { id: '69', nome: '427', placa: 'LSB7248', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9068, longitude: -43.1729, sofit_id: 69 }, // Centro
  // ── RJ: disponivel at base ──
  { id: '70', nome: '428', placa: 'LRY6677', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8953, longitude: -43.2195, sofit_id: 70 }, // São Cristóvão base
  { id: '91', nome: '429', placa: 'KQX7957', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8975, longitude: -43.2175, sofit_id: 91 }, // São Cristóvão base
  // ── RJ: em_atendimento ──
  { id: '90', nome: '430', placa: 'KQX7956', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.8744, longitude: -43.3391, sofit_id: 90 }, // Madureira
  // ── RJ: disponivel at base ──
  { id: '88', nome: '431', placa: 'LSJ6843', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8963, longitude: -43.2182, sofit_id: 88 }, // São Cristóvão base
  { id: '89', nome: '432', placa: 'GAB4210', tipo: 'basica', status: 'disponivel', modelo: 'Peugeot Boxer 2.3', latitude: -22.8957, longitude: -43.2190, sofit_id: 89 }, // São Cristóvão base
  // ── RJ: em_atendimento ──
  { id: '85', nome: '436', placa: 'KRI8395', tipo: 'uti', status: 'em_atendimento', modelo: 'Mercedes Sprinter 415', latitude: -22.9519, longitude: -43.1729, sofit_id: 85 }, // Botafogo
  // ── RJ: disponivel at base ──
  { id: '99', nome: '437', placa: 'KRI8396', tipo: 'uti', status: 'disponivel', modelo: 'Mercedes Sprinter 415', latitude: -22.8966, longitude: -43.2183, sofit_id: 99 }, // São Cristóvão base
  { id: '79', nome: '438', placa: 'LSG5674', tipo: 'uti', status: 'disponivel', modelo: 'Mercedes Sprinter 415', latitude: -22.8960, longitude: -43.2177, sofit_id: 79 }, // São Cristóvão base
  { id: '83', nome: '439', placa: 'LSG7035', tipo: 'uti', status: 'disponivel', modelo: 'Mercedes Sprinter 415', latitude: -22.8973, longitude: -43.2196, sofit_id: 83 }, // São Cristóvão base
  // ── RJ: em_atendimento ──
  { id: '97', nome: '440', placa: 'KRK6216', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9016, longitude: -43.5566, sofit_id: 97 }, // Campo Grande (Zona Oeste)
  // ── RJ: disponivel at base ──
  { id: '38', nome: '443', placa: 'RIO2I18', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8952, longitude: -43.2201, sofit_id: 38 }, // São Cristóvão base
  // ── RJ: manutencao near base ──
  { id: '39', nome: '444', placa: 'RIO4H62', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -22.8980, longitude: -43.2165, sofit_id: 39 }, // São Cristóvão (oficina)
  // ── RJ: disponivel at base ──
  { id: '126', nome: '446', placa: 'RIO4H66', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8969, longitude: -43.2174, sofit_id: 126 }, // São Cristóvão base
  { id: '127', nome: '447', placa: 'RIO4H76', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8964, longitude: -43.2187, sofit_id: 127 }, // São Cristóvão base
  { id: '41', nome: '448', placa: 'RIO4H67', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8956, longitude: -43.2193, sofit_id: 41 }, // São Cristóvão base
  // ── RJ: em_atendimento across neighborhoods ──
  { id: '42', nome: '449', placa: 'RIO2I14', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9271, longitude: -43.2344, sofit_id: 42 }, // Tijuca
  { id: '43', nome: '450', placa: 'RIO3G30', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.8833, longitude: -43.1037, sofit_id: 43 }, // Niterói
  { id: '44', nome: '451', placa: 'RIO4H60', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9519, longitude: -43.1806, sofit_id: 44 }, // Botafogo
  { id: '45', nome: '452', placa: 'RIO2I17', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9068, longitude: -43.1729, sofit_id: 45 }, // Centro
  { id: '46', nome: '453', placa: 'RIO3H95', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9711, longitude: -43.1822, sofit_id: 46 }, // Copacabana
  // ── RJ: manutencao near base ──
  { id: '47', nome: '454', placa: 'RIO2J99', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -22.8976, longitude: -43.2209, sofit_id: 47 }, // São Cristóvão (oficina)
  // ── RJ: em_atendimento ──
  { id: '48', nome: '455', placa: 'RIO2J98', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.9024, longitude: -43.2801, sofit_id: 48 }, // Méier
  // ── SP: em_atendimento spread across SP ──
  { id: '35', nome: '456', placa: 'FZP0692', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.5874, longitude: -46.6576, sofit_id: 35 }, // Zona Sul SP
  { id: '36', nome: '457', placa: 'FHV2911', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -23.6548, longitude: -46.7065, sofit_id: 36 }, // Santo Amaro SP
  { id: '37', nome: '458', placa: 'FKC6682', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.5997, longitude: -46.6698, sofit_id: 37 }, // Moema SP
  // ── RJ: disponivel at base ──
  { id: '131', nome: '459', placa: 'LMP2A64', tipo: 'basica', status: 'disponivel', modelo: 'Fiat Fiorino 1.4', latitude: -22.8967, longitude: -43.2180, sofit_id: 131 }, // São Cristóvão base
  { id: '133', nome: '460', placa: 'BRO2622', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8971, longitude: -43.2186, sofit_id: 133 }, // São Cristóvão base
  // ── SP: em_atendimento ──
  { id: '134', nome: '461', placa: 'EXX6071', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.5858, longitude: -46.6757, sofit_id: 134 }, // Itaim Bibi SP
  { id: '132', nome: '462', placa: 'EGR9813', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.6548, longitude: -46.7065, sofit_id: 132 }, // Santo Amaro SP
  // ── SP: disponivel ──
  { id: '135', nome: '463', placa: 'EEX4391', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -23.612956, longitude: -46.612909, sofit_id: 135 },
  { id: '136', nome: '464', placa: 'ESK0632', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -23.503767, longitude: -46.645754, sofit_id: 136 },
  { id: '150', nome: '465', placa: 'GGQ8413', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.620336, longitude: -46.652241, sofit_id: 150 },
  { id: '138', nome: '466', placa: 'EZE2094', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -23.471121, longitude: -46.628642, sofit_id: 138 },
  { id: '139', nome: '467', placa: 'EZU6374', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.850271, longitude: -43.129606, sofit_id: 139 },
  { id: '140', nome: '468', placa: 'EZZ2784', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.965422, longitude: -43.146413, sofit_id: 140 },
  { id: '141', nome: '469', placa: 'ENE1553', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.884995, longitude: -43.168464, sofit_id: 141 },
  { id: '142', nome: '470', placa: 'ELE5222', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.934781, longitude: -43.155985, sofit_id: 142 },
  { id: '143', nome: '471', placa: 'EQZ7337', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.953414, longitude: -43.180728, sofit_id: 143 },
  { id: '144', nome: '472', placa: 'EWT1787', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.912353, longitude: -43.118442, sofit_id: 144 },
  { id: '145', nome: '473', placa: 'DZJ7727', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.861698, longitude: -43.201293, sofit_id: 145 },
  { id: '146', nome: '474', placa: 'DXL2921', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.90673, longitude: -43.211462, sofit_id: 146 },
  { id: '152', nome: '475', placa: 'BZK3J29', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.48448, longitude: -46.574017, sofit_id: 152 },
  { id: '153', nome: '476', placa: 'BZK1H49', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.582749, longitude: -46.611068, sofit_id: 153 },
  { id: '156', nome: '477', placa: 'RKM1A89', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.533065, longitude: -46.688846, sofit_id: 156 },
  { id: '154', nome: '479', placa: 'RKM1A87', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.508498, longitude: -46.626999, sofit_id: 154 },
  { id: '155', nome: '480', placa: 'RKM1A88', tipo: 'basica', status: 'manutencao', modelo: 'Renault Master 2.3', latitude: -23.50592, longitude: -46.628443, sofit_id: 155 },
  { id: '159', nome: '481', placa: 'GIM7G95', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.966731, longitude: -43.194001, sofit_id: 159 },
  { id: '160', nome: '482', placa: 'FVB8J26', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.964463, longitude: -43.121408, sofit_id: 160 },
  { id: '161', nome: '483', placa: 'CFZ6A85', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.861353, longitude: -43.1331, sofit_id: 161 },
  { id: '162', nome: '484', placa: 'FYW7G45', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.929898, longitude: -43.225949, sofit_id: 162 },
  { id: '163', nome: '485', placa: 'FVJ4D05', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.861439, longitude: -43.119266, sofit_id: 163 },
  { id: '164', nome: '486', placa: 'FRM4D96', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.956522, longitude: -43.174581, sofit_id: 164 },
  { id: '165', nome: '487', placa: 'FUQ7A96', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.958494, longitude: -43.141628, sofit_id: 165 },
  { id: '166', nome: '488', placa: 'FKD8F38', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.8749, longitude: -43.217493, sofit_id: 166 },
  { id: '167', nome: '489', placa: 'FZP1C48', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -23.554455, longitude: -46.625331, sofit_id: 167 },
  { id: '168', nome: '490', placa: 'GFK1E38', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.934993, longitude: -43.128208, sofit_id: 168 },
  { id: '202', nome: '501', placa: 'FAH6H42', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.562798, longitude: -46.679412, sofit_id: 202 },
  { id: '268', nome: '502', placa: 'FJP3B32', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -23.544213, longitude: -46.596511, sofit_id: 268 },
  { id: '334', nome: '503', placa: 'SVL1F94', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.942662, longitude: -43.195494, sofit_id: 334 },
  { id: '433', nome: '504', placa: 'TTZ4H46', tipo: 'basica', status: 'em_atendimento', modelo: 'Renault Master 2.3', latitude: -22.847382, longitude: -43.154915, sofit_id: 433 },
  { id: '466', nome: '505', placa: 'TTZ4H52', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.914228, longitude: -43.170791, sofit_id: 466 },
  { id: '467', nome: '506', placa: 'TTY4J37', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.952279, longitude: -43.205936, sofit_id: 467 },
  { id: '469', nome: '507', placa: 'TTZ4H49', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.92623, longitude: -43.162303, sofit_id: 469 },
  { id: '470', nome: '508', placa: 'TUH3A27', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.939186, longitude: -43.206474, sofit_id: 470 },
  { id: '471', nome: '509', placa: 'TTV6J68', tipo: 'basica', status: 'disponivel', modelo: 'Renault Master 2.3', latitude: -22.958281, longitude: -43.157168, sofit_id: 471 },
  { id: '147', nome: 'MOTO 01', placa: 'LTT7G80', tipo: 'moto', status: 'disponivel', modelo: 'YBR', latitude: -22.8962, longitude: -43.2184, sofit_id: 147 }, // São Cristóvão base
  { id: '158', nome: 'MOTO 02', placa: 'RJL3B64', tipo: 'moto', status: 'disponivel', modelo: 'YBR', latitude: -22.8959, longitude: -43.2191, sofit_id: 158 }, // São Cristóvão base
  { id: '124', nome: 'MOTO 03', placa: 'KPI2453', tipo: 'moto', status: 'em_atendimento', modelo: 'CG', latitude: -22.9519, longitude: -43.1729, sofit_id: 124 }, // Botafogo
  { id: '149', nome: 'MOTO 04', placa: 'KPU7708', tipo: 'moto', status: 'disponivel', modelo: 'CG', latitude: -22.8974, longitude: -43.2178, sofit_id: 149 }, // São Cristóvão base
  { id: '235', nome: 'MOTO 05', placa: 'GFT1J04', tipo: 'moto', status: 'em_atendimento', modelo: 'CG', latitude: -22.9068, longitude: -43.1729, sofit_id: 235 }, // Centro
  { id: '236', nome: 'MOTO 06', placa: 'FSI6G82', tipo: 'moto', status: 'em_atendimento', modelo: 'CG', latitude: -22.8129, longitude: -43.2140, sofit_id: 236 }, // Ilha do Governador
  { id: '499', nome: 'SERVICO', placa: 'AAA0000', tipo: 'basica', status: 'disponivel', modelo: 'Vertis 90V', latitude: -22.8699, longitude: -43.210051, sofit_id: 499 },
];

// ── Real employees from SofitView (45 people) ───────────────────────

export const mockEmployees: Employee[] = [
  { id: '7517', nome: 'Adilson Barbosa Moreira Junior', funcao: 'Motorista', sofit_id: 7517 },
  { id: '7519', nome: 'Aluizio Costa da Silva', funcao: 'Motorista', sofit_id: 7519 },
  { id: '53', nome: 'Anderson de Souza', funcao: 'Motorista', sofit_id: 53 },
  { id: '7522', nome: 'Antonio Aparecido Deliberal', funcao: 'Motorista', sofit_id: 7522 },
  { id: '1304', nome: 'Augusto Goncalves Procopio', funcao: 'Motorista', sofit_id: 1304 },
  { id: '311', nome: 'Caetano Pedro Bento', funcao: 'Motorista', sofit_id: 311 },
  { id: '345', nome: 'Danilo Gomes Colen', funcao: 'Motorista', sofit_id: 345 },
  { id: '7532', nome: 'Denilson Rocha', funcao: 'Motorista', sofit_id: 7532 },
  { id: '7538', nome: 'Elson Firmino', funcao: 'Motorista', sofit_id: 7538 },
  { id: '7540', nome: 'Fabio Roberto Gomes da Silva', funcao: 'Motorista', sofit_id: 7540 },
  { id: '7541', nome: 'Felipe da Conceicao Amaral', funcao: 'Motorista', sofit_id: 7541 },
  { id: '7747', nome: 'Flavio Jose Guabiraba Barbosa', funcao: 'Motorista', sofit_id: 7747 },
  { id: '7544', nome: 'Gabriel da Silva Galvao', funcao: 'Motorista', sofit_id: 7544 },
  { id: '328', nome: 'Geraldo Xavier Pimenta', funcao: 'Motorista', sofit_id: 328 },
  { id: '21', nome: 'Gilberto Camilo Azevedo', funcao: 'Motorista', sofit_id: 21 },
  { id: '7548', nome: 'Guilherme Aprodu', funcao: 'Motorista', sofit_id: 7548 },
  { id: '354', nome: 'Guilherme Luis Shootoff Silva', funcao: 'Motorista', sofit_id: 354 },
  { id: '7552', nome: 'Ismael Antonio da Silva', funcao: 'Motorista', sofit_id: 7552 },
  { id: '7650', nome: 'Joao Paulo Souza Duarte Carvalho', funcao: 'Motorista', sofit_id: 7650 },
  { id: '7555', nome: 'Joao Vitor Patricio Matias', funcao: 'Motorista', sofit_id: 7555 },
  { id: '7557', nome: 'Jocival Bonfim', funcao: 'Motorista', sofit_id: 7557 },
  { id: '7351', nome: 'Joel dos Santos Olivio', funcao: 'Motorista', sofit_id: 7351 },
  { id: '5932', nome: 'Jorge Vinicius Melo do Nascimento', funcao: 'Motorista', sofit_id: 5932 },
  { id: '7561', nome: 'Jose Gecifram Alves Bezerra', funcao: 'Motorista', sofit_id: 7561 },
  { id: '7562', nome: 'Josevaldo da Silva', funcao: 'Motorista', sofit_id: 7562 },
  { id: '7564', nome: 'Kaique Santos Firmino', funcao: 'Motorista', sofit_id: 7564 },
  { id: '7565', nome: 'Laerte Stapani Junior', funcao: 'Motorista', sofit_id: 7565 },
  { id: '7252', nome: 'Lucas Santana de Oliveira', funcao: 'Compras', sofit_id: 7252 },
  { id: '7219', nome: 'Luciano Jose da Silva', funcao: 'Motorista', sofit_id: 7219 },
  { id: '76', nome: 'Luciano Silva Santos', funcao: 'Motorista', sofit_id: 76 },
  { id: '7568', nome: 'Luiz Prestes', funcao: 'Motorista', sofit_id: 7568 },
  { id: '7570', nome: 'Marcelo Fagundes da Silva', funcao: 'Motorista', sofit_id: 7570 },
  { id: '4942', nome: 'Marcio Ferreira da Silva', funcao: 'Motorista', sofit_id: 4942 },
  { id: '7574', nome: 'Marcos Augusto Pimentel', funcao: 'Motorista', sofit_id: 7574 },
  { id: '7153', nome: 'Oltair Barbosa Araujo', funcao: 'Motorista', sofit_id: 7153 },
  { id: '7417', nome: 'Paulo Marrano', funcao: 'Motorista', sofit_id: 7417 },
  { id: '7714', nome: 'Paulo Rafael Castilho dos Santos', funcao: 'Motorista', sofit_id: 7714 },
  { id: '7318', nome: 'Philipe Pinheiro Fernandes', funcao: 'Motorista', sofit_id: 7318 },
  { id: '3424', nome: 'Roberto Carlos Luiz', funcao: 'Motorista', sofit_id: 3424 },
  { id: '7649', nome: 'Samuel Jhonatan Bruno de Oliveira', funcao: 'Motorista', sofit_id: 7649 },
  { id: '7585', nome: 'Sineval Blefari', funcao: 'Motorista', sofit_id: 7585 },
  { id: '7780', nome: 'Stephany Caminha da Silva', funcao: 'Auxiliar de Frota', sofit_id: 7780 },
  { id: '7589', nome: 'Wilson da Silva Rodrigues', funcao: 'Motorista', sofit_id: 7589 },
];

// ── Detailed employee data from SofitView (enriched) ─────────────────

export type FuncionarioStatus = 'ativo' | 'ferias' | 'afastado' | 'desligado';

export interface FuncionarioDetail {
  id: string;
  sofit_id: number;
  nome: string;
  funcao: string;
  status: FuncionarioStatus;
  matricula?: string;
  cpf?: string;
  cnh?: string;
  cnh_vencimento?: string;
  telefone?: string;
  email?: string;
  filial?: string;
  centro_custo?: string;
  regiao: string;
  conselho_tipo?: 'CRM' | 'COREN' | null;
  conselho_numero?: string;
  conselho_uf?: string;
  conselho_validade?: string;
  especialidade?: string;
}

export const mockFuncionariosDetail: FuncionarioDetail[] = [
  { id: '7517', sofit_id: 7517, nome: 'Adilson Barbosa Moreira Junior', funcao: 'Motorista', status: 'ativo', matricula: '78', cnh: '6257878750', cnh_vencimento: '2031-07-06', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7519', sofit_id: 7519, nome: 'Aluizio Costa da Silva', funcao: 'Motorista', status: 'ferias', matricula: '36', cnh: '2100241237', cnh_vencimento: '2029-09-10', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '53', sofit_id: 53, nome: 'Anderson de Souza', funcao: 'Motorista', status: 'ativo', matricula: '2', cnh: '5646239504', cnh_vencimento: '2036-04-14', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7522', sofit_id: 7522, nome: 'Antonio Aparecido Deliberal', funcao: 'Motorista', status: 'ativo', matricula: '22', cnh: '3096682830', cnh_vencimento: '2028-03-06', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '1304', sofit_id: 1304, nome: 'Augusto Goncalves Procopio', funcao: 'Motorista', status: 'ativo', matricula: '28', cnh: '4375931254', cnh_vencimento: '2028-07-04', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '311', sofit_id: 311, nome: 'Caetano Pedro Bento', funcao: 'Motorista', status: 'afastado', matricula: '29', cnh: '2039458823', cnh_vencimento: '2028-02-17', filial: 'SAVIOR - RJ', regiao: 'RJ' },
  { id: '345', sofit_id: 345, nome: 'Danilo Gomes Colen', funcao: 'Motorista', status: 'ativo', matricula: '80', cnh: '7330326045', cnh_vencimento: '2032-05-31', filial: 'SAVIOR - RJ', regiao: 'RJ' },
  { id: '7532', sofit_id: 7532, nome: 'Denilson Rocha', funcao: 'Motorista', status: 'ferias', matricula: '45', cnh: '3777086005', cnh_vencimento: '2035-12-18', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7538', sofit_id: 7538, nome: 'Elson Firmino', funcao: 'Motorista', status: 'ativo', matricula: '99', cnh: '3161287745', cnh_vencimento: '2028-11-22', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7540', sofit_id: 7540, nome: 'Fabio Roberto Gomes da Silva', funcao: 'Motorista', status: 'ativo', matricula: '46', cnh: '636836110', cnh_vencimento: '2034-06-10', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'a definir', regiao: 'SP' },
  { id: '7541', sofit_id: 7541, nome: 'Felipe da Conceicao Amaral', funcao: 'Motorista', status: 'ativo', matricula: '43', cnh: '6458911777', cnh_vencimento: '2034-06-05', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7747', sofit_id: 7747, nome: 'Flavio Jose Guabiraba Barbosa', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7544', sofit_id: 7544, nome: 'Gabriel da Silva Galvao', funcao: 'Motorista', status: 'ativo', matricula: '89', cnh: '7950890105', cnh_vencimento: '2035-01-11', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '328', sofit_id: 328, nome: 'Geraldo Xavier Pimenta', funcao: 'Motorista', status: 'ativo', cnh: '2549746954', cnh_vencimento: '2028-03-31', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '21', sofit_id: 21, nome: 'Gilberto Camilo Azevedo', funcao: 'Motorista', status: 'ativo', matricula: '57', cnh: '5750807779', cnh_vencimento: '2036-01-27', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7548', sofit_id: 7548, nome: 'Guilherme Aprodu', funcao: 'Motorista', status: 'ativo', matricula: '95', cnh: '1284276653', cnh_vencimento: '2028-08-23', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '354', sofit_id: 354, nome: 'Guilherme Luis Shootoff Silva', funcao: 'Motorista', status: 'ativo', matricula: '3', cnh: '6038383681', cnh_vencimento: '2035-10-07', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - RJ', regiao: 'RJ' },
  { id: '7682', sofit_id: 7682, nome: 'Guilherme Luis Shotoff Silva', funcao: 'Motorista', status: 'afastado', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7552', sofit_id: 7552, nome: 'Ismael Antonio da Silva', funcao: 'Motorista', status: 'ativo', matricula: '79', cnh: '5719095125', cnh_vencimento: '2029-05-21', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7650', sofit_id: 7650, nome: 'Joao Paulo Souza Duarte Carvalho', funcao: 'Motorista', status: 'ativo', cnh: '6849140689', cnh_vencimento: '2034-07-25', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7555', sofit_id: 7555, nome: 'Joao Vitor Patricio Matias', funcao: 'Motorista', status: 'ativo', matricula: '88', cnh: '7268449933', cnh_vencimento: '2034-08-12', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7557', sofit_id: 7557, nome: 'Jocival Bonfim Nascimento', funcao: 'Motorista', status: 'ativo', matricula: '61', cnh: '1326105960', cnh_vencimento: '2030-08-21', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7351', sofit_id: 7351, nome: 'Joel dos Santos Olivio', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '5932', sofit_id: 5932, nome: 'Jorge Vinicius Melo do Nascimento', funcao: 'Motorista', status: 'ativo', matricula: '2878', filial: 'SAVIOR - RJ', centro_custo: 'Base Savior', regiao: 'RJ' },
  { id: '7561', sofit_id: 7561, nome: 'Jose Gecifram Alves Bezerra', funcao: 'Motorista', status: 'ativo', matricula: '24', cnh: '3776410980', cnh_vencimento: '2030-12-16', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7562', sofit_id: 7562, nome: 'Josevaldo da Silva', funcao: 'Motorista', status: 'ativo', matricula: '17', cnh: '1784812652', cnh_vencimento: '2028-09-11', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7564', sofit_id: 7564, nome: 'Kaique Santos Firmino', funcao: 'Motorista', status: 'ativo', matricula: '82', cnh: '6785313410', cnh_vencimento: '2036-02-25', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7565', sofit_id: 7565, nome: 'Laerte Stapani Junior', funcao: 'Motorista', status: 'ferias', matricula: '13', cnh: '1953745343', cnh_vencimento: '2026-09-15', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7252', sofit_id: 7252, nome: 'Lucas Santana de Oliveira', funcao: 'Compras', status: 'ativo', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7219', sofit_id: 7219, nome: 'Luciano Jose da Silva', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '76', sofit_id: 76, nome: 'Luciano Silva Santos', funcao: 'Motorista', status: 'ativo', matricula: '94', cnh: '4785966226', cnh_vencimento: '2030-10-16', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7568', sofit_id: 7568, nome: 'Luiz Prestes de Lima', funcao: 'Motorista', status: 'ativo', matricula: '62', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7570', sofit_id: 7570, nome: 'Marcelo Fagundes da Silva', funcao: 'Motorista', status: 'ativo', matricula: '47', cnh: '3430564397', cnh_vencimento: '2035-10-10', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '4942', sofit_id: 4942, nome: 'Marcio Ferreira da Silva', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7574', sofit_id: 7574, nome: 'Marcos Augusto Pimentel', funcao: 'Motorista', status: 'ativo', matricula: '54', cnh: '875527975', cnh_vencimento: '2031-02-26', email: 'marcosppimentel10@gmail.com', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7153', sofit_id: 7153, nome: 'Oltair Barbosa Araujo', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', centro_custo: 'a definir', regiao: 'SP' },
  { id: '7417', sofit_id: 7417, nome: 'Paulo Marrano', funcao: 'Motorista', status: 'ativo', cnh: '1621876337', filial: 'SAVIOR - SP', centro_custo: 'a definir', regiao: 'SP' },
  { id: '7714', sofit_id: 7714, nome: 'Paulo Rafael Castilho dos Santos', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7318', sofit_id: 7318, nome: 'Philipe Pinheiro Fernandes', funcao: 'Motorista', status: 'ativo', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '3424', sofit_id: 3424, nome: 'Roberto Carlos Luiz', funcao: 'Motorista', status: 'ativo', cnh: '1342284261', cnh_vencimento: '2031-02-18', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7649', sofit_id: 7649, nome: 'Samuel Jhonatan Bruno de Oliveira', funcao: 'Motorista', status: 'ativo', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '7585', sofit_id: 7585, nome: 'Sineval Blefari', funcao: 'Motorista', status: 'ativo', matricula: '23', cnh: '3527249129', cnh_vencimento: '2030-03-29', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7780', sofit_id: 7780, nome: 'Stephany Caminha da Silva', funcao: 'Auxiliar de Frota', status: 'ativo', filial: 'SAVIOR - SP', centro_custo: 'Base Savior', regiao: 'SP' },
  { id: '7589', sofit_id: 7589, nome: 'Wilson da Silva Rodrigues', funcao: 'Motorista', status: 'ativo', matricula: '42', cnh: '2084033583', cnh_vencimento: '2034-10-16', filial: 'SAVIOR - SP', regiao: 'SP' },
  { id: '6319', sofit_id: 6319, nome: 'Wilson da Silva Rodrigues', funcao: 'Motorista', status: 'ativo', email: 'adm.sp.02@savior.com.br', filial: 'SAVIOR - SP', regiao: 'SP' },

  // ── Profissionais de saúde (entrada manual, sem SofitView) ──────────
  // Médicos
  { id: 'med-001', sofit_id: 9001, nome: 'Dr. Ricardo Mendes Silva', funcao: 'Médico', status: 'ativo', matricula: 'M-001', telefone: '(21) 99812-3456', email: 'ricardo.mendes@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Equipe Médica RJ', regiao: 'RJ', conselho_tipo: 'CRM', conselho_numero: 'CRM-RJ 52-87432-1', conselho_uf: 'RJ', conselho_validade: '2028-03-15', especialidade: 'Emergência' },
  { id: 'med-002', sofit_id: 9002, nome: 'Dra. Ana Paula Ferreira', funcao: 'Médico', status: 'ativo', matricula: 'M-002', telefone: '(21) 99734-5678', email: 'ana.ferreira@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Equipe Médica RJ', regiao: 'RJ', conselho_tipo: 'CRM', conselho_numero: 'CRM-RJ 52-65218-9', conselho_uf: 'RJ', conselho_validade: '2027-11-20', especialidade: 'UTI/Emergência' },
  { id: 'med-003', sofit_id: 9003, nome: 'Dr. Fernando Costa Lima', funcao: 'Médico', status: 'ativo', matricula: 'M-003', telefone: '(11) 99456-7890', email: 'fernando.lima@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Equipe Médica SP', regiao: 'SP', conselho_tipo: 'CRM', conselho_numero: 'CRM-SP 12-34567-8', conselho_uf: 'SP', conselho_validade: '2029-06-30', especialidade: 'Emergência' },
  { id: 'med-004', sofit_id: 9004, nome: 'Dr. Carlos Eduardo Santos', funcao: 'Médico', status: 'ferias', matricula: 'M-004', telefone: '(21) 99621-0987', email: 'carlos.santos@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Equipe Médica RJ', regiao: 'RJ', conselho_tipo: 'CRM', conselho_numero: 'CRM-RJ 52-43219-5', conselho_uf: 'RJ', conselho_validade: '2028-09-12', especialidade: 'Clínica Médica' },

  // Enfermeiros
  { id: 'enf-001', sofit_id: 9005, nome: 'Enf. Patrícia Santos Oliveira', funcao: 'Enfermeiro', status: 'ativo', matricula: 'E-001', telefone: '(21) 99345-1234', email: 'patricia.oliveira@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Enfermagem RJ', regiao: 'RJ', conselho_tipo: 'COREN', conselho_numero: 'COREN-RJ 456.789', conselho_uf: 'RJ', conselho_validade: '2027-12-31', especialidade: 'Enfermagem UTI' },
  { id: 'enf-002', sofit_id: 9006, nome: 'Enf. Marcos Vinícius da Costa', funcao: 'Enfermeiro', status: 'ativo', matricula: 'E-002', telefone: '(21) 99567-8901', email: 'marcos.costa@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Enfermagem RJ', regiao: 'RJ', conselho_tipo: 'COREN', conselho_numero: 'COREN-RJ 321.654', conselho_uf: 'RJ', conselho_validade: '2028-05-15', especialidade: 'Enfermagem Emergência' },
  { id: 'enf-003', sofit_id: 9007, nome: 'Enf. Luciana Almeida Rocha', funcao: 'Enfermeiro', status: 'ativo', matricula: 'E-003', telefone: '(11) 99789-0123', email: 'luciana.rocha@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Enfermagem SP', regiao: 'SP', conselho_tipo: 'COREN', conselho_numero: 'COREN-SP 789.012', conselho_uf: 'SP', conselho_validade: '2029-02-28', especialidade: 'Enfermagem UTI' },
  { id: 'enf-004', sofit_id: 9008, nome: 'Enf. Roberto Gomes Pereira', funcao: 'Enfermeiro', status: 'afastado', matricula: 'E-004', telefone: '(21) 99123-4567', email: 'roberto.pereira@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Enfermagem RJ', regiao: 'RJ', conselho_tipo: 'COREN', conselho_numero: 'COREN-RJ 234.567', conselho_uf: 'RJ', conselho_validade: '2028-08-20', especialidade: 'Enfermagem Emergência' },
  { id: 'enf-005', sofit_id: 9009, nome: 'Enf. Camila Souza Barbosa', funcao: 'Enfermeiro', status: 'ativo', matricula: 'E-005', telefone: '(11) 99234-5678', email: 'camila.barbosa@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Enfermagem SP', regiao: 'SP', conselho_tipo: 'COREN', conselho_numero: 'COREN-SP 567.890', conselho_uf: 'SP', conselho_validade: '2029-04-10', especialidade: 'Enfermagem Emergência' },

  // Técnicos de Enfermagem
  { id: 'tec-001', sofit_id: 9010, nome: 'Tec. Adriana Lima Nascimento', funcao: 'Técnico de Enfermagem', status: 'ativo', matricula: 'T-001', telefone: '(21) 99876-5432', email: 'adriana.nascimento@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Enfermagem RJ', regiao: 'RJ', conselho_tipo: 'COREN', conselho_numero: 'COREN-RJ 890.123-TE', conselho_uf: 'RJ', conselho_validade: '2028-01-31', especialidade: 'Téc. Enfermagem' },
  { id: 'tec-002', sofit_id: 9011, nome: 'Tec. João Paulo Ribeiro', funcao: 'Técnico de Enfermagem', status: 'ativo', matricula: 'T-002', telefone: '(21) 99654-3210', email: 'joao.ribeiro@savior.com.br', filial: 'SAVIOR - RJ', centro_custo: 'Enfermagem RJ', regiao: 'RJ', conselho_tipo: 'COREN', conselho_numero: 'COREN-RJ 678.901-TE', conselho_uf: 'RJ', conselho_validade: '2027-10-15', especialidade: 'Téc. Enfermagem' },
  { id: 'tec-003', sofit_id: 9012, nome: 'Tec. Maria Clara Fernandes', funcao: 'Técnico de Enfermagem', status: 'ativo', matricula: 'T-003', telefone: '(11) 99432-1098', email: 'maria.fernandes@savior.com.br', filial: 'SAVIOR - SP', centro_custo: 'Enfermagem SP', regiao: 'SP', conselho_tipo: 'COREN', conselho_numero: 'COREN-SP 345.678-TE', conselho_uf: 'SP', conselho_validade: '2029-07-22', especialidade: 'Téc. Enfermagem' },
];

// ── Alocacoes (VTR assignments per employee) ─────────────────────────

export interface Alocacao {
  vtr_nome: string;
  vtr_placa: string;
  data_inicio: string;
  data_fim?: string;
  turno: string;
}

export const mockAlocacoes: Record<number, Alocacao[]> = {
  // Adilson
  7517: [
    { vtr_nome: '461', vtr_placa: 'EXX6071', data_inicio: '2026-07-15', turno: 'Diurno 12h' },
    { vtr_nome: '456', vtr_placa: 'FZP0692', data_inicio: '2026-04-01', data_fim: '2026-07-14', turno: 'Noturno 12h' },
  ],
  // Anderson de Souza
  53: [
    { vtr_nome: '350', vtr_placa: 'KRK7698', data_inicio: '2026-06-20', turno: 'Diurno 12h' },
    { vtr_nome: '429', vtr_placa: 'KQX7957', data_inicio: '2026-02-10', data_fim: '2026-06-19', turno: 'Diurno 12h' },
    { vtr_nome: '402', vtr_placa: 'KPL6507', data_inicio: '2025-09-01', data_fim: '2026-02-09', turno: 'Noturno 12h' },
  ],
  // Caetano Pedro Bento
  311: [
    { vtr_nome: '351', vtr_placa: 'LSI5434', data_inicio: '2026-08-01', turno: 'Diurno 12h' },
    { vtr_nome: '443', vtr_placa: 'RIO2I18', data_inicio: '2026-03-15', data_fim: '2026-07-31', turno: 'Noturno 12h' },
  ],
  // Danilo Gomes Colen
  345: [
    { vtr_nome: '340', vtr_placa: 'LSG7033', data_inicio: '2026-05-10', turno: 'Diurno 24h' },
    { vtr_nome: '341', vtr_placa: 'LSG7030', data_inicio: '2025-11-01', data_fim: '2026-05-09', turno: 'Noturno 12h' },
  ],
  // Denilson Rocha
  7532: [
    { vtr_nome: '437', vtr_placa: 'KRI8396', data_inicio: '2026-07-01', turno: 'Noturno 12h' },
    { vtr_nome: '436', vtr_placa: 'KRI8395', data_inicio: '2026-02-15', data_fim: '2026-06-30', turno: 'Diurno 12h' },
  ],
  // Elson Firmino
  7538: [
    { vtr_nome: '429', vtr_placa: 'KQX7957', data_inicio: '2026-06-20', turno: 'Noturno 12h' },
    { vtr_nome: '430', vtr_placa: 'KQX7956', data_inicio: '2026-01-10', data_fim: '2026-06-19', turno: 'Diurno 12h' },
  ],
  // Gilberto Camilo Azevedo
  21: [
    { vtr_nome: '340', vtr_placa: 'LSG7033', data_inicio: '2026-08-10', turno: 'Noturno 12h' },
    { vtr_nome: '438', vtr_placa: 'LSG5674', data_inicio: '2026-03-01', data_fim: '2026-08-09', turno: 'Diurno 12h' },
    { vtr_nome: '342', vtr_placa: 'LSG7034', data_inicio: '2025-10-15', data_fim: '2026-02-28', turno: 'Diurno 12h' },
  ],
  // Felipe da Conceicao Amaral
  7541: [
    { vtr_nome: '341', vtr_placa: 'LSG7030', data_inicio: '2026-07-20', turno: 'Diurno 12h' },
    { vtr_nome: '462', vtr_placa: 'EGR9813', data_inicio: '2026-03-01', data_fim: '2026-07-19', turno: 'Noturno 12h' },
  ],
  // Gabriel da Silva Galvao
  7544: [
    { vtr_nome: '463', vtr_placa: 'EEX4391', data_inicio: '2026-06-01', turno: 'Diurno 12h' },
    { vtr_nome: '464', vtr_placa: 'ESK0632', data_inicio: '2026-01-15', data_fim: '2026-05-31', turno: 'Noturno 12h' },
  ],
  // Guilherme Shootoff (RJ)
  354: [
    { vtr_nome: '353', vtr_placa: 'KRK7697', data_inicio: '2026-06-15', turno: 'Diurno 24h' },
    { vtr_nome: '354', vtr_placa: 'KRL3687', data_inicio: '2026-01-01', data_fim: '2026-06-14', turno: 'Diurno 12h' },
  ],
  // Jorge Vinicius (RJ)
  5932: [
    { vtr_nome: '427', vtr_placa: 'LSB7248', data_inicio: '2026-07-01', turno: 'Noturno 12h' },
    { vtr_nome: '448', vtr_placa: 'RIO4H67', data_inicio: '2026-02-01', data_fim: '2026-06-30', turno: 'Diurno 12h' },
  ],
  // Kaique Santos Firmino
  7564: [
    { vtr_nome: '466', vtr_placa: 'EZE2094', data_inicio: '2026-08-01', turno: 'Diurno 12h' },
    { vtr_nome: '465', vtr_placa: 'GGQ8413', data_inicio: '2026-04-10', data_fim: '2026-07-31', turno: 'Noturno 12h' },
  ],
  // Laerte Stapani Junior
  7565: [
    { vtr_nome: '457', vtr_placa: 'FHV2911', data_inicio: '2026-05-20', turno: 'Diurno 12h' },
    { vtr_nome: '458', vtr_placa: 'FKC6682', data_inicio: '2025-12-01', data_fim: '2026-05-19', turno: 'Noturno 12h' },
  ],
  // Marcelo Fagundes
  7570: [
    { vtr_nome: '475', vtr_placa: 'BZK3J29', data_inicio: '2026-07-10', turno: 'Diurno 12h' },
    { vtr_nome: '476', vtr_placa: 'BZK1H49', data_inicio: '2026-03-01', data_fim: '2026-07-09', turno: 'Noturno 12h' },
  ],
  // Sineval Blefari
  7585: [
    { vtr_nome: '477', vtr_placa: 'RKM1A89', data_inicio: '2026-06-01', turno: 'Noturno 12h' },
    { vtr_nome: '479', vtr_placa: 'RKM1A87', data_inicio: '2026-01-15', data_fim: '2026-05-31', turno: 'Diurno 12h' },
  ],
  // Wilson da Silva Rodrigues
  7589: [
    { vtr_nome: '501', vtr_placa: 'FAH6H42', data_inicio: '2026-08-05', turno: 'Diurno 12h' },
    { vtr_nome: '502', vtr_placa: 'FJP3B32', data_inicio: '2026-04-01', data_fim: '2026-08-04', turno: 'Noturno 12h' },
  ],
};

// ── Ocorrencias (employee events) ────────────────────────────────────

export interface Ocorrencia {
  data: string;
  tipo: 'checklist' | 'multa' | 'atendimento' | 'falta' | 'elogio';
  descricao: string;
}

export const mockOcorrencias: Record<number, Ocorrencia[]> = {
  7517: [
    { data: '2026-08-18', tipo: 'checklist', descricao: 'Checklist VTR 461 realizado sem pendencias' },
    { data: '2026-08-10', tipo: 'atendimento', descricao: 'Transferencia inter-hospitalar concluida em 28 min (meta: 35 min)' },
    { data: '2026-07-22', tipo: 'elogio', descricao: 'Elogio registrado pela familia do paciente no chamado #4389' },
  ],
  53: [
    { data: '2026-08-19', tipo: 'checklist', descricao: 'Checklist VTR 350 com pendencia: extintor vencido' },
    { data: '2026-08-12', tipo: 'atendimento', descricao: 'Atendimento emergencial Botafogo, tempo resposta 12 min' },
    { data: '2026-07-30', tipo: 'multa', descricao: 'Multa por excesso de velocidade na Av. Brasil (72 km/h em via de 60)' },
    { data: '2026-07-15', tipo: 'elogio', descricao: 'Paciente elogiou cuidado no transporte, chamado #4301' },
  ],
  311: [
    { data: '2026-08-17', tipo: 'checklist', descricao: 'Checklist VTR 351 aprovado integralmente' },
    { data: '2026-08-05', tipo: 'atendimento', descricao: 'Remocao Meier para Barra da Tijuca em 42 min' },
    { data: '2026-07-28', tipo: 'falta', descricao: 'Falta justificada (atestado medico 1 dia)' },
    { data: '2026-07-10', tipo: 'elogio', descricao: 'SulAmerica registrou elogio formal sobre pontualidade' },
  ],
  345: [
    { data: '2026-08-15', tipo: 'checklist', descricao: 'Checklist VTR 340 com pendencia: pneu traseiro desgastado' },
    { data: '2026-08-08', tipo: 'atendimento', descricao: 'UTI movel acionada para PCR, equipe chegou em 9 min' },
    { data: '2026-07-20', tipo: 'atendimento', descricao: 'Transferencia Hospital Badim para Copa Star sem intercorrencias' },
  ],
  7532: [
    { data: '2026-08-16', tipo: 'checklist', descricao: 'Checklist VTR 437 realizado, desfibrilador OK' },
    { data: '2026-08-02', tipo: 'elogio', descricao: 'Intermédica elogiou profissionalismo no chamado #4412' },
    { data: '2026-07-18', tipo: 'atendimento', descricao: 'Atendimento noturno em Jacarepagua, tempo resposta 15 min' },
  ],
  7538: [
    { data: '2026-08-14', tipo: 'checklist', descricao: 'Checklist VTR 429 aprovado' },
    { data: '2026-08-01', tipo: 'multa', descricao: 'Multa por estacionamento irregular durante atendimento (Tijuca)' },
    { data: '2026-07-25', tipo: 'atendimento', descricao: 'Transporte Botafogo para Silvestre em 18 min' },
    { data: '2026-07-12', tipo: 'elogio', descricao: 'Bradesco Saude elogiou atendimento no chamado #4288' },
  ],
  21: [
    { data: '2026-08-19', tipo: 'checklist', descricao: 'Checklist VTR 340 aprovado integralmente' },
    { data: '2026-08-13', tipo: 'atendimento', descricao: 'UTI movel Copacabana, equipe no local em 7 min' },
    { data: '2026-07-29', tipo: 'atendimento', descricao: 'Transferencia Samaritano para Copa D\'Or concluida' },
    { data: '2026-07-05', tipo: 'elogio', descricao: 'Familia registrou agradecimento formal, chamado #4245' },
    { data: '2026-06-20', tipo: 'multa', descricao: 'Advertencia por atraso no retorno da base' },
  ],
  7541: [
    { data: '2026-08-18', tipo: 'checklist', descricao: 'Checklist VTR 341 com pendencia: nivel de O2 baixo' },
    { data: '2026-08-06', tipo: 'atendimento', descricao: 'Despacho Maracana para Copacabana, 22 min total' },
    { data: '2026-07-16', tipo: 'falta', descricao: 'Falta injustificada' },
  ],
  7544: [
    { data: '2026-08-17', tipo: 'checklist', descricao: 'Checklist VTR 463 sem pendencias' },
    { data: '2026-08-09', tipo: 'atendimento', descricao: 'Transporte basico SP zona sul, tempo 25 min' },
    { data: '2026-07-23', tipo: 'elogio', descricao: 'Paciente elogiou cordialidade no chamado #4355' },
  ],
  354: [
    { data: '2026-08-16', tipo: 'checklist', descricao: 'Checklist VTR 353 aprovado' },
    { data: '2026-08-03', tipo: 'atendimento', descricao: 'Atendimento RJ zona norte, resposta em 11 min' },
    { data: '2026-07-19', tipo: 'multa', descricao: 'Multa DETRAN-RJ: avanco de sinal vermelho (camera)' },
    { data: '2026-07-01', tipo: 'atendimento', descricao: 'Remocao Ilha do Governador para Bonsucesso' },
  ],
  5932: [
    { data: '2026-08-15', tipo: 'checklist', descricao: 'Checklist VTR 427 com pendencia: farois de neblina' },
    { data: '2026-08-07', tipo: 'atendimento', descricao: 'Transporte noturno Sao Cristovao, 14 min' },
    { data: '2026-07-24', tipo: 'elogio', descricao: 'Coordenacao RJ elogiou disponibilidade e pontualidade' },
  ],
  7564: [
    { data: '2026-08-19', tipo: 'checklist', descricao: 'Checklist VTR 466 aprovado' },
    { data: '2026-08-11', tipo: 'atendimento', descricao: 'Transporte SP zona leste, 30 min porta a porta' },
    { data: '2026-07-26', tipo: 'atendimento', descricao: 'Cobertura de evento corporativo em Guarulhos' },
  ],
  7565: [
    { data: '2026-08-13', tipo: 'checklist', descricao: 'Checklist VTR 457 com pendencia: cinto motorista' },
    { data: '2026-08-04', tipo: 'falta', descricao: 'Falta justificada (compromisso pessoal pre-aprovado)' },
    { data: '2026-07-21', tipo: 'atendimento', descricao: 'Transporte SP centro para zona sul, 35 min' },
    { data: '2026-07-08', tipo: 'elogio', descricao: 'Prevent Senior elogiou pontualidade no chamado #4267' },
  ],
  7570: [
    { data: '2026-08-18', tipo: 'checklist', descricao: 'Checklist VTR 475 aprovado integralmente' },
    { data: '2026-08-10', tipo: 'atendimento', descricao: 'Transferencia SP para Guarulhos, 40 min' },
    { data: '2026-07-27', tipo: 'elogio', descricao: 'Hospital Albert Einstein elogiou cuidado no transporte' },
  ],
  7585: [
    { data: '2026-08-17', tipo: 'checklist', descricao: 'Checklist VTR 477 aprovado' },
    { data: '2026-08-09', tipo: 'atendimento', descricao: 'Transporte noturno SP zona oeste, 28 min' },
    { data: '2026-07-31', tipo: 'multa', descricao: 'Multa por rodizio municipal SP (esquecimento)' },
    { data: '2026-07-14', tipo: 'elogio', descricao: 'Amil registrou elogio sobre profissionalismo' },
  ],
  7589: [
    { data: '2026-08-19', tipo: 'checklist', descricao: 'Checklist VTR 501 sem pendencias' },
    { data: '2026-08-12', tipo: 'atendimento', descricao: 'Transporte SP Pinheiros para Vila Mariana, 22 min' },
    { data: '2026-07-29', tipo: 'atendimento', descricao: 'Cobertura evento esportivo Morumbi' },
    { data: '2026-07-17', tipo: 'elogio', descricao: 'Paciente elogiou no Google Reviews (5 estrelas)' },
  ],
};

// ── Realistic chamados with real placas and RJ addresses ─────────────

export const mockChamados: Chamado[] = [
  {
    id: '1', numero: 4521, status: 'em_transito', prioridade: 'urgente', servico: 'uti', canal: 'whatsapp',
    paciente_nome: 'Maria Helena da Silva', paciente_telefone: '(21) 99847-3201', paciente_idade: 72,
    solicitante_nome: 'Joao Silva (filho)', origem: 'Hospital Samaritano — R. Bambina, 98, Botafogo',
    destino: 'Hospital Copa D\'Or — R. Figueiredo de Magalhaes, 875, Copacabana',
    vtr_placa: 'LSG7033', vtr_nome: '340', equipe: 'Dr. Mendes + Enf. Santos + Mot. Gilberto Azevedo',
    valor_cotado: 2800, created_at: '2026-08-20T10:15:00Z', eta_minutos: 8, distancia_km: 4.2, pagamento_status: 'aprovado',
    bot_managed: true, sla_minutos: 12, created_at_ts: new Date('2026-08-20T10:15:00Z').getTime(),
  },
  {
    id: '2', numero: 4520, status: 'aprovado', prioridade: 'urgente', servico: 'uti', canal: 'telefone',
    paciente_nome: 'Carlos Alberto Mendes', paciente_telefone: '(21) 98234-5501', paciente_idade: 58,
    solicitante_nome: 'SulAmérica Saúde', origem: 'Hospital Federal de Bonsucesso — Av. Londres, 616, Bonsucesso',
    destino: 'Hospital Barra D\'Or — Av. Ayrton Senna, 2541, Barra da Tijuca',
    vtr_placa: null, vtr_nome: null, equipe: null,
    valor_cotado: 3200, created_at: '2026-08-20T09:45:00Z', eta_minutos: null, distancia_km: 28.5, pagamento_status: 'pendente',
    bot_managed: false, sla_minutos: 22, created_at_ts: new Date('2026-08-20T09:45:00Z').getTime(), atendente: 'Cláudia Feitoza',
  },
  {
    id: '3', numero: 4519, status: 'em_transporte', prioridade: 'normal', servico: 'basica', canal: 'whatsapp',
    paciente_nome: 'Ana Beatriz Lopes', paciente_telefone: '(21) 97321-8844', paciente_idade: 34,
    solicitante_nome: 'Prevent Senior', origem: 'R. das Laranjeiras, 488 — Laranjeiras',
    destino: 'Clínica São Lucas — R. Conde de Bonfim, 232, Tijuca',
    vtr_placa: 'KRK7698', vtr_nome: '350', equipe: 'Enf. Costa + Mot. Anderson de Souza',
    valor_cotado: 950, created_at: '2026-08-20T09:30:00Z', eta_minutos: 14, distancia_km: 8.7, pagamento_status: 'aprovado',
    bot_managed: true, sla_minutos: 18, created_at_ts: new Date('2026-08-20T09:30:00Z').getTime(),
  },
  {
    id: '4', numero: 4518, status: 'aberto', prioridade: 'urgente', servico: 'uti', canal: 'site',
    paciente_nome: 'Roberto Carlos Farias', paciente_telefone: '(21) 96789-4412', paciente_idade: 81,
    solicitante_nome: 'Roberto Farias', origem: 'R. Voluntários da Pátria, 446 — Botafogo',
    destino: 'A definir',
    vtr_placa: null, vtr_nome: null, equipe: null,
    valor_cotado: null, created_at: '2026-08-20T10:32:00Z', eta_minutos: null, distancia_km: null, pagamento_status: 'pendente',
    bot_managed: true, sla_minutos: 25, created_at_ts: new Date('2026-08-20T10:32:00Z').getTime(),
  },
  {
    id: '5', numero: 4517, status: 'em_transito', prioridade: 'normal', servico: 'basica', canal: 'whatsapp',
    paciente_nome: 'Lúcia Tavares de Almeida', paciente_telefone: '(21) 98456-2233', paciente_idade: 45,
    solicitante_nome: 'Amil', origem: 'Hospital Municipal Salgado Filho — R. Arquias Cordeiro, 370, Méier',
    destino: 'Hospital Vitória — Av. das Américas, 3555, Barra da Tijuca',
    vtr_placa: 'LSI5434', vtr_nome: '351', equipe: 'Téc. Almeida + Mot. Caetano Bento',
    valor_cotado: 1500, created_at: '2026-08-20T08:20:00Z', eta_minutos: 22, distancia_km: 18.3, pagamento_status: 'aprovado',
    bot_managed: true, sla_minutos: 15, created_at_ts: new Date('2026-08-20T08:20:00Z').getTime(),
  },
  {
    id: '6', numero: 4516, status: 'concluido', prioridade: 'normal', servico: 'basica', canal: 'telefone',
    paciente_nome: 'Pedro Augusto Ribeiro', paciente_telefone: '(21) 97654-8890', paciente_idade: 67,
    solicitante_nome: 'Bradesco Saúde', origem: 'R. São Clemente, 226 — Botafogo',
    destino: 'Hospital Adventista Silvestre — Ladeira do Ascurra, 274, Cosme Velho',
    vtr_placa: 'KQX7957', vtr_nome: '429', equipe: 'Enf. Martins + Mot. Elson Firmino',
    valor_cotado: 750, created_at: '2026-08-20T06:15:00Z', eta_minutos: null, distancia_km: 5.1, pagamento_status: 'pago',
    bot_managed: false, sla_minutos: 20, created_at_ts: new Date('2026-08-20T06:15:00Z').getTime(), atendente: 'Cláudia Feitoza',
  },
  {
    id: '7', numero: 4515, status: 'concluido', prioridade: 'normal', servico: 'uti', canal: 'whatsapp',
    paciente_nome: 'Francisca de Oliveira', paciente_telefone: '(21) 99123-7766', paciente_idade: 89,
    solicitante_nome: 'Intermédica', origem: 'Hospital Cardoso Fontes — R. Cardoso Fontes, 90, Jacarepaguá',
    destino: 'Hospital Rios D\'Or — R. Padre Telêmaco, 400, Jacarepaguá',
    vtr_placa: 'KRI8396', vtr_nome: '437', equipe: 'Dr. Lima + Enf. Rocha + Mot. Denilson Rocha',
    valor_cotado: 2200, created_at: '2026-08-20T04:30:00Z', eta_minutos: null, distancia_km: 6.8, pagamento_status: 'pago',
    bot_managed: true, sla_minutos: 15, created_at_ts: new Date('2026-08-20T04:30:00Z').getTime(),
  },
  {
    id: '8', numero: 4514, status: 'aberto', prioridade: 'normal', servico: 'basica', canal: 'email',
    paciente_nome: 'Joaquim Pereira Neto', paciente_telefone: '(21) 98765-1199', paciente_idade: 55,
    solicitante_nome: 'Petrobras (SESMT)', origem: 'EDISE Petrobras — Av. Chile, 65, Centro',
    destino: 'Hospital Federal dos Servidores — R. Sacadura Cabral, 178, Saúde',
    vtr_placa: null, vtr_nome: null, equipe: null,
    valor_cotado: null, created_at: '2026-08-20T10:40:00Z', eta_minutos: null, distancia_km: 2.3, pagamento_status: 'pendente',
    bot_managed: true, sla_minutos: 20, created_at_ts: new Date('2026-08-20T10:40:00Z').getTime(),
  },
  {
    id: '9', numero: 4513, status: 'cancelado', prioridade: 'baixa', servico: 'remocao', canal: 'whatsapp',
    paciente_nome: 'Tereza Cristina Moraes', paciente_telefone: '(21) 97111-3344', paciente_idade: 61,
    solicitante_nome: 'Particular', origem: 'R. Gomes Freire, 471 — Centro',
    destino: 'Hospital Quinta D\'Or — R. Almirante Baltazar, 435, São Cristóvão',
    vtr_placa: null, vtr_nome: null, equipe: null,
    valor_cotado: 680, created_at: '2026-08-20T07:50:00Z', eta_minutos: null, distancia_km: 4.5, pagamento_status: 'pendente',
    bot_managed: true, sla_minutos: 30, created_at_ts: new Date('2026-08-20T07:50:00Z').getTime(),
  },
  {
    id: '10', numero: 4512, status: 'despacho', prioridade: 'urgente', servico: 'uti', canal: 'telefone',
    paciente_nome: 'Manoel Francisco dos Santos', paciente_telefone: '(21) 99876-5544', paciente_idade: 76,
    solicitante_nome: 'SulAmérica Saúde', origem: 'Hospital Badim — R. São Francisco Xavier, 389, Maracanã',
    destino: 'Hospital Copa Star — R. Figueiredo de Magalhães, 690, Copacabana',
    vtr_placa: 'LSG7030', vtr_nome: '341', equipe: 'Dr. Ferreira + Enf. Cardoso + Mot. Felipe Amaral',
    valor_cotado: 3500, created_at: '2026-08-20T10:05:00Z', eta_minutos: 18, distancia_km: 12.4, pagamento_status: 'aprovado',
    bot_managed: false, sla_minutos: 15, created_at_ts: new Date('2026-08-20T10:05:00Z').getTime(), atendente: 'Cláudia Feitoza',
  },
  {
    id: '11', numero: 4511, status: 'concluido', prioridade: 'normal', servico: 'basica', canal: 'whatsapp',
    paciente_nome: 'Sônia Maria Ferreira', paciente_telefone: '(21) 98333-2211', paciente_idade: 43,
    solicitante_nome: 'Bradesco Saúde', origem: 'Hospital Pró-Cardíaco — R. General Polidoro, 192, Botafogo',
    destino: 'Residência — R. Marquês de Abrantes, 177, Flamengo',
    vtr_placa: 'LRY6677', vtr_nome: '428', equipe: 'Téc. Souza + Mot. Guilherme Aprodu',
    valor_cotado: 420, created_at: '2026-08-20T02:00:00Z', eta_minutos: null, distancia_km: 1.8, pagamento_status: 'pago',
    bot_managed: true, sla_minutos: 20, created_at_ts: new Date('2026-08-20T02:00:00Z').getTime(),
  },
  {
    id: '12', numero: 4510, status: 'em_cotacao', prioridade: 'normal', servico: 'evento', canal: 'email',
    paciente_nome: 'Cobertura Evento', paciente_telefone: '(21) 3171-3030', paciente_idade: 0,
    solicitante_nome: 'Petrobras (Eventos)', origem: 'Riocentro — Av. Salvador Allende, 6555, Barra da Tijuca',
    destino: 'Riocentro (cobertura local)',
    vtr_placa: null, vtr_nome: null, equipe: null,
    valor_cotado: 4500, created_at: '2026-08-20T09:00:00Z', eta_minutos: null, distancia_km: null, pagamento_status: 'pendente',
    bot_managed: false, sla_minutos: 60, created_at_ts: new Date('2026-08-20T09:00:00Z').getTime(), atendente: 'Cláudia Feitoza',
  },
];

// ── Mock chat messages for Central ───────────────────────────────────

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'operator';
  text: string;
  time: string;
}

export const mockChatMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'c1', sender: 'patient', text: 'Boa tarde, preciso de UTI movel para minha mae. Ela esta no Samaritano Botafogo.', time: '10:15' },
    { id: 'c2', sender: 'operator', text: 'Boa tarde, Joao. Pode me informar o nome completo da paciente e o quadro clinico?', time: '10:16' },
    { id: 'c3', sender: 'patient', text: 'Maria Helena da Silva, 72 anos. Pos-operatorio cardiaco, precisa transferir pro Copa D\'Or.', time: '10:17' },
    { id: 'c4', sender: 'operator', text: 'Entendido. Vou preparar a cotacao para UTI movel. Ja temos uma VTR proxima na regiao.', time: '10:18' },
    { id: 'c5', sender: 'operator', text: 'Cotacao: R$ 2.800,00. UTI 340, equipe medica completa. ETA 8 minutos. Aprovado?', time: '10:22' },
    { id: 'c6', sender: 'patient', text: 'Aprovado. Pode enviar.', time: '10:23' },
  ],
  '4': [
    { id: 'c7', sender: 'patient', text: 'Boa tarde, meu pai precisa de ambulancia UTI urgente. Rua Voluntarios da Patria 446, Botafogo.', time: '10:32' },
    { id: 'c8', sender: 'operator', text: 'Boa tarde, Sr. Roberto. Estamos verificando disponibilidade de UTI movel. Qual o quadro do paciente?', time: '10:33' },
    { id: 'c9', sender: 'patient', text: 'Roberto Carlos Farias, 81 anos. Insuficiencia respiratoria. O hospital de destino ainda nao foi definido.', time: '10:34' },
  ],
};

// ── Config maps ──────────────────────────────────────────────────────

export const statusPill: Record<string, string> = {
  disponivel: 'pill-green',
  em_atendimento: 'pill-amber',
  manutencao: 'pill-red',
  aberto: 'pill-blue',
  em_cotacao: 'pill-violet',
  aprovado: 'pill-green',
  despacho: 'pill-amber',
  em_transito: 'pill-blue',
  no_local: 'pill-green',
  em_transporte: 'pill-amber',
  concluido: 'pill-slate',
  cancelado: 'pill-red',
};

export const statusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  em_atendimento: 'Em atendimento',
  manutencao: 'Manutenção',
  aberto: 'Aberto',
  em_cotacao: 'Em cotação',
  aprovado: 'Aprovado',
  despacho: 'Despacho',
  em_transito: 'Em trânsito',
  no_local: 'No local',
  em_transporte: 'Transportando',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const tipoVtrPill: Record<VtrTipo, { label: string; pill: string }> = {
  uti: { label: 'UTI', pill: 'pill-red' },
  basica: { label: 'Básica', pill: 'pill-green' },
  moto: { label: 'Moto', pill: 'pill-amber' },
};

export const servicoPill: Record<ChamadoServico, { label: string; pill: string }> = {
  uti: { label: 'UTI', pill: 'pill-red' },
  basica: { label: 'Básica', pill: 'pill-green' },
  remocao: { label: 'Remoção', pill: 'pill-amber' },
  evento: { label: 'Evento', pill: 'pill-blue' },
  cobertura: { label: 'Cobertura', pill: 'pill-blue' },
};

export const canalConfig: Record<ChamadoCanal, { label: string; icon: string }> = {
  whatsapp: { label: 'WhatsApp', icon: 'MessageCircle' },
  telefone: { label: 'Telefone', icon: 'Phone' },
  site: { label: 'Site', icon: 'Globe' },
  email: { label: 'Email', icon: 'Mail' },
  manual: { label: 'Manual', icon: 'PenLine' },
};

export const prioridadePill: Record<ChamadoPrioridade, string> = {
  urgente: 'pill-red',
  normal: 'pill-blue',
  baixa: 'pill-slate',
};

// ── Top 20 suppliers from SofitView (most relevant) ─────────────────

export interface Supplier {
  id: number;
  nome: string;
  tipo: string;
  bairro: string | null;
  uf: 'RJ' | 'SP';
}

export const mockSuppliers: Supplier[] = [
  { id: 140, nome: '0 KM', tipo: 'Oficina', bairro: 'Vila Guilherme', uf: 'SP' },
  { id: 201, nome: 'ADJ Diesel', tipo: 'Oficina', bairro: 'Jardim Carioca', uf: 'RJ' },
  { id: 312, nome: 'Altese', tipo: 'Oficina', bairro: 'Penha', uf: 'RJ' },
  { id: 455, nome: 'Amazonas France Veiculos e Pecas', tipo: 'Oficina', bairro: 'Santana', uf: 'SP' },
  { id: 102, nome: 'Auto Mecanica Beira Rio', tipo: 'Oficina', bairro: 'Sao Cristovao', uf: 'RJ' },
  { id: 223, nome: 'Borracharia Express', tipo: 'Reformador de pneus', bairro: 'Benfica', uf: 'RJ' },
  { id: 334, nome: 'Center Diesel Servicos', tipo: 'Oficina', bairro: 'Meier', uf: 'RJ' },
  { id: 445, nome: 'Posto Arinella Interlagos', tipo: 'Posto de combustivel', bairro: 'Interlagos', uf: 'SP' },
  { id: 112, nome: 'Posto Bandeirantes', tipo: 'Posto de combustivel', bairro: 'Vila Isabel', uf: 'RJ' },
  { id: 221, nome: 'Posto Beira Mar', tipo: 'Posto de combustivel', bairro: 'Botafogo', uf: 'RJ' },
  { id: 330, nome: 'Posto Shell Maracana', tipo: 'Posto de combustivel', bairro: 'Maracana', uf: 'RJ' },
  { id: 441, nome: 'Retifica Motores Brasil', tipo: 'Oficina', bairro: 'Del Castilho', uf: 'RJ' },
  { id: 156, nome: 'ATK Acessorios', tipo: 'Oficina', bairro: 'Portal da Cidade Amiga', uf: 'SP' },
  { id: 267, nome: 'Arcotec Comercio', tipo: 'Oficina', bairro: 'Chacara California', uf: 'SP' },
  { id: 378, nome: 'Alji Tintas', tipo: 'Oficina', bairro: 'Parque Santo Antonio', uf: 'SP' },
  { id: 489, nome: 'AM Auto Eletrica', tipo: 'Oficina', bairro: 'Jardim Monte Alegre', uf: 'SP' },
  { id: 501, nome: 'Alpha Center Servicos', tipo: 'Posto de combustivel', bairro: null, uf: 'SP' },
  { id: 512, nome: 'Agua Marinha', tipo: 'Posto de combustivel', bairro: null, uf: 'RJ' },
  { id: 603, nome: 'Renault Servicos Especializados', tipo: 'Oficina', bairro: 'Benfica', uf: 'RJ' },
  { id: 614, nome: 'Mercedes-Benz Sprinter Center', tipo: 'Oficina', bairro: 'Sao Cristovao', uf: 'RJ' },
];

// ── Warehouses from SofitView (21 total) ────────────────────────────

export interface Warehouse {
  id: number;
  nome: string;
  uf: 'RJ' | 'SP';
  ativo: boolean;
}

export const mockWarehouses: Warehouse[] = [
  { id: 57, nome: 'Controle de Estoque RJ 2023', uf: 'RJ', ativo: true },
  { id: 123, nome: 'Estoque 2024 RJ', uf: 'RJ', ativo: true },
  { id: 16, nome: 'Estoque antigo SP', uf: 'SP', ativo: true },
  { id: 18, nome: 'Estoque Atualizado SP', uf: 'SP', ativo: true },
  { id: 21, nome: 'Estoque Pecas Novas RJ', uf: 'RJ', ativo: true },
  { id: 17, nome: 'Estoque RJ Antigo', uf: 'RJ', ativo: true },
  { id: 19, nome: 'Estoque RJ', uf: 'RJ', ativo: true },
  { id: 22, nome: 'Estoque RJ Novo', uf: 'RJ', ativo: true },
  { id: 23, nome: 'Estoque SP', uf: 'SP', ativo: true },
  { id: 90, nome: 'Estoque SP 12/12/2023', uf: 'SP', ativo: true },
  { id: 189, nome: 'Estoque SP 2026', uf: 'SP', ativo: true },
  { id: 156, nome: 'Materiais de Limpeza RJ', uf: 'RJ', ativo: true },
  { id: 222, nome: 'Sao Paulo 2026', uf: 'SP', ativo: true },
  { id: 1, nome: 'Sprinter 313 CDI (2010)', uf: 'SP', ativo: true },
  { id: 5, nome: 'Acessorios Sprinter/Master SP', uf: 'SP', ativo: false },
  { id: 9, nome: 'Boxer 2.3 RJ', uf: 'RJ', ativo: false },
  { id: 6, nome: 'Boxer 2.5 RJ', uf: 'RJ', ativo: false },
  { id: 24, nome: 'Estoque 2023 RJ', uf: 'RJ', ativo: false },
  { id: 4, nome: 'Master 2.3 (2015/2018) SP', uf: 'SP', ativo: false },
  { id: 3, nome: 'Master 2.5 (2012) SP', uf: 'SP', ativo: false },
  { id: 2, nome: 'Sprinter 415 CDI (2015/16) SP', uf: 'SP', ativo: false },
];

// ── Bot events for Central de Supervisão ─────────────────────────────

export type BotEventType = 'received' | 'qualified' | 'quoted' | 'dispatched' | 'payment' | 'eta_sent' | 'completed' | 'intervention';

export interface BotEvent {
  id: string;
  timestamp: string;
  type: BotEventType;
  chamado_numero: number;
  chamado_id: string;
  description: string;
  detail?: string;
  auto: boolean;
}

export interface BotActionStep {
  time: string;
  action: string;
  current?: boolean;
}

export const mockBotEvents: BotEvent[] = [
  // #4521 — UTI em andamento (bot gerenciando)
  { id: 'be1', timestamp: '10:32', type: 'qualified', chamado_numero: 4521, chamado_id: '1', description: 'Bot qualificou #4521', detail: 'UTI · Botafogo → Copa D\'Or', auto: true },
  { id: 'be2', timestamp: '10:31', type: 'quoted', chamado_numero: 4521, chamado_id: '1', description: 'Bot enviou cotacao #4521', detail: 'R$ 2.800 · Particular · Pix gerado', auto: true },
  // #4520 — UTI aprovado, aguardando despacho
  { id: 'be3', timestamp: '10:28', type: 'dispatched', chamado_numero: 4520, chamado_id: '2', description: 'Bot despachou VTR 340 → #4520', detail: 'ETA 14 min · UTI', auto: true },
  { id: 'be4', timestamp: '10:25', type: 'completed', chamado_numero: 4519, chamado_id: '3', description: '#4519 concluido (100% automatico)', detail: 'Basica · R$ 950 · 47 min total', auto: true },
  // #4518 — Intervenção (cliente não informou endereço)
  { id: 'be5', timestamp: '10:22', type: 'intervention', chamado_numero: 4518, chamado_id: '4', description: 'INTERVENCAO #4518', detail: 'Bot nao conseguiu qualificar\n"Cliente pediu ambulancia mas nao informou endereco"', auto: false },
  // #4521 recebido
  { id: 'be6', timestamp: '10:15', type: 'received', chamado_numero: 4521, chamado_id: '1', description: 'Bot recebeu novo chamado #4521', detail: 'WhatsApp · Joao Silva · "Preciso de UTI para minha mae"', auto: true },
  // #4520 pagamento
  { id: 'be7', timestamp: '10:12', type: 'payment', chamado_numero: 4520, chamado_id: '2', description: 'Pagamento confirmado #4520', detail: 'Pix R$ 3.200 · SulAmerica', auto: true },
  // #4520 ETA enviado
  { id: 'be8', timestamp: '10:08', type: 'eta_sent', chamado_numero: 4520, chamado_id: '2', description: 'Bot enviou ETA ao solicitante #4520', detail: '"Ambulancia a 8 minutos"', auto: true },
  // #4517 concluido
  { id: 'be9', timestamp: '09:55', type: 'completed', chamado_numero: 4517, chamado_id: '5', description: '#4517 concluido (100% automatico)', detail: 'Basica · R$ 1.500 · 32 min total', auto: true },
  // #4520 qualificado
  { id: 'be10', timestamp: '09:45', type: 'qualified', chamado_numero: 4520, chamado_id: '2', description: 'Bot qualificou #4520', detail: 'UTI · Bonsucesso → Barra D\'Or', auto: true },
  // #4516 intervenção — convênio
  { id: 'be11', timestamp: '09:40', type: 'intervention', chamado_numero: 4516, chamado_id: '6', description: 'INTERVENCAO #4516', detail: 'Convenio Bradesco precisa autorizacao manual', auto: false },
  // #4516 recebido
  { id: 'be12', timestamp: '09:30', type: 'received', chamado_numero: 4516, chamado_id: '6', description: 'Bot recebeu novo chamado #4516', detail: 'Telefone · Bradesco Saude · Basica', auto: true },
  // #4515 concluido
  { id: 'be13', timestamp: '09:15', type: 'completed', chamado_numero: 4515, chamado_id: '7', description: '#4515 concluido (100% automatico)', detail: 'UTI · R$ 2.200 · 58 min total', auto: true },
  // #4517 despacho
  { id: 'be14', timestamp: '09:10', type: 'dispatched', chamado_numero: 4517, chamado_id: '5', description: 'Bot despachou VTR 351 → #4517', detail: 'ETA 22 min · Basica', auto: true },
  // #4517 qualificado
  { id: 'be15', timestamp: '09:00', type: 'qualified', chamado_numero: 4517, chamado_id: '5', description: 'Bot qualificou #4517', detail: 'Basica · Meier → Barra da Tijuca', auto: true },
  // #4517 recebido
  { id: 'be16', timestamp: '08:45', type: 'received', chamado_numero: 4517, chamado_id: '5', description: 'Bot recebeu novo chamado #4517', detail: 'WhatsApp · Amil · Basica', auto: true },
  // #4512 despacho
  { id: 'be17', timestamp: '08:30', type: 'dispatched', chamado_numero: 4512, chamado_id: '10', description: 'Bot despachou VTR 341 → #4512', detail: 'ETA 18 min · UTI', auto: true },
  // #4511 concluido
  { id: 'be18', timestamp: '08:10', type: 'completed', chamado_numero: 4511, chamado_id: '11', description: '#4511 concluido (100% automatico)', detail: 'Basica · R$ 420 · 25 min total', auto: true },
  // #4520 recebido
  { id: 'be19', timestamp: '08:00', type: 'received', chamado_numero: 4520, chamado_id: '2', description: 'Bot recebeu novo chamado #4520', detail: 'Telefone · SulAmerica · UTI', auto: true },
  // #4515 despacho
  { id: 'be20', timestamp: '07:50', type: 'dispatched', chamado_numero: 4515, chamado_id: '7', description: 'Bot despachou VTR 437 → #4515', detail: 'ETA 12 min · UTI', auto: true },
];

export const mockBotActionSteps: Record<string, BotActionStep[]> = {
  '1': [
    { time: '10:15', action: 'Recebeu mensagem WhatsApp' },
    { time: '10:15', action: 'Identificou: UTI, emergencia' },
    { time: '10:16', action: 'Qualificou: origem Botafogo, destino Copa D\'Or' },
    { time: '10:17', action: 'Calculou cotacao: R$ 2.800' },
    { time: '10:17', action: 'Enviou cotacao via WhatsApp' },
    { time: '10:23', action: 'Paciente aprovou cotacao' },
    { time: '10:25', action: 'Despachou VTR 340' },
    { time: '10:28', action: 'VTR a caminho, ETA 8 min', current: true },
  ],
  '2': [
    { time: '08:00', action: 'Recebeu ligacao via SulAmerica' },
    { time: '09:45', action: 'Qualificou: UTI, Bonsucesso → Barra' },
    { time: '09:50', action: 'Calculou cotacao: R$ 3.200' },
    { time: '09:52', action: 'Enviou cotacao' },
    { time: '10:05', action: 'Cotacao aprovada' },
    { time: '10:12', action: 'Pagamento Pix confirmado' },
    { time: '10:28', action: 'Despachou VTR 340' },
    { time: '10:28', action: 'Aguardando VTR chegar ao local', current: true },
  ],
  '4': [
    { time: '10:32', action: 'Recebeu mensagem via site' },
    { time: '10:32', action: 'Identificou: UTI, urgente' },
    { time: '10:33', action: 'Tentou qualificar endereco' },
    { time: '10:34', action: 'FALHA: endereco de destino nao informado' },
    { time: '10:34', action: 'Solicitou intervencao humana', current: true },
  ],
  '5': [
    { time: '08:45', action: 'Recebeu chamado WhatsApp via Amil' },
    { time: '09:00', action: 'Qualificou: Basica, Meier → Barra' },
    { time: '09:05', action: 'Calculou cotacao: R$ 1.500' },
    { time: '09:06', action: 'Cotacao aprovada automaticamente (convenio)' },
    { time: '09:10', action: 'Despachou VTR 351' },
    { time: '09:25', action: 'VTR no local' },
    { time: '09:30', action: 'Paciente embarcado' },
    { time: '09:55', action: 'Transporte concluido' },
  ],
  '6': [
    { time: '09:30', action: 'Recebeu ligacao Bradesco Saude' },
    { time: '09:32', action: 'Identificou: Basica, Botafogo' },
    { time: '09:35', action: 'Tentou autorizar convenio automaticamente' },
    { time: '09:40', action: 'FALHA: Bradesco exige autorizacao manual' },
    { time: '09:40', action: 'Solicitou intervencao humana' },
    { time: '09:42', action: 'Supervisora assumiu a conversa' },
    { time: '09:50', action: 'Autorizacao obtida manualmente' },
    { time: '09:55', action: 'Bot retomou: despachou VTR 429' },
    { time: '10:10', action: 'Transporte concluido' },
  ],
  '7': [
    { time: '07:30', action: 'Recebeu chamado WhatsApp via Intermedica' },
    { time: '07:32', action: 'Qualificou: UTI, Jacarepagua' },
    { time: '07:35', action: 'Calculou cotacao: R$ 2.200' },
    { time: '07:36', action: 'Cotacao aprovada' },
    { time: '07:50', action: 'Despachou VTR 437' },
    { time: '08:02', action: 'VTR no local' },
    { time: '08:15', action: 'Paciente embarcado' },
    { time: '09:15', action: 'Transporte concluido' },
  ],
};

export const mockBotChatMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'bc1', sender: 'patient', text: 'Boa tarde, preciso de UTI movel para minha mae. Ela esta no Samaritano Botafogo.', time: '10:15' },
    { id: 'bc2', sender: 'operator', text: 'Boa tarde! Sou o assistente da Savior. Vou ajudar com a transferencia. Pode me informar o nome completo, idade e quadro clinico da paciente?', time: '10:15' },
    { id: 'bc3', sender: 'patient', text: 'Maria Helena da Silva, 72 anos. Pos-operatorio cardiaco, precisa transferir pro Copa D\'Or.', time: '10:17' },
    { id: 'bc4', sender: 'operator', text: 'Entendido. UTI movel com equipe medica completa para transferencia cardiaca. Rota: Hospital Samaritano (Botafogo) → Copa D\'Or (Copacabana). Distancia: 4,2 km.', time: '10:17' },
    { id: 'bc5', sender: 'operator', text: 'Cotacao: R$ 2.800,00\nUTI 340 (Mercedes Sprinter 415)\nEquipe: medico + enfermeiro + motorista\nETA: 8 minutos\n\nAceita? Responda SIM para confirmar.', time: '10:22' },
    { id: 'bc6', sender: 'patient', text: 'SIM', time: '10:23' },
    { id: 'bc7', sender: 'operator', text: 'Confirmado! VTR 340 despachada. Chegada estimada em 8 minutos. Voce recebera atualizacoes automaticas.', time: '10:25' },
  ],
  '4': [
    { id: 'bc8', sender: 'patient', text: 'Boa tarde, meu pai precisa de ambulancia UTI urgente.', time: '10:32' },
    { id: 'bc9', sender: 'operator', text: 'Boa tarde! Sou o assistente da Savior. Vou ajudar com urgencia. Pode informar o endereco de origem e o hospital de destino?', time: '10:32' },
    { id: 'bc10', sender: 'patient', text: 'Rua Voluntarios da Patria 446, Botafogo. O hospital ainda nao sei.', time: '10:33' },
    { id: 'bc11', sender: 'operator', text: 'Entendi. Preciso do hospital de destino para calcular a rota e equipe necessaria. Voce tem preferencia ou o medico indicou algum hospital?', time: '10:33' },
    { id: 'bc12', sender: 'patient', text: 'Nao sei, ele ta com insuficiencia respiratoria. Roberto Carlos Farias, 81 anos.', time: '10:34' },
    { id: 'bc13', sender: 'operator', text: 'Estou transferindo para nossa supervisora que vai ajudar a definir o destino adequado. Um momento, por favor.', time: '10:34' },
  ],
};

// ── Computed stats ───────────────────────────────────────────────────

export const vtrStats = {
  total: mockVtrs.length,
  disponivel: mockVtrs.filter((v) => v.status === 'disponivel').length,
  em_atendimento: mockVtrs.filter((v) => v.status === 'em_atendimento').length,
  manutencao: mockVtrs.filter((v) => v.status === 'manutencao').length,
};

// ── Vehicle detail (enriched from SofitView API) ─────────────────────

export interface VtrDetail {
  chassi?: string;
  renavam?: string;
  km: number;
  ano_fab?: number;
  ano_mod?: number;
  crlv_url?: string;
  ultimo_abastecimento?: string;
  ultimo_apontamento?: string;
  grupo?: string;
  versao?: string;
}

export interface Multa {
  id: number;
  codigo: string;
  data: string;
  descricao: string;
  valor: number;
  status: 'penalty_or_nic_paid' | 'penalty_or_nic_open' | 'sent_to_payment';
  motorista?: string;
  vtr_id: string;
}

export interface Pneu {
  id: number;
  nome: string;
  dimensao: string;
  status: 'in_activity' | 'in_stock' | 'discarded' | 'retread';
  vida_atual: number;
  vtr_id?: string;
}

export interface ManutencaoDetail {
  id: string;
  tipo: 'preventiva' | 'corretiva';
  descricao: string;
  status: 'agendada' | 'em_andamento' | 'aguardando_peca' | 'concluida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  fornecedor: string;
  valor: number;
  data: string;
  itens?: string[];
  vtr_id: string;
}

export interface ChecklistItem {
  categoria: string;
  item: string;
  status: 'aprovado' | 'reprovado' | 'nao_verificado';
  observacao?: string;
  foto_url?: string;
}

// ── Real VTR details from SofitView enriched sample ──────────────────

export const mockVtrDetails: Record<string, VtrDetail> = {
  '129': { chassi: '93YMAF4MCEJ732869', renavam: '01020014226', km: 214916, ano_fab: 2013, ano_mod: 2014, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_129/AM_196_2025_.pdf', ultimo_abastecimento: '2022-06-28', ultimo_apontamento: '2022-06-28', grupo: 'Basica', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '123': { chassi: '8A1FC1415EL718805', renavam: '00569778336', km: 258658, ano_fab: 2013, ano_mod: 2014, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_123/AM_204_2025_.pdf', ultimo_abastecimento: '2026-04-27', ultimo_apontamento: '2026-07-17', grupo: 'Uso ADM', versao: 'EXPRESS HI-FLEX 1.6 16V' },
  '26': { chassi: '8AC906633GE116830', renavam: '01069216299', km: 312853, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_26/AM_340_2025_1_.pdf', ultimo_abastecimento: '2024-09-01', ultimo_apontamento: '2026-07-03', grupo: 'UTI', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '27': { chassi: '8AC906633GE113714', renavam: '01069215110', km: 355000, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_27/AM_341_2025_1_.pdf', ultimo_abastecimento: '2023-12-19', ultimo_apontamento: '2025-12-03', grupo: 'Basica', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '28': { chassi: '8AC906633GE113713', renavam: '01069023059', km: 225452, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_28/AM_342_2025_.pdf', ultimo_abastecimento: '2026-08-14', ultimo_apontamento: '2026-08-19', grupo: 'Basica', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '29': { chassi: '8AC906633GE116711', renavam: '01069215632', km: 208096, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_29/AM_343_2025_1_.pdf', ultimo_abastecimento: '2026-04-23', ultimo_apontamento: '2026-04-24', grupo: 'Basica', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '30': { chassi: '8AC906633GE116773', renavam: '01069023342', km: 225268, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_30/AM_344_2025_1_.pdf', ultimo_abastecimento: '2026-04-25', ultimo_apontamento: '2026-07-03', grupo: 'Basica', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '31': { chassi: '8AC906633GE113782', renavam: '01069022478', km: 216193, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_31/AM_345_2025_.pdf', ultimo_abastecimento: '2026-05-20', ultimo_apontamento: '2026-08-10', grupo: 'Basica', versao: 'CHASSI L. 2.2 DIESEL' },
  '74': { chassi: '93YMAFELCGJ178534', renavam: '01071553710', km: 197383, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_74/AM_348_2025_1_.pdf', ultimo_abastecimento: '2026-05-28', ultimo_apontamento: '2026-06-05', grupo: 'UTI', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '104': { chassi: '93YMAFELCGJ164806', renavam: '01071555925', km: 265059, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_104/AM_350_2025_.pdf', ultimo_abastecimento: '2026-08-07', ultimo_apontamento: '2026-08-18', grupo: 'UTI', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '33': { chassi: '93YMAFELAGJ187649', renavam: '01072856350', km: 234858, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_33/AM_351_2025_.pdf', ultimo_abastecimento: '2026-08-19', ultimo_apontamento: '2026-08-20', grupo: 'Basica', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '130': { chassi: '93YMAFELCGJ178343', renavam: '01071557286', km: 196915, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_130/AM_352_2025_.pdf', ultimo_abastecimento: '2025-03-15', ultimo_apontamento: '2025-11-17', grupo: 'UTI', versao: '2.3 DCI GRAND FURGAO 16V DIESEL' },
  '71': { chassi: '93YMAFELCGJ178342', renavam: '01071554872', km: 331939, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_71/AM_353_2025_1_.pdf', ultimo_abastecimento: '2026-06-17', ultimo_apontamento: '2026-06-17', grupo: 'Basica', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '86': { chassi: '93YMAFELCGJ183973', renavam: '01072857054', km: 194695, ano_fab: 2015, ano_mod: 2016, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_86/AM_354_2025_.pdf', ultimo_abastecimento: '2026-08-06', ultimo_apontamento: '2026-08-12', grupo: 'Basica', versao: '2.3 DCI GRAND FURGAO 16V DIESEL' },
  '13': { chassi: '93YMAF4MCEJ723875', renavam: '00552864455', km: 274200, ano_fab: 2013, ano_mod: 2014, crlv_url: 'https://new-fleet.s3.sa-east-1.amazonaws.com/attachments/client_1631/vehicle/register_13/AM_402_2025_.pdf', ultimo_abastecimento: '2023-01-23', ultimo_apontamento: '2023-01-23', grupo: 'Basica', versao: '2.3 DCI GRAND FURGAO 16V DIESEL' },
  // Generated for remaining vehicles
  '44': { km: 187432, ano_fab: 2019, ano_mod: 2020, ultimo_abastecimento: '2026-08-18', ultimo_apontamento: '2026-08-19', grupo: 'Basica', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '45': { km: 203118, ano_fab: 2019, ano_mod: 2020, ultimo_abastecimento: '2026-08-17', ultimo_apontamento: '2026-08-20', grupo: 'Basica', versao: '2.3 DCI FURGAO 16V DIESEL' },
  '85': { km: 198540, ano_fab: 2015, ano_mod: 2016, ultimo_abastecimento: '2026-08-12', ultimo_apontamento: '2026-08-18', grupo: 'UTI', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '99': { km: 212370, ano_fab: 2015, ano_mod: 2016, ultimo_abastecimento: '2026-07-30', ultimo_apontamento: '2026-08-15', grupo: 'UTI', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '79': { km: 189650, ano_fab: 2015, ano_mod: 2016, ultimo_abastecimento: '2026-08-10', ultimo_apontamento: '2026-08-16', grupo: 'UTI', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
  '83': { km: 205320, ano_fab: 2015, ano_mod: 2016, ultimo_abastecimento: '2026-08-08', ultimo_apontamento: '2026-08-14', grupo: 'UTI', versao: 'FURGAO LON.T.ALTO 2.2 DIES' },
};

// ── Multas (real descriptions from SofitView) ────────────────────────

export const mockMultas: Multa[] = [
  { id: 5043, codigo: 'IFR-005043', data: '2026-07-02', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_open', vtr_id: '123' },
  { id: 4284, codigo: 'IFR-004284', data: '2026-01-24', descricao: 'Transitar na faixa regulamentada destinada a veiculos de Transporte publico coletivo de passageiros', valor: 293.47, status: 'penalty_or_nic_open', vtr_id: '123' },
  { id: 4713, codigo: 'IFR-004713', data: '2026-03-20', descricao: 'Parar sobre faixa de pedestres na mudanca de sinal luminoso', valor: 130.16, status: 'penalty_or_nic_open', vtr_id: '30' },
  { id: 4317, codigo: 'IFR-004317', data: '2026-02-04', descricao: 'Dirigir ameacando os demais veiculos', valor: 293.47, status: 'penalty_or_nic_open', vtr_id: '33' },
  { id: 3596, codigo: 'IFR-003596', data: '2025-08-27', descricao: 'Estacionar em local/horario proibido especificamente pela sinalizacao', valor: 130.16, status: 'penalty_or_nic_open', motorista: 'Ciro Jose Vicente Zulmiro', vtr_id: '74' },
  { id: 3393, codigo: 'IFR-003393', data: '2025-05-21', descricao: 'Deixar o condutor/passageiro de usar o cinto de seguranca', valor: 156.18, status: 'penalty_or_nic_paid', motorista: 'Jose Lucas de Souza Santos', vtr_id: '30' },
  { id: 3342, codigo: 'IFR-003342', data: '2025-03-11', descricao: 'Transitar na faixa regulamentada destinada a veiculos de Transporte publico coletivo de passageiros', valor: 293.47, status: 'penalty_or_nic_open', motorista: 'Nilton Obara', vtr_id: '123' },
  { id: 3311, codigo: 'IFR-003311', data: '2025-01-21', descricao: 'Evadir-se da cobranca pelo uso de rodovias e vias urbanas para nao efetuar seu pagamento', valor: 195.23, status: 'penalty_or_nic_open', motorista: 'Joao Victor Garcia da Silva', vtr_id: '74' },
  { id: 3263, codigo: 'IFR-003263', data: '2025-01-16', descricao: 'Dirigir veiculo segurando telefone celular', valor: 293.47, status: 'sent_to_payment', vtr_id: '86' },
  { id: 3253, codigo: 'IFR-003253', data: '2025-01-02', descricao: 'Transitar na faixa regulamentada destinada a veiculos de Transporte publico coletivo de passageiros', valor: 293.47, status: 'penalty_or_nic_open', vtr_id: '29' },
  { id: 3279, codigo: 'IFR-003279', data: '2025-01-14', descricao: 'Transitar em velocidade superior a maxima permitida em mais de 20% ate 50%', valor: 195.23, status: 'penalty_or_nic_open', vtr_id: '130' },
  { id: 3207, codigo: 'IFR-003207', data: '2024-10-24', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '33' },
  { id: 2881, codigo: 'IFR-002881', data: '2024-02-02', descricao: 'Transitar na faixa regulamentada destinada a veiculos de Transporte publico coletivo de passageiros', valor: 293.47, status: 'penalty_or_nic_paid', vtr_id: '26' },
  { id: 2836, codigo: 'IFR-002836', data: '2024-04-06', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '71' },
  { id: 2527, codigo: 'IFR-002527', data: '2023-12-05', descricao: 'Dirigir ameacando os demais veiculos', valor: 293.47, status: 'penalty_or_nic_paid', vtr_id: '27' },
  { id: 2384, codigo: 'IFR-002384', data: '2023-09-16', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '86' },
  { id: 1914, codigo: 'IFR-001914', data: '2022-10-26', descricao: 'Estacionar local/horario de estacionamento e parada proibidos pela sinalizacao', valor: 195.23, status: 'penalty_or_nic_paid', vtr_id: '28' },
  { id: 1543, codigo: 'IFR-001543', data: '2022-03-10', descricao: 'Avancar o sinal vermelho do semaforo', valor: 293.47, status: 'penalty_or_nic_paid', vtr_id: '29' },
  { id: 1489, codigo: 'IFR-001489', data: '2022-02-10', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '104' },
  { id: 1068, codigo: 'IFR-001068', data: '2021-05-24', descricao: 'Avancar o sinal vermelho do semaforo', valor: 293.47, status: 'penalty_or_nic_paid', vtr_id: '31' },
  { id: 889, codigo: 'IFR-000889', data: '2020-08-30', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '129' },
  { id: 658, codigo: 'IFR-000658', data: '2016-01-08', descricao: 'Avancar o sinal vermelho do semaforo', valor: 293.47, status: 'penalty_or_nic_paid', vtr_id: '28' },
  // VTR 451 (id=44) fines
  { id: 5100, codigo: 'IFR-005100', data: '2026-06-15', descricao: 'Transitar em velocidade superior a maxima permitida em ate 20%', valor: 130.16, status: 'penalty_or_nic_open', vtr_id: '44' },
  { id: 4890, codigo: 'IFR-004890', data: '2026-04-02', descricao: 'Estacionar em local/horario proibido especificamente pela sinalizacao', valor: 130.16, status: 'penalty_or_nic_open', motorista: 'Adilson Barbosa Moreira Junior', vtr_id: '44' },
  { id: 4650, codigo: 'IFR-004650', data: '2026-02-18', descricao: 'Transitar na faixa regulamentada destinada a veiculos de Transporte publico coletivo de passageiros', valor: 293.47, status: 'sent_to_payment', motorista: 'Caetano Pedro Bento', vtr_id: '44' },
  { id: 4210, codigo: 'IFR-004210', data: '2025-11-05', descricao: 'Parar sobre faixa de pedestres na mudanca de sinal luminoso', valor: 130.16, status: 'penalty_or_nic_paid', vtr_id: '44' },
  { id: 3980, codigo: 'IFR-003980', data: '2025-09-12', descricao: 'Avancar o sinal vermelho do semaforo', valor: 293.47, status: 'penalty_or_nic_paid', motorista: 'Elson Firmino', vtr_id: '44' },
  { id: 3750, codigo: 'IFR-003750', data: '2025-07-28', descricao: 'Dirigir veiculo segurando telefone celular', valor: 293.47, status: 'penalty_or_nic_paid', motorista: 'Felipe da Conceicao Amaral', vtr_id: '44' },
  { id: 3520, codigo: 'IFR-003520', data: '2025-05-14', descricao: 'Transitar em velocidade superior a maxima permitida em mais de 20% ate 50%', valor: 195.23, status: 'penalty_or_nic_paid', vtr_id: '44' },
  { id: 3100, codigo: 'IFR-003100', data: '2024-12-03', descricao: 'Deixar o condutor de usar o cinto de seguranca', valor: 156.18, status: 'penalty_or_nic_paid', motorista: 'Anderson de Souza', vtr_id: '44' },
];

// ── Pneus (real dimensions from SofitView) ───────────────────────────

export const mockPneus: Pneu[] = [
  // VTR 489 (id=167)
  { id: 5131, nome: '11 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '167' },
  { id: 5133, nome: '12 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '167' },
  { id: 5135, nome: '13 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '167' },
  { id: 5137, nome: '14 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '167' },
  // VTR 451 (id=44)
  { id: 4801, nome: '01 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '44' },
  { id: 4802, nome: '02 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '44' },
  { id: 4803, nome: '03 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '44' },
  { id: 4804, nome: '04 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '44' },
  { id: 4805, nome: '05 2024 (step)', dimensao: '225/65R16C', status: 'in_stock', vida_atual: 1, vtr_id: '44' },
  // VTR 342 (id=28)
  { id: 4601, nome: '06 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '28' },
  { id: 4602, nome: '07 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '28' },
  { id: 4603, nome: '08 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '28' },
  { id: 4604, nome: '09 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '28' },
  // VTR 340 (id=26)
  { id: 4401, nome: '10 2024', dimensao: '225/75R16', status: 'in_activity', vida_atual: 1, vtr_id: '26' },
  { id: 4402, nome: '11 2024', dimensao: '225/75R16', status: 'in_activity', vida_atual: 1, vtr_id: '26' },
  { id: 4403, nome: '12 2024', dimensao: '225/75R16', status: 'retread', vida_atual: 2, vtr_id: '26' },
  { id: 4404, nome: '13 2024', dimensao: '225/75R16', status: 'in_activity', vida_atual: 1, vtr_id: '26' },
  // Em estoque (sem vtr)
  { id: 4500, nome: 'EST-001', dimensao: '225/65R16C', status: 'in_stock', vida_atual: 0 },
  { id: 4501, nome: 'EST-002', dimensao: '225/65R16C', status: 'in_stock', vida_atual: 0 },
  { id: 4502, nome: 'EST-003', dimensao: '225/75R16', status: 'in_stock', vida_atual: 0 },
  // Descartados
  { id: 162, nome: '1-225/65/16 RIO SUL', dimensao: '225/65R16C', status: 'discarded', vida_atual: 3 },
  { id: 163, nome: '2-225/65/16 RIO SUL', dimensao: '225/65R16C', status: 'discarded', vida_atual: 3 },
  // VTR 350 (id=104)
  { id: 4701, nome: '14 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '104' },
  { id: 4702, nome: '15 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '104' },
  { id: 4703, nome: '16 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '104' },
  { id: 4704, nome: '17 2024', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 2, vtr_id: '104' },
  // VTR 354 (id=86)
  { id: 4901, nome: '18 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '86' },
  { id: 4902, nome: '19 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '86' },
  { id: 4903, nome: '20 2025', dimensao: '225/65R16C', status: 'retread', vida_atual: 2, vtr_id: '86' },
  { id: 4904, nome: '21 2025', dimensao: '225/65R16C', status: 'in_activity', vida_atual: 1, vtr_id: '86' },
];

// ── Manutencoes (real suppliers from SofitView) ──────────────────────

export const mockManutencoes: ManutencaoDetail[] = [
  { id: 'OS-2026-0842', tipo: 'corretiva', descricao: 'Troca embreagem + volante motor', status: 'em_andamento', prioridade: 'alta', fornecedor: 'ADJ Diesel', valor: 4850, data: '2026-08-15', itens: ['Kit embreagem completo', 'Volante motor bimassa', 'Mao de obra (12h)'], vtr_id: '44' },
  { id: 'OS-2026-0838', tipo: 'preventiva', descricao: 'Revisao 200.000 km', status: 'concluida', prioridade: 'media', fornecedor: 'Renault Servicos Especializados', valor: 2380, data: '2026-08-10', itens: ['Oleo motor 5W30 (8L)', 'Filtro oleo', 'Filtro combustivel', 'Filtro ar', 'Pastilha freio dianteira'], vtr_id: '44' },
  { id: 'OS-2026-0830', tipo: 'corretiva', descricao: 'Reparo ar condicionado', status: 'aguardando_peca', prioridade: 'media', fornecedor: 'Center Diesel Servicos', valor: 1650, data: '2026-08-05', itens: ['Compressor AC', 'Gas R134a (500g)', 'Oring vedacao'], vtr_id: '30' },
  { id: 'OS-2026-0825', tipo: 'corretiva', descricao: 'Substituicao caixa de direcao', status: 'concluida', prioridade: 'critica', fornecedor: 'Navarro Transmissoes', valor: 6200, data: '2026-07-28', itens: ['Caixa direcao hidraulica recondicionada', 'Fluido direcao (2L)', 'Mao de obra'], vtr_id: '28' },
  { id: 'OS-2026-0810', tipo: 'preventiva', descricao: 'Alinhamento e balanceamento', status: 'concluida', prioridade: 'baixa', fornecedor: 'Borracharia Express', valor: 320, data: '2026-07-20', vtr_id: '44' },
  { id: 'OS-2026-0798', tipo: 'corretiva', descricao: 'Troca alternador', status: 'concluida', prioridade: 'alta', fornecedor: 'AM Auto Eletrica', valor: 1890, data: '2026-07-15', itens: ['Alternador 150A recondicionado', 'Correia auxiliar'], vtr_id: '26' },
  { id: 'OS-2026-0785', tipo: 'preventiva', descricao: 'Revisao freios traseiros', status: 'concluida', prioridade: 'media', fornecedor: 'Auto Mecanica Beira Rio', valor: 980, data: '2026-07-08', itens: ['Lona freio traseira (jogo)', 'Cilindro roda', 'Fluido freio DOT4'], vtr_id: '86' },
  { id: 'OS-2026-0770', tipo: 'corretiva', descricao: 'Reparo vazamento radiador', status: 'concluida', prioridade: 'alta', fornecedor: 'Sol Nascente Auto', valor: 1420, data: '2026-06-30', itens: ['Radiador completo', 'Mangueira superior', 'Aditivo concentrado (2L)'], vtr_id: '71' },
  { id: 'OS-2026-0760', tipo: 'preventiva', descricao: 'Troca pneus dianteiros', status: 'concluida', prioridade: 'media', fornecedor: 'Borracharia Express', valor: 2200, data: '2026-06-22', itens: ['Pneu 225/65R16C Continental (2x)', 'Servico montagem e balanceamento'], vtr_id: '44' },
  { id: 'OS-2026-0901', tipo: 'preventiva', descricao: 'Inspecao sistema eletrico ambulancia', status: 'agendada', prioridade: 'media', fornecedor: 'AM Auto Eletrica', valor: 850, data: '2026-08-25', itens: ['Teste bateria auxiliar', 'Verificacao sirene e giroflex', 'Revisao instalacao oxigenio'], vtr_id: '44' },
];

// ── Checklist VTR 451 (id=44) ────────────────────────────────────────

export const mockChecklistItems: Record<string, ChecklistItem[]> = {
  '44': [
    // Parte Externa
    { categoria: 'Parte Externa', item: 'Farois dianteiros', status: 'aprovado' },
    { categoria: 'Parte Externa', item: 'Lanternas traseiras', status: 'aprovado' },
    { categoria: 'Parte Externa', item: 'Sirene e giroflex', status: 'aprovado' },
    { categoria: 'Parte Externa', item: 'Pneus (condicao visual)', status: 'reprovado', observacao: 'Pneu traseiro esquerdo com desgaste irregular. Trocar em ate 7 dias.' },
    { categoria: 'Parte Externa', item: 'Para-choque dianteiro', status: 'aprovado' },
    { categoria: 'Parte Externa', item: 'Espelhos retrovisores', status: 'reprovado', observacao: 'Retrovisor direito com fixacao frouxa. Apertar parafusos.' },
    // Parte Interna
    { categoria: 'Parte Interna', item: 'Ar condicionado cabine', status: 'aprovado' },
    { categoria: 'Parte Interna', item: 'Ar condicionado compartimento', status: 'reprovado', observacao: 'Temperatura nao estabiliza abaixo de 24C. OS aberta (Center Diesel).' },
    { categoria: 'Parte Interna', item: 'Maca principal', status: 'aprovado' },
    { categoria: 'Parte Interna', item: 'Cintos de seguranca paciente', status: 'aprovado' },
    { categoria: 'Parte Interna', item: 'Banco motorista', status: 'aprovado' },
    // Equipamentos Medicos
    { categoria: 'Equipamentos Médicos', item: 'Cilindro O2 (nivel)', status: 'aprovado' },
    { categoria: 'Equipamentos Médicos', item: 'Desfibrilador (teste)', status: 'aprovado' },
    { categoria: 'Equipamentos Médicos', item: 'Aspirador portatil', status: 'aprovado' },
    { categoria: 'Equipamentos Médicos', item: 'Bolsa de primeiros socorros', status: 'aprovado' },
    { categoria: 'Equipamentos Médicos', item: 'Monitor multiparametro', status: 'nao_verificado' },
    { categoria: 'Equipamentos Médicos', item: 'Prancha rigida', status: 'aprovado' },
    // Documentacao
    { categoria: 'Documentação', item: 'CRLV em dia', status: 'aprovado' },
    { categoria: 'Documentação', item: 'Seguro obrigatorio (DPVAT)', status: 'aprovado' },
    { categoria: 'Documentação', item: 'Alvara Vigilancia Sanitaria', status: 'nao_verificado' },
    { categoria: 'Documentação', item: 'Autorizacao ANVISA', status: 'aprovado' },
  ],
};

// ── Fornecedores (backoffice CRUD) ──────────────────────────────────

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  tipo: string;
  uf: 'RJ' | 'SP';
  ativo: boolean;
}

export const mockFornecedores: Fornecedor[] = [
  { id: 1, nome: 'ADJ Diesel', cnpj: '12.345.678/0001-01', telefone: '(21) 3333-1001', email: 'contato@adjdiesel.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 2, nome: 'Navarro Transmissoes', cnpj: '23.456.789/0001-02', telefone: '(21) 3333-1002', email: 'navarro@navarro.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 3, nome: 'Sol Nascente Auto', cnpj: '34.567.890/0001-03', telefone: '(21) 3333-1003', email: 'atendimento@solnascente.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 4, nome: 'Renault Servicos Especializados', cnpj: '45.678.901/0001-04', telefone: '(21) 3333-1004', email: 'servicos@renaultse.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 5, nome: 'Mercedes-Benz Sprinter Center', cnpj: '56.789.012/0001-05', telefone: '(21) 3333-1005', email: 'contato@sprintercenter.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 6, nome: 'Borracharia Express', cnpj: '67.890.123/0001-06', telefone: '(21) 3333-1006', email: 'express@borracharia.com.br', tipo: 'Reformador de pneus', uf: 'RJ', ativo: true },
  { id: 7, nome: 'Center Diesel Servicos', cnpj: '78.901.234/0001-07', telefone: '(21) 3333-1007', email: 'center@centerdiesel.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 8, nome: 'Retifica Motores Brasil', cnpj: '89.012.345/0001-08', telefone: '(21) 3333-1008', email: 'retifica@motoresbr.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 9, nome: 'Posto Bandeirantes', cnpj: '90.123.456/0001-09', telefone: '(21) 3333-1009', email: 'gerencia@postobandeirantes.com.br', tipo: 'Posto de combustivel', uf: 'RJ', ativo: true },
  { id: 10, nome: 'Posto Beira Mar', cnpj: '01.234.567/0001-10', telefone: '(21) 3333-1010', email: 'beiramar@postos.com.br', tipo: 'Posto de combustivel', uf: 'RJ', ativo: true },
  { id: 11, nome: 'Posto Shell Maracana', cnpj: '11.222.333/0001-11', telefone: '(21) 3333-1011', email: 'maracana@shell.com.br', tipo: 'Posto de combustivel', uf: 'RJ', ativo: true },
  { id: 12, nome: '0 KM', cnpj: '22.333.444/0001-12', telefone: '(11) 4444-1001', email: 'contato@0km.com.br', tipo: 'Oficina', uf: 'SP', ativo: true },
  { id: 13, nome: 'Amazonas France Veiculos', cnpj: '33.444.555/0001-13', telefone: '(11) 4444-1002', email: 'vendas@amazonasfrance.com.br', tipo: 'Oficina', uf: 'SP', ativo: true },
  { id: 14, nome: 'Posto Arinella Interlagos', cnpj: '44.555.666/0001-14', telefone: '(11) 4444-1003', email: 'arinella@postos.com.br', tipo: 'Posto de combustivel', uf: 'SP', ativo: true },
  { id: 15, nome: 'ATK Acessorios', cnpj: '55.666.777/0001-15', telefone: '(11) 4444-1004', email: 'atk@atkacessorios.com.br', tipo: 'Oficina', uf: 'SP', ativo: true },
  { id: 16, nome: 'Arcotec Comercio', cnpj: '66.777.888/0001-16', telefone: '(11) 4444-1005', email: 'arcotec@arcotec.com.br', tipo: 'Oficina', uf: 'SP', ativo: true },
  { id: 17, nome: 'AM Auto Eletrica', cnpj: '77.888.999/0001-17', telefone: '(11) 4444-1006', email: 'am@autoeletrica.com.br', tipo: 'Oficina', uf: 'SP', ativo: true },
  { id: 18, nome: 'Auto Mecanica Beira Rio', cnpj: '88.999.000/0001-18', telefone: '(21) 3333-1012', email: 'beirario@automecanica.com.br', tipo: 'Oficina', uf: 'RJ', ativo: true },
  { id: 19, nome: 'Agua Marinha Combustiveis', cnpj: '99.000.111/0001-19', telefone: '(21) 3333-1013', email: 'contato@aguamarinha.com.br', tipo: 'Posto de combustivel', uf: 'RJ', ativo: false },
  { id: 20, nome: 'Alpha Center Servicos', cnpj: '10.111.222/0001-20', telefone: '(11) 4444-1007', email: 'alpha@alphacenter.com.br', tipo: 'Posto de combustivel', uf: 'SP', ativo: false },
];

// ── Equipamentos (backoffice CRUD) ──────────────────────────────────

export type EquipamentoStatus = 'operacional' | 'manutencao' | 'vencido' | 'ausente';
export type EquipamentoCategoria = 'Monitorizacao' | 'Ventilacao' | 'Imobilizacao' | 'Medicamentos' | 'Acessorios';

export interface Equipamento {
  id: number;
  nome: string;
  categoria: EquipamentoCategoria;
  vtr_id: string;
  vtr_nome: string;
  status: EquipamentoStatus;
  numero_serie: string;
  data_calibracao: string;
  proxima_calibracao: string;
}

export const mockEquipamentos: Equipamento[] = [
  // VTR 340
  { id: 1, nome: 'Monitor Multiparametro', categoria: 'Monitorizacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'MP-2024-001', data_calibracao: '2026-06-15', proxima_calibracao: '2026-12-15' },
  { id: 2, nome: 'Oximetro de Pulso', categoria: 'Monitorizacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'OX-2024-001', data_calibracao: '2026-05-10', proxima_calibracao: '2026-11-10' },
  { id: 3, nome: 'Capnografo', categoria: 'Monitorizacao', vtr_id: '26', vtr_nome: '340', status: 'manutencao', numero_serie: 'CP-2024-001', data_calibracao: '2026-03-20', proxima_calibracao: '2026-09-20' },
  { id: 4, nome: 'Desfibrilador/DEA', categoria: 'Monitorizacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'DF-2024-001', data_calibracao: '2026-07-01', proxima_calibracao: '2027-01-01' },
  { id: 5, nome: 'Ventilador Mecanico', categoria: 'Ventilacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'VM-2024-001', data_calibracao: '2026-06-01', proxima_calibracao: '2026-12-01' },
  { id: 6, nome: 'Aspirador Portatil', categoria: 'Ventilacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'AP-2024-001', data_calibracao: '2026-04-15', proxima_calibracao: '2026-10-15' },
  { id: 7, nome: 'Cilindro O2 Grande', categoria: 'Ventilacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'CO-2024-001', data_calibracao: '2026-01-10', proxima_calibracao: '2027-01-10' },
  { id: 8, nome: 'Prancha Rigida', categoria: 'Imobilizacao', vtr_id: '26', vtr_nome: '340', status: 'operacional', numero_serie: 'PR-2024-001', data_calibracao: '2026-02-15', proxima_calibracao: '2027-02-15' },
  // VTR 341
  { id: 9, nome: 'Monitor Multiparametro', categoria: 'Monitorizacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'MP-2024-002', data_calibracao: '2026-06-20', proxima_calibracao: '2026-12-20' },
  { id: 10, nome: 'Oximetro de Pulso', categoria: 'Monitorizacao', vtr_id: '27', vtr_nome: '341', status: 'vencido', numero_serie: 'OX-2024-002', data_calibracao: '2025-11-10', proxima_calibracao: '2026-05-10' },
  { id: 11, nome: 'Desfibrilador/DEA', categoria: 'Monitorizacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'DF-2024-002', data_calibracao: '2026-07-05', proxima_calibracao: '2027-01-05' },
  { id: 12, nome: 'Ventilador Mecanico', categoria: 'Ventilacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'VM-2024-002', data_calibracao: '2026-05-20', proxima_calibracao: '2026-11-20' },
  { id: 13, nome: 'Aspirador Portatil', categoria: 'Ventilacao', vtr_id: '27', vtr_nome: '341', status: 'ausente', numero_serie: 'AP-2024-002', data_calibracao: '2026-03-15', proxima_calibracao: '2026-09-15' },
  { id: 14, nome: 'Cilindro O2 Grande', categoria: 'Ventilacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'CO-2024-002', data_calibracao: '2026-01-15', proxima_calibracao: '2027-01-15' },
  { id: 15, nome: 'Prancha Rigida', categoria: 'Imobilizacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'PR-2024-002', data_calibracao: '2026-02-20', proxima_calibracao: '2027-02-20' },
  { id: 16, nome: 'Colar Cervical Kit', categoria: 'Imobilizacao', vtr_id: '27', vtr_nome: '341', status: 'operacional', numero_serie: 'CC-2024-002', data_calibracao: '2026-01-01', proxima_calibracao: '2027-01-01' },
  // VTR 342
  { id: 17, nome: 'Monitor Multiparametro', categoria: 'Monitorizacao', vtr_id: '28', vtr_nome: '342', status: 'operacional', numero_serie: 'MP-2024-003', data_calibracao: '2026-07-10', proxima_calibracao: '2027-01-10' },
  { id: 18, nome: 'Oximetro de Pulso', categoria: 'Monitorizacao', vtr_id: '28', vtr_nome: '342', status: 'operacional', numero_serie: 'OX-2024-003', data_calibracao: '2026-06-05', proxima_calibracao: '2026-12-05' },
  { id: 19, nome: 'Desfibrilador/DEA', categoria: 'Monitorizacao', vtr_id: '28', vtr_nome: '342', status: 'manutencao', numero_serie: 'DF-2024-003', data_calibracao: '2026-04-01', proxima_calibracao: '2026-10-01' },
  { id: 20, nome: 'Ventilador Mecanico', categoria: 'Ventilacao', vtr_id: '28', vtr_nome: '342', status: 'operacional', numero_serie: 'VM-2024-003', data_calibracao: '2026-06-10', proxima_calibracao: '2026-12-10' },
  { id: 21, nome: 'Bomba de Infusao', categoria: 'Medicamentos', vtr_id: '28', vtr_nome: '342', status: 'operacional', numero_serie: 'BI-2024-001', data_calibracao: '2026-05-01', proxima_calibracao: '2026-11-01' },
  { id: 22, nome: 'Maca Articulada', categoria: 'Acessorios', vtr_id: '28', vtr_nome: '342', status: 'operacional', numero_serie: 'MA-2024-001', data_calibracao: '2026-03-01', proxima_calibracao: '2027-03-01' },
  // VTR 436
  { id: 23, nome: 'Monitor Multiparametro', categoria: 'Monitorizacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'MP-2024-004', data_calibracao: '2026-07-15', proxima_calibracao: '2027-01-15' },
  { id: 24, nome: 'Oximetro de Pulso', categoria: 'Monitorizacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'OX-2024-004', data_calibracao: '2026-06-20', proxima_calibracao: '2026-12-20' },
  { id: 25, nome: 'Capnografo', categoria: 'Monitorizacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'CP-2024-002', data_calibracao: '2026-05-15', proxima_calibracao: '2026-11-15' },
  { id: 26, nome: 'Desfibrilador/DEA', categoria: 'Monitorizacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'DF-2024-004', data_calibracao: '2026-08-01', proxima_calibracao: '2027-02-01' },
  { id: 27, nome: 'Ventilador Mecanico', categoria: 'Ventilacao', vtr_id: '85', vtr_nome: '436', status: 'vencido', numero_serie: 'VM-2024-004', data_calibracao: '2025-12-01', proxima_calibracao: '2026-06-01' },
  { id: 28, nome: 'Aspirador Portatil', categoria: 'Ventilacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'AP-2024-004', data_calibracao: '2026-05-10', proxima_calibracao: '2026-11-10' },
  { id: 29, nome: 'Cilindro O2 Grande', categoria: 'Ventilacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'CO-2024-004', data_calibracao: '2026-02-10', proxima_calibracao: '2027-02-10' },
  { id: 30, nome: 'Cilindro O2 Portatil', categoria: 'Ventilacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'CP-2024-004', data_calibracao: '2026-02-10', proxima_calibracao: '2027-02-10' },
  { id: 31, nome: 'Prancha Rigida', categoria: 'Imobilizacao', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'PR-2024-004', data_calibracao: '2026-03-01', proxima_calibracao: '2027-03-01' },
  { id: 32, nome: 'Bomba de Infusao', categoria: 'Medicamentos', vtr_id: '85', vtr_nome: '436', status: 'operacional', numero_serie: 'BI-2024-002', data_calibracao: '2026-06-01', proxima_calibracao: '2026-12-01' },
  // VTR 437
  { id: 33, nome: 'Monitor Multiparametro', categoria: 'Monitorizacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'MP-2024-005', data_calibracao: '2026-07-20', proxima_calibracao: '2027-01-20' },
  { id: 34, nome: 'Oximetro de Pulso', categoria: 'Monitorizacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'OX-2024-005', data_calibracao: '2026-06-25', proxima_calibracao: '2026-12-25' },
  { id: 35, nome: 'Desfibrilador/DEA', categoria: 'Monitorizacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'DF-2024-005', data_calibracao: '2026-08-05', proxima_calibracao: '2027-02-05' },
  { id: 36, nome: 'Ventilador Mecanico', categoria: 'Ventilacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'VM-2024-005', data_calibracao: '2026-06-15', proxima_calibracao: '2026-12-15' },
  { id: 37, nome: 'Aspirador Portatil', categoria: 'Ventilacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'AP-2024-005', data_calibracao: '2026-05-20', proxima_calibracao: '2026-11-20' },
  { id: 38, nome: 'Prancha Rigida', categoria: 'Imobilizacao', vtr_id: '99', vtr_nome: '437', status: 'operacional', numero_serie: 'PR-2024-005', data_calibracao: '2026-03-10', proxima_calibracao: '2027-03-10' },
  { id: 39, nome: 'Colar Cervical Kit', categoria: 'Imobilizacao', vtr_id: '99', vtr_nome: '437', status: 'ausente', numero_serie: 'CC-2024-005', data_calibracao: '2026-01-10', proxima_calibracao: '2027-01-10' },
  { id: 40, nome: 'Bomba de Infusao', categoria: 'Medicamentos', vtr_id: '99', vtr_nome: '437', status: 'manutencao', numero_serie: 'BI-2024-003', data_calibracao: '2026-04-01', proxima_calibracao: '2026-10-01' },
];

// ── Documentos (backoffice CRUD) ────────────────────────────────────

export type DocumentoTipo = 'CRLV' | 'CNH' | 'Alvara' | 'Seguro' | 'ANVISA' | 'Contrato';
export type DocumentoStatus = 'vigente' | 'renovando' | 'vencido' | 'pendente';

export interface Documento {
  id: number;
  nome: string;
  tipo: DocumentoTipo;
  entidade_tipo: 'vtr' | 'funcionario';
  entidade_nome: string;
  data_emissao: string;
  data_vencimento: string;
  status: DocumentoStatus;
}

export const mockDocumentos: Documento[] = [
  { id: 1, nome: 'CRLV 2026 AM 340', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 340 (LSG7033)', data_emissao: '2026-01-15', data_vencimento: '2027-01-15', status: 'vigente' },
  { id: 2, nome: 'CRLV 2026 AM 341', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 341 (LSG7030)', data_emissao: '2026-01-20', data_vencimento: '2027-01-20', status: 'vigente' },
  { id: 3, nome: 'CRLV 2026 AM 342', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 342 (LSG7034)', data_emissao: '2026-02-10', data_vencimento: '2027-02-10', status: 'vigente' },
  { id: 4, nome: 'CRLV 2025 AM 344', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 344 (LSG7032)', data_emissao: '2025-03-15', data_vencimento: '2026-03-15', status: 'vencido' },
  { id: 5, nome: 'CRLV 2025 AM 348', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 348 (LSH9562)', data_emissao: '2025-06-10', data_vencimento: '2026-06-10', status: 'vencido' },
  { id: 6, nome: 'CRLV 2026 AM 436', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 436 (KRI8395)', data_emissao: '2026-05-01', data_vencimento: '2027-05-01', status: 'vigente' },
  { id: 7, nome: 'CRLV 2026 AM 437', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 437 (KRI8396)', data_emissao: '2026-04-15', data_vencimento: '2027-04-15', status: 'vigente' },
  { id: 8, nome: 'CRLV 2026 AM 450', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 450 (RIO3G30)', data_emissao: '2026-06-01', data_vencimento: '2026-09-01', status: 'renovando' },
  { id: 9, nome: 'CRLV 2026 AM 456', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 456 (FZP0692)', data_emissao: '2026-03-20', data_vencimento: '2026-09-20', status: 'renovando' },
  { id: 10, nome: 'CRLV 2026 AM 460', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 460 (BRO2622)', data_emissao: '2026-07-01', data_vencimento: '2027-07-01', status: 'vigente' },
  { id: 11, nome: 'CNH Cat D - Carlos Silva', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Carlos Silva', data_emissao: '2024-05-10', data_vencimento: '2029-05-10', status: 'vigente' },
  { id: 12, nome: 'CNH Cat D - Marcos Oliveira', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Marcos Oliveira', data_emissao: '2023-08-15', data_vencimento: '2026-08-15', status: 'pendente' },
  { id: 13, nome: 'CNH Cat D - Roberto Almeida', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Roberto Almeida', data_emissao: '2021-11-20', data_vencimento: '2026-11-20', status: 'vigente' },
  { id: 14, nome: 'CNH Cat D - Fernando Santos', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Fernando Santos', data_emissao: '2022-02-10', data_vencimento: '2026-02-10', status: 'vencido' },
  { id: 15, nome: 'CNH Cat D - Paulo Mendes', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Paulo Mendes', data_emissao: '2023-03-05', data_vencimento: '2026-09-05', status: 'renovando' },
  { id: 16, nome: 'Alvara Vigilancia Sanitaria RJ', tipo: 'Alvara', entidade_tipo: 'vtr', entidade_nome: 'Base RJ (Geral)', data_emissao: '2025-12-01', data_vencimento: '2026-12-01', status: 'vigente' },
  { id: 17, nome: 'Alvara Vigilancia Sanitaria SP', tipo: 'Alvara', entidade_tipo: 'vtr', entidade_nome: 'Base SP (Geral)', data_emissao: '2026-01-15', data_vencimento: '2027-01-15', status: 'vigente' },
  { id: 18, nome: 'Seguro Frota RJ 2026', tipo: 'Seguro', entidade_tipo: 'vtr', entidade_nome: 'Frota RJ (Coletivo)', data_emissao: '2026-01-01', data_vencimento: '2027-01-01', status: 'vigente' },
  { id: 19, nome: 'Seguro Frota SP 2026', tipo: 'Seguro', entidade_tipo: 'vtr', entidade_nome: 'Frota SP (Coletivo)', data_emissao: '2026-02-01', data_vencimento: '2026-08-01', status: 'vencido' },
  { id: 20, nome: 'ANVISA Autorizacao AM 340', tipo: 'ANVISA', entidade_tipo: 'vtr', entidade_nome: 'AM 340 (LSG7033)', data_emissao: '2025-09-01', data_vencimento: '2026-09-01', status: 'renovando' },
  { id: 21, nome: 'ANVISA Autorizacao AM 341', tipo: 'ANVISA', entidade_tipo: 'vtr', entidade_nome: 'AM 341 (LSG7030)', data_emissao: '2025-10-15', data_vencimento: '2026-10-15', status: 'vigente' },
  { id: 22, nome: 'Contrato SulAmerica', tipo: 'Contrato', entidade_tipo: 'vtr', entidade_nome: 'Institucional', data_emissao: '2026-01-01', data_vencimento: '2026-12-31', status: 'vigente' },
  { id: 23, nome: 'Contrato Amil', tipo: 'Contrato', entidade_tipo: 'vtr', entidade_nome: 'Institucional', data_emissao: '2026-03-01', data_vencimento: '2027-02-28', status: 'vigente' },
  { id: 24, nome: 'CNH Cat D - Anderson Lima', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Anderson Lima', data_emissao: '2024-01-20', data_vencimento: '2029-01-20', status: 'vigente' },
  { id: 25, nome: 'CNH Cat D - Rafael Costa', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Rafael Costa', data_emissao: '2022-06-15', data_vencimento: '2027-06-15', status: 'vigente' },
  { id: 26, nome: 'CRLV 2026 AM 443', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 443 (RIO2I18)', data_emissao: '2026-05-10', data_vencimento: '2026-09-10', status: 'renovando' },
  { id: 27, nome: 'CRLV 2025 AM 345', tipo: 'CRLV', entidade_tipo: 'vtr', entidade_nome: 'AM 345 (LSG7029)', data_emissao: '2025-04-20', data_vencimento: '2026-04-20', status: 'vencido' },
  { id: 28, nome: 'Seguro Individual AM 340', tipo: 'Seguro', entidade_tipo: 'vtr', entidade_nome: 'AM 340 (LSG7033)', data_emissao: '2026-06-01', data_vencimento: '2027-06-01', status: 'vigente' },
  { id: 29, nome: 'CNH Cat E - Jorge Ferreira', tipo: 'CNH', entidade_tipo: 'funcionario', entidade_nome: 'Jorge Ferreira', data_emissao: '2023-09-10', data_vencimento: '2026-09-10', status: 'renovando' },
  { id: 30, nome: 'Contrato Bradesco Saude', tipo: 'Contrato', entidade_tipo: 'vtr', entidade_nome: 'Institucional', data_emissao: '2026-04-01', data_vencimento: '2027-03-31', status: 'vigente' },
];

// ── Leads (pipeline comercial) ──────────────────────────────────────

export type LeadEstagio = 'novo' | 'qualificado' | 'cotado' | 'negociando' | 'convertido' | 'perdido';

export interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  canal: ChamadoCanal;
  tipo_servico: string;
  regiao: string;
  empresa?: string;
  valor_estimado: number;
  estagio: LeadEstagio;
  notas: string;
  created_at: string;
  ultimo_contato: string;
}

export const mockLeads: Lead[] = [
  { id: 1, nome: 'Maria Helena Souza', telefone: '(21) 99876-5432', email: 'mh.souza@email.com', canal: 'whatsapp', tipo_servico: 'UTI Movel', regiao: 'Zona Sul RJ', valor_estimado: 3200, estagio: 'novo', notas: 'Precisa de remocao para mae idosa', created_at: '2026-08-19T14:30:00', ultimo_contato: '2026-08-19T14:30:00' },
  { id: 2, nome: 'Carlos Eduardo Martins', telefone: '(21) 98765-4321', email: 'carlos.m@empresa.com', canal: 'telefone', tipo_servico: 'Cobertura de Evento', regiao: 'Centro RJ', empresa: 'Eventos Premium RJ', valor_estimado: 8500, estagio: 'qualificado', notas: 'Evento corporativo 200 pessoas, 2 ambulancias', created_at: '2026-08-18T10:00:00', ultimo_contato: '2026-08-19T16:00:00' },
  { id: 3, nome: 'Dra. Patricia Lopes', telefone: '(11) 97654-3210', email: 'patricia@clinicasp.com.br', canal: 'email', tipo_servico: 'Remocao Inter-hospitalar', regiao: 'Zona Oeste SP', empresa: 'Clinica Vida SP', valor_estimado: 15000, estagio: 'cotado', notas: 'Contrato mensal para remocoes regulares', created_at: '2026-08-15T09:00:00', ultimo_contato: '2026-08-18T11:30:00' },
  { id: 4, nome: 'Roberto Andrade', telefone: '(21) 96543-2109', email: 'roberto.a@gmail.com', canal: 'site', tipo_servico: 'UTI Movel', regiao: 'Niteroi', valor_estimado: 2800, estagio: 'negociando', notas: 'Paciente pos-cirurgico, transporte para casa', created_at: '2026-08-14T16:45:00', ultimo_contato: '2026-08-19T09:15:00' },
  { id: 5, nome: 'Fernanda Costa', telefone: '(21) 95432-1098', email: 'fernanda@email.com', canal: 'whatsapp', tipo_servico: 'Basica', regiao: 'Zona Norte RJ', valor_estimado: 1200, estagio: 'convertido', notas: 'Transporte de rotina, ja pagou', created_at: '2026-08-10T08:00:00', ultimo_contato: '2026-08-17T14:00:00' },
  { id: 6, nome: 'Andre Goncalves', telefone: '(11) 94321-0987', email: 'andre.g@empresa.com', canal: 'telefone', tipo_servico: 'Cobertura de Evento', regiao: 'Zona Sul SP', empresa: 'Construtora AGC', valor_estimado: 6000, estagio: 'perdido', notas: 'Perdeu pra concorrente por preco', created_at: '2026-08-08T11:00:00', ultimo_contato: '2026-08-16T10:00:00' },
  { id: 7, nome: 'Lucia Mendes', telefone: '(21) 93210-9876', email: 'lucia.m@email.com', canal: 'whatsapp', tipo_servico: 'UTI Movel', regiao: 'Barra da Tijuca', valor_estimado: 4500, estagio: 'novo', notas: 'Urgente, paciente em domicilio', created_at: '2026-08-20T07:30:00', ultimo_contato: '2026-08-20T07:30:00' },
  { id: 8, nome: 'Hospital Sao Lucas', telefone: '(21) 92109-8765', email: 'admin@saolucas.com.br', canal: 'email', tipo_servico: 'Remocao Inter-hospitalar', regiao: 'Centro RJ', empresa: 'Hospital Sao Lucas', valor_estimado: 22000, estagio: 'negociando', notas: 'Contrato trimestral 10 remocoes/mes', created_at: '2026-08-12T14:00:00', ultimo_contato: '2026-08-19T17:30:00' },
  { id: 9, nome: 'Marcos Pereira', telefone: '(11) 91098-7654', email: 'marcos.p@gmail.com', canal: 'site', tipo_servico: 'Basica', regiao: 'Guarulhos', valor_estimado: 950, estagio: 'qualificado', notas: 'Transporte para fisioterapia semanal', created_at: '2026-08-17T13:20:00', ultimo_contato: '2026-08-18T15:00:00' },
  { id: 10, nome: 'Ana Paula Ribeiro', telefone: '(21) 90987-6543', email: 'ana.ribeiro@email.com', canal: 'whatsapp', tipo_servico: 'UTI Movel', regiao: 'Copacabana', valor_estimado: 3800, estagio: 'cotado', notas: 'Remoção pos-AVC, CTI para domicilio', created_at: '2026-08-16T10:45:00', ultimo_contato: '2026-08-19T12:00:00' },
  { id: 11, nome: 'Petrobras CENPES', telefone: '(21) 89876-5432', email: 'saude@petrobras.com.br', canal: 'email', tipo_servico: 'Cobertura de Evento', regiao: 'Ilha do Fundao', empresa: 'Petrobras', valor_estimado: 45000, estagio: 'negociando', notas: 'Contrato anual cobertura planta industrial', created_at: '2026-08-05T09:00:00', ultimo_contato: '2026-08-20T10:00:00' },
  { id: 12, nome: 'Joao Ricardo Lima', telefone: '(21) 88765-4321', email: 'jr.lima@email.com', canal: 'manual', tipo_servico: 'Basica', regiao: 'Meier', valor_estimado: 800, estagio: 'perdido', notas: 'Desistiu por encontrar alternativa propria', created_at: '2026-08-13T15:30:00', ultimo_contato: '2026-08-15T09:00:00' },
];

// ── Pneus backoffice ────────────────────────────────────────────────

export type PneuStatusBO = 'em_uso' | 'estoque' | 'descartado' | 'recapagem';

export interface PneuBackoffice {
  id: number;
  codigo: string;
  dimensao: string;
  marca: string;
  vtr_id?: string;
  vtr_nome?: string;
  posicao?: string;
  status: PneuStatusBO;
  vida: number;
  km_instalacao?: number;
}

export const mockPneusBackoffice: PneuBackoffice[] = [
  { id: 1, codigo: 'PN-001', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'DE', status: 'em_uso', vida: 1, km_instalacao: 290000 },
  { id: 2, codigo: 'PN-002', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'DD', status: 'em_uso', vida: 1, km_instalacao: 290000 },
  { id: 3, codigo: 'PN-003', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'TIE', status: 'em_uso', vida: 2, km_instalacao: 280000 },
  { id: 4, codigo: 'PN-004', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'TII', status: 'em_uso', vida: 2, km_instalacao: 280000 },
  { id: 5, codigo: 'PN-005', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'TDE', status: 'em_uso', vida: 1, km_instalacao: 300000 },
  { id: 6, codigo: 'PN-006', dimensao: '225/75 R16', marca: 'Michelin', vtr_id: '26', vtr_nome: '340', posicao: 'TDI', status: 'em_uso', vida: 1, km_instalacao: 300000 },
  { id: 7, codigo: 'PN-007', dimensao: '225/75 R16', marca: 'Continental', vtr_id: '27', vtr_nome: '341', posicao: 'DE', status: 'em_uso', vida: 1, km_instalacao: 340000 },
  { id: 8, codigo: 'PN-008', dimensao: '225/75 R16', marca: 'Continental', vtr_id: '27', vtr_nome: '341', posicao: 'DD', status: 'em_uso', vida: 1, km_instalacao: 340000 },
  { id: 9, codigo: 'PN-009', dimensao: '225/75 R16', marca: 'Continental', vtr_id: '27', vtr_nome: '341', posicao: 'TIE', status: 'em_uso', vida: 3, km_instalacao: 320000 },
  { id: 10, codigo: 'PN-010', dimensao: '225/75 R16', marca: 'Continental', vtr_id: '27', vtr_nome: '341', posicao: 'TII', status: 'em_uso', vida: 3, km_instalacao: 320000 },
  { id: 11, codigo: 'PN-011', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '28', vtr_nome: '342', posicao: 'DE', status: 'em_uso', vida: 1, km_instalacao: 210000 },
  { id: 12, codigo: 'PN-012', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '28', vtr_nome: '342', posicao: 'DD', status: 'em_uso', vida: 1, km_instalacao: 210000 },
  { id: 13, codigo: 'PN-013', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '85', vtr_nome: '436', posicao: 'DE', status: 'em_uso', vida: 2, km_instalacao: 180000 },
  { id: 14, codigo: 'PN-014', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '85', vtr_nome: '436', posicao: 'DD', status: 'em_uso', vida: 2, km_instalacao: 180000 },
  { id: 15, codigo: 'PN-015', dimensao: '225/75 R16', marca: 'Goodyear', status: 'estoque', vida: 0 },
  { id: 16, codigo: 'PN-016', dimensao: '225/75 R16', marca: 'Goodyear', status: 'estoque', vida: 0 },
  { id: 17, codigo: 'PN-017', dimensao: '225/75 R16', marca: 'Goodyear', status: 'estoque', vida: 0 },
  { id: 18, codigo: 'PN-018', dimensao: '225/75 R16', marca: 'Michelin', status: 'recapagem', vida: 2 },
  { id: 19, codigo: 'PN-019', dimensao: '225/75 R16', marca: 'Michelin', status: 'recapagem', vida: 2 },
  { id: 20, codigo: 'PN-020', dimensao: '225/75 R16', marca: 'Continental', status: 'descartado', vida: 4 },
  { id: 21, codigo: 'PN-021', dimensao: '225/75 R16', marca: 'Continental', status: 'descartado', vida: 4 },
  { id: 22, codigo: 'PN-022', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '99', vtr_nome: '437', posicao: 'DE', status: 'em_uso', vida: 1, km_instalacao: 180000 },
  { id: 23, codigo: 'PN-023', dimensao: '225/75 R16', marca: 'Pirelli', vtr_id: '99', vtr_nome: '437', posicao: 'DD', status: 'em_uso', vida: 1, km_instalacao: 180000 },
  { id: 24, codigo: 'PN-024', dimensao: '225/75 R16', marca: 'Firestone', status: 'estoque', vida: 0 },
  { id: 25, codigo: 'PN-025', dimensao: '225/75 R16', marca: 'Firestone', status: 'estoque', vida: 0 },
  { id: 26, codigo: 'PN-026', dimensao: '225/75 R16', marca: 'Firestone', status: 'recapagem', vida: 3 },
  { id: 27, codigo: 'PN-027', dimensao: '225/75 R16', marca: 'Michelin', status: 'descartado', vida: 4 },
  { id: 28, codigo: 'PN-028', dimensao: '225/75 R16', marca: 'Goodyear', vtr_id: '85', vtr_nome: '436', posicao: 'TIE', status: 'em_uso', vida: 1, km_instalacao: 185000 },
  { id: 29, codigo: 'PN-029', dimensao: '225/75 R16', marca: 'Goodyear', vtr_id: '85', vtr_nome: '436', posicao: 'TII', status: 'em_uso', vida: 1, km_instalacao: 185000 },
  { id: 30, codigo: 'PN-030', dimensao: '225/75 R16', marca: 'Goodyear', vtr_id: '85', vtr_nome: '436', posicao: 'TDE', status: 'em_uso', vida: 1, km_instalacao: 185000 },
];

// ── Ordens de Servico ───────────────────────────────────────────────

export type OSStatus = 'agendada' | 'em_andamento' | 'aguardando_peca' | 'concluida';
export type OSPrioridade = 'baixa' | 'media' | 'alta' | 'critica';

export interface OrdemServico {
  id: number;
  vtr_id: string;
  vtr_nome: string;
  vtr_placa: string;
  fornecedor: string;
  tipo: 'preventiva' | 'corretiva';
  descricao: string;
  prioridade: OSPrioridade;
  status: OSStatus;
  valor: number;
  itens: string[];
  created_at: string;
}

export const mockOrdensServico: OrdemServico[] = [
  { id: 1, vtr_id: '30', vtr_nome: '344', vtr_placa: 'LSG7032', fornecedor: 'ADJ Diesel', tipo: 'corretiva', descricao: 'Troca de turbina com vazamento de oleo', prioridade: 'alta', status: 'em_andamento', valor: 4800, itens: ['Turbina', 'Junta turbo', 'Oleo motor 15W40'], created_at: '2026-08-18T08:00:00' },
  { id: 2, vtr_id: '31', vtr_nome: '345', vtr_placa: 'LSG7029', fornecedor: 'Mercedes-Benz Sprinter Center', tipo: 'preventiva', descricao: 'Revisao 200.000km completa', prioridade: 'media', status: 'agendada', valor: 3200, itens: ['Filtro oleo', 'Filtro ar', 'Filtro combustivel', 'Pastilhas freio', 'Fluido freio'], created_at: '2026-08-20T09:00:00' },
  { id: 3, vtr_id: '39', vtr_nome: '444', vtr_placa: 'RIO4H62', fornecedor: 'Center Diesel Servicos', tipo: 'corretiva', descricao: 'Substituicao do sistema de arrefecimento', prioridade: 'alta', status: 'aguardando_peca', valor: 2600, itens: ['Radiador', 'Bomba dagua', 'Mangueiras', 'Aditivo'], created_at: '2026-08-15T10:30:00' },
  { id: 4, vtr_id: '47', vtr_nome: '454', vtr_placa: 'RIO2J99', fornecedor: 'Retifica Motores Brasil', tipo: 'corretiva', descricao: 'Retifica do cabecote com trinca', prioridade: 'critica', status: 'em_andamento', valor: 7500, itens: ['Retifica cabecote', 'Junta cabecote', 'Parafusos', 'Teste pressao'], created_at: '2026-08-12T07:00:00' },
  { id: 5, vtr_id: '74', vtr_nome: '348', vtr_placa: 'LSH9562', fornecedor: 'Navarro Transmissoes', tipo: 'corretiva', descricao: 'Reparo na caixa de cambio automatica', prioridade: 'alta', status: 'em_andamento', valor: 5200, itens: ['Kit reparo cambio', 'Oleo cambio ATF', 'Filtro cambio'], created_at: '2026-08-16T11:00:00' },
  { id: 6, vtr_id: '130', vtr_nome: '352', vtr_placa: 'KRK7699', fornecedor: 'Sol Nascente Auto', tipo: 'preventiva', descricao: 'Alinhamento, balanceamento e troca de pneus', prioridade: 'baixa', status: 'concluida', valor: 1800, itens: ['Alinhamento', 'Balanceamento', 'Pneus 225/75 R16 x4'], created_at: '2026-08-10T14:00:00' },
  { id: 7, vtr_id: '36', vtr_nome: '457', vtr_placa: 'FHV2911', fornecedor: '0 KM', tipo: 'corretiva', descricao: 'Troca de embreagem completa', prioridade: 'media', status: 'agendada', valor: 3400, itens: ['Kit embreagem', 'Rolamento', 'Volante motor'], created_at: '2026-08-19T13:00:00' },
  { id: 8, vtr_id: '26', vtr_nome: '340', vtr_placa: 'LSG7033', fornecedor: 'Renault Servicos Especializados', tipo: 'preventiva', descricao: 'Revisao eletrica e teste de bateria', prioridade: 'baixa', status: 'concluida', valor: 650, itens: ['Teste bateria', 'Verificacao alternador', 'Troca fusivel'], created_at: '2026-08-08T08:30:00' },
  { id: 9, vtr_id: '85', vtr_nome: '436', vtr_placa: 'KRI8395', fornecedor: 'ADJ Diesel', tipo: 'preventiva', descricao: 'Troca de correias e tensores', prioridade: 'media', status: 'agendada', valor: 1900, itens: ['Correia dentada', 'Correia alternador', 'Tensor', 'Bomba dagua'], created_at: '2026-08-21T09:00:00' },
  { id: 10, vtr_id: '89', vtr_nome: '432', vtr_placa: 'GAB4210', fornecedor: 'ATK Acessorios', tipo: 'corretiva', descricao: 'Reparo no sistema de ar condicionado', prioridade: 'media', status: 'aguardando_peca', valor: 2100, itens: ['Compressor AC', 'Gas R134a', 'Filtro secador'], created_at: '2026-08-17T15:00:00' },
];

// ── Checklist Modelos e Execuções ─────────────────────────────────────

export interface ChecklistModelo {
  id: string;
  nome: string;
  tipo_vtr: string;
  frequencia: string;
  itens: { categoria: string; nome: string; tipo: string; obrigatorio: boolean }[];
  ativo: boolean;
}

export interface ChecklistExecucao {
  id: string;
  modelo_nome: string;
  vtr_nome: string;
  vtr_placa: string;
  executado_por: string;
  data: string;
  resultado: 'aprovado' | 'reprovado_parcial' | 'reprovado';
  total_itens: number;
  itens_aprovados: number;
  itens_reprovados: number;
  duracao_minutos: number;
  itens_resultado: { nome: string; categoria: string; aprovado: boolean; observacao?: string }[];
}

export const mockChecklistModelos: ChecklistModelo[] = [
  {
    id: 'chk-mod-1',
    nome: 'Checklist Diário — Ambulância Básica',
    tipo_vtr: 'basica',
    frequencia: 'diário',
    ativo: true,
    itens: [
      // Parte Externa (6)
      { categoria: 'Parte Externa', nome: 'Faróis dianteiros e traseiros', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Lanternas e setas', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Sirene e giroflex', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Pneus (condição visual e calibragem)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Para-choque e carroceria', tipo: 'bool', obrigatorio: false },
      { categoria: 'Parte Externa', nome: 'Espelhos retrovisores', tipo: 'bool', obrigatorio: true },
      // Parte Interna (6)
      { categoria: 'Parte Interna', nome: 'Ar condicionado cabine', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Ar condicionado compartimento', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Maca principal (travas e rodízios)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Cintos de segurança paciente', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Banco motorista e acompanhante', tipo: 'bool', obrigatorio: false },
      { categoria: 'Parte Interna', nome: 'Iluminação interna compartimento', tipo: 'bool', obrigatorio: true },
      // Equipamentos (9)
      { categoria: 'Equipamentos', nome: 'Cilindro O2 (nível mínimo 50%)', tipo: 'número', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Aspirador portátil', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Bolsa de primeiros socorros', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Prancha rígida', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Colar cervical (kit P/M/G)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Talas de imobilização', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'KED (colete de extricação)', tipo: 'bool', obrigatorio: false },
      { categoria: 'Equipamentos', nome: 'Extintor de incêndio (validade)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Triângulo de sinalização', tipo: 'bool', obrigatorio: true },
      // Documentação (5)
      { categoria: 'Documentação', nome: 'CRLV em dia', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Seguro obrigatório', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Alvará Vigilância Sanitária', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Autorização ANVISA', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'CNH motorista (validade)', tipo: 'bool', obrigatorio: true },
    ],
  },
  {
    id: 'chk-mod-2',
    nome: 'Checklist Diário — UTI Móvel',
    tipo_vtr: 'uti',
    frequencia: 'diário',
    ativo: true,
    itens: [
      // Parte Externa (6)
      { categoria: 'Parte Externa', nome: 'Faróis dianteiros e traseiros', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Lanternas e setas', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Sirene e giroflex', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Pneus (condição visual e calibragem)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Externa', nome: 'Para-choque e carroceria', tipo: 'bool', obrigatorio: false },
      { categoria: 'Parte Externa', nome: 'Espelhos retrovisores', tipo: 'bool', obrigatorio: true },
      // Parte Interna (6)
      { categoria: 'Parte Interna', nome: 'Ar condicionado cabine', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Ar condicionado compartimento', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Maca principal (travas e rodízios)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Cintos de segurança paciente', tipo: 'bool', obrigatorio: true },
      { categoria: 'Parte Interna', nome: 'Banco motorista e acompanhante', tipo: 'bool', obrigatorio: false },
      { categoria: 'Parte Interna', nome: 'Iluminação interna compartimento', tipo: 'bool', obrigatorio: true },
      // Equipamentos (9)
      { categoria: 'Equipamentos', nome: 'Cilindro O2 (nível mínimo 50%)', tipo: 'número', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Aspirador portátil', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Bolsa de primeiros socorros', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Prancha rígida', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Colar cervical (kit P/M/G)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Talas de imobilização', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'KED (colete de extricação)', tipo: 'bool', obrigatorio: false },
      { categoria: 'Equipamentos', nome: 'Extintor de incêndio (validade)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos', nome: 'Triângulo de sinalização', tipo: 'bool', obrigatorio: true },
      // Equipamentos UTI (8)
      { categoria: 'Equipamentos UTI', nome: 'Monitor multiparâmetro (teste)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Desfibrilador (teste de carga)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Ventilador mecânico (teste)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Capnógrafo', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Bomba de infusão (2 unidades)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Laringoscópio (lâminas 3/4)', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Maleta de intubação', tipo: 'bool', obrigatorio: true },
      { categoria: 'Equipamentos UTI', nome: 'Medicações controladas (lacre)', tipo: 'foto', obrigatorio: true },
      // Documentação (5)
      { categoria: 'Documentação', nome: 'CRLV em dia', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Seguro obrigatório', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Alvará Vigilância Sanitária', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'Autorização ANVISA', tipo: 'bool', obrigatorio: true },
      { categoria: 'Documentação', nome: 'CNH motorista (validade)', tipo: 'bool', obrigatorio: true },
    ],
  },
];

export const mockChecklistExecucoes: ChecklistExecucao[] = [
  {
    id: 'exec-001',
    modelo_nome: 'Checklist Diário — Ambulância Básica',
    vtr_nome: '451',
    vtr_placa: 'RIO4H60',
    executado_por: 'Adilson Barbosa Moreira Junior',
    data: '2026-08-20',
    resultado: 'aprovado',
    total_itens: 26,
    itens_aprovados: 26,
    itens_reprovados: 0,
    duracao_minutos: 12,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Sirene e giroflex', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Pneus (condição visual e calibragem)', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Maca principal (travas e rodízios)', categoria: 'Parte Interna', aprovado: true },
      { nome: 'Cilindro O2 (nível mínimo 50%)', categoria: 'Equipamentos', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-002',
    modelo_nome: 'Checklist Diário — UTI Móvel',
    vtr_nome: '340',
    vtr_placa: 'LSG7033',
    executado_por: 'Caetano Pedro Bento',
    data: '2026-08-20',
    resultado: 'reprovado_parcial',
    total_itens: 34,
    itens_aprovados: 32,
    itens_reprovados: 2,
    duracao_minutos: 18,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Pneus (condição visual e calibragem)', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Ar condicionado compartimento', categoria: 'Parte Interna', aprovado: false, observacao: 'Temperatura não estabiliza abaixo de 24°C. OS aberta.' },
      { nome: 'Capnógrafo', categoria: 'Equipamentos UTI', aprovado: false, observacao: 'Sensor com leitura intermitente. Encaminhado para calibração.' },
      { nome: 'Desfibrilador (teste de carga)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-003',
    modelo_nome: 'Checklist Diário — Ambulância Básica',
    vtr_nome: '350',
    vtr_placa: 'KRK7698',
    executado_por: 'Elson Firmino',
    data: '2026-08-19',
    resultado: 'aprovado',
    total_itens: 26,
    itens_aprovados: 26,
    itens_reprovados: 0,
    duracao_minutos: 14,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Sirene e giroflex', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Maca principal (travas e rodízios)', categoria: 'Parte Interna', aprovado: true },
      { nome: 'Cilindro O2 (nível mínimo 50%)', categoria: 'Equipamentos', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-004',
    modelo_nome: 'Checklist Diário — UTI Móvel',
    vtr_nome: '342',
    vtr_placa: 'LSG7034',
    executado_por: 'Felipe da Conceicao Amaral',
    data: '2026-08-19',
    resultado: 'aprovado',
    total_itens: 34,
    itens_aprovados: 34,
    itens_reprovados: 0,
    duracao_minutos: 20,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Monitor multiparâmetro (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'Desfibrilador (teste de carga)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'Ventilador mecânico (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-005',
    modelo_nome: 'Checklist Diário — Ambulância Básica',
    vtr_nome: '353',
    vtr_placa: 'KRK7697',
    executado_por: 'Anderson de Souza',
    data: '2026-08-18',
    resultado: 'reprovado_parcial',
    total_itens: 26,
    itens_aprovados: 25,
    itens_reprovados: 1,
    duracao_minutos: 15,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Extintor de incêndio (validade)', categoria: 'Equipamentos', aprovado: false, observacao: 'Extintor com validade vencida em 10/08. Solicitar troca.' },
      { nome: 'Maca principal (travas e rodízios)', categoria: 'Parte Interna', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-006',
    modelo_nome: 'Checklist Diário — UTI Móvel',
    vtr_nome: '436',
    vtr_placa: 'KRI8395',
    executado_por: 'Gabriel da Silva Galvao',
    data: '2026-08-18',
    resultado: 'aprovado',
    total_itens: 34,
    itens_aprovados: 34,
    itens_reprovados: 0,
    duracao_minutos: 22,
    itens_resultado: [
      { nome: 'Monitor multiparâmetro (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'Desfibrilador (teste de carga)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'Medicações controladas (lacre)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-007',
    modelo_nome: 'Checklist Diário — Ambulância Básica',
    vtr_nome: '427',
    vtr_placa: 'LSB7248',
    executado_por: 'Denilson Rocha',
    data: '2026-08-17',
    resultado: 'reprovado_parcial',
    total_itens: 26,
    itens_aprovados: 23,
    itens_reprovados: 3,
    duracao_minutos: 16,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: false, observacao: 'Farol esquerdo queimado.' },
      { nome: 'Espelhos retrovisores', categoria: 'Parte Externa', aprovado: false, observacao: 'Retrovisor direito com fixação frouxa.' },
      { nome: 'Ar condicionado cabine', categoria: 'Parte Interna', aprovado: false, observacao: 'AC não liga. Verificar fusível.' },
      { nome: 'Maca principal (travas e rodízios)', categoria: 'Parte Interna', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-008',
    modelo_nome: 'Checklist Diário — UTI Móvel',
    vtr_nome: '343',
    vtr_placa: 'LSG7031',
    executado_por: 'Guilherme Aprodu',
    data: '2026-08-17',
    resultado: 'aprovado',
    total_itens: 34,
    itens_aprovados: 34,
    itens_reprovados: 0,
    duracao_minutos: 19,
    itens_resultado: [
      { nome: 'Monitor multiparâmetro (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'Ventilador mecânico (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-009',
    modelo_nome: 'Checklist Diário — Ambulância Básica',
    vtr_nome: '354',
    vtr_placa: 'KRL3687',
    executado_por: 'Danilo Gomes Colen',
    data: '2026-08-16',
    resultado: 'aprovado',
    total_itens: 26,
    itens_aprovados: 26,
    itens_reprovados: 0,
    duracao_minutos: 11,
    itens_resultado: [
      { nome: 'Faróis dianteiros e traseiros', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Pneus (condição visual e calibragem)', categoria: 'Parte Externa', aprovado: true },
      { nome: 'Cilindro O2 (nível mínimo 50%)', categoria: 'Equipamentos', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
  {
    id: 'exec-010',
    modelo_nome: 'Checklist Diário — UTI Móvel',
    vtr_nome: '437',
    vtr_placa: 'KRI8396',
    executado_por: 'Ismael Antonio da Silva',
    data: '2026-08-15',
    resultado: 'reprovado',
    total_itens: 34,
    itens_aprovados: 28,
    itens_reprovados: 6,
    duracao_minutos: 25,
    itens_resultado: [
      { nome: 'Pneus (condição visual e calibragem)', categoria: 'Parte Externa', aprovado: false, observacao: 'Pneu traseiro esquerdo com desgaste irregular.' },
      { nome: 'Ar condicionado compartimento', categoria: 'Parte Interna', aprovado: false, observacao: 'Não refrigera. Gás aparentemente vazou.' },
      { nome: 'Cilindro O2 (nível mínimo 50%)', categoria: 'Equipamentos', aprovado: false, observacao: 'Nível em 30%. Substituir cilindro.' },
      { nome: 'Ventilador mecânico (teste)', categoria: 'Equipamentos UTI', aprovado: false, observacao: 'Alarme de pressão constante. Enviar para assistência.' },
      { nome: 'Bomba de infusão (2 unidades)', categoria: 'Equipamentos UTI', aprovado: false, observacao: 'Apenas 1 bomba funcional. Segunda com display apagado.' },
      { nome: 'Maleta de intubação', categoria: 'Equipamentos UTI', aprovado: false, observacao: 'Falta lâmina de laringoscópio número 4.' },
      { nome: 'Monitor multiparâmetro (teste)', categoria: 'Equipamentos UTI', aprovado: true },
      { nome: 'CRLV em dia', categoria: 'Documentação', aprovado: true },
    ],
  },
];

// ── Eventos — Precificação e Orçamentos ──────────────────────────

export interface EventoPrecificacao {
  tipo_servico: 'basica' | 'uti' | 'posto_medico';
  valor_hora: number;
  minimo_horas: number;
  desconto_maximo: number; // 0.20 = 20%
}

export interface OrcamentoEvento {
  id: string;
  cliente_nome: string;
  cliente_empresa?: string;
  cliente_telefone: string;
  evento_nome: string;
  evento_data: string;
  evento_local: string;
  evento_publico_estimado: number;
  itens: {
    tipo: 'basica' | 'uti' | 'posto_medico';
    quantidade: number;
    horas: number;
    valor_unitario: number;
    desconto: number; // 0 to 0.20
    subtotal: number;
  }[];
  valor_total: number;
  valor_com_desconto: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado';
  created_at: string;
  validade_dias: number;
}

export const tabelaPrecos: EventoPrecificacao[] = [
  { tipo_servico: 'basica', valor_hora: 150, minimo_horas: 4, desconto_maximo: 0.20 },
  { tipo_servico: 'uti', valor_hora: 300, minimo_horas: 4, desconto_maximo: 0.20 },
  { tipo_servico: 'posto_medico', valor_hora: 250, minimo_horas: 4, desconto_maximo: 0.20 },
];

export const mockOrcamentosEvento: OrcamentoEvento[] = [
  {
    id: 'orc-001',
    cliente_nome: 'Ricardo Mendes',
    cliente_empresa: 'Petrobras S.A.',
    cliente_telefone: '(21) 99887-4532',
    evento_nome: 'SIPAT Petrobras 2026',
    evento_data: '2026-09-15',
    evento_local: 'EDISE, Av. Chile 65, Centro, RJ',
    evento_publico_estimado: 2000,
    itens: [
      { tipo: 'uti', quantidade: 2, horas: 10, valor_unitario: 300, desconto: 0.10, subtotal: 5400 },
      { tipo: 'basica', quantidade: 2, horas: 10, valor_unitario: 150, desconto: 0.10, subtotal: 2700 },
      { tipo: 'posto_medico', quantidade: 1, horas: 10, valor_unitario: 250, desconto: 0.10, subtotal: 2250 },
    ],
    valor_total: 11500,
    valor_com_desconto: 10350,
    status: 'aprovado',
    created_at: '2026-08-10',
    validade_dias: 15,
  },
  {
    id: 'orc-002',
    cliente_nome: 'Fernanda Lopes',
    cliente_empresa: 'TV Globo',
    cliente_telefone: '(21) 98765-1234',
    evento_nome: 'Gravação externa Projac',
    evento_data: '2026-09-22',
    evento_local: 'Estúdios Globo, Curicica, RJ',
    evento_publico_estimado: 500,
    itens: [
      { tipo: 'uti', quantidade: 1, horas: 12, valor_unitario: 300, desconto: 0, subtotal: 3600 },
      { tipo: 'basica', quantidade: 1, horas: 12, valor_unitario: 150, desconto: 0, subtotal: 1800 },
    ],
    valor_total: 5400,
    valor_com_desconto: 5400,
    status: 'enviado',
    created_at: '2026-08-14',
    validade_dias: 10,
  },
  {
    id: 'orc-003',
    cliente_nome: 'Paulo Amorim',
    cliente_empresa: 'Rock World S.A.',
    cliente_telefone: '(21) 97654-8899',
    evento_nome: 'Rock in Rio 2026 — Palco Mundo',
    evento_data: '2026-10-02',
    evento_local: 'Cidade do Rock, Barra da Tijuca, RJ',
    evento_publico_estimado: 80000,
    itens: [
      { tipo: 'uti', quantidade: 6, horas: 16, valor_unitario: 300, desconto: 0.20, subtotal: 23040 },
      { tipo: 'basica', quantidade: 8, horas: 16, valor_unitario: 150, desconto: 0.20, subtotal: 15360 },
      { tipo: 'posto_medico', quantidade: 4, horas: 16, valor_unitario: 250, desconto: 0.20, subtotal: 12800 },
    ],
    valor_total: 64000,
    valor_com_desconto: 51200,
    status: 'rascunho',
    created_at: '2026-08-18',
    validade_dias: 30,
  },
  {
    id: 'orc-004',
    cliente_nome: 'Marcos Tavares',
    cliente_empresa: 'Prefeitura do Rio',
    cliente_telefone: '(21) 96543-2211',
    evento_nome: 'Maratona do Rio 2026',
    evento_data: '2026-11-10',
    evento_local: 'Aterro do Flamengo ao Leblon, RJ',
    evento_publico_estimado: 35000,
    itens: [
      { tipo: 'uti', quantidade: 4, horas: 8, valor_unitario: 300, desconto: 0.15, subtotal: 8160 },
      { tipo: 'basica', quantidade: 6, horas: 8, valor_unitario: 150, desconto: 0.15, subtotal: 6120 },
      { tipo: 'posto_medico', quantidade: 3, horas: 8, valor_unitario: 250, desconto: 0.15, subtotal: 5100 },
    ],
    valor_total: 22800,
    valor_com_desconto: 19380,
    status: 'recusado',
    created_at: '2026-08-05',
    validade_dias: 15,
  },
  {
    id: 'orc-005',
    cliente_nome: 'Juliana Braga',
    cliente_telefone: '(21) 99123-7788',
    evento_nome: 'Casamento Braga & Souza',
    evento_data: '2026-10-19',
    evento_local: 'Casa de Santa Teresa, Santa Teresa, RJ',
    evento_publico_estimado: 250,
    itens: [
      { tipo: 'basica', quantidade: 1, horas: 6, valor_unitario: 150, desconto: 0, subtotal: 900 },
    ],
    valor_total: 900,
    valor_com_desconto: 900,
    status: 'enviado',
    created_at: '2026-08-16',
    validade_dias: 10,
  },
];

// ── Enriched Leads (CRM Base Completa) ─────────────────────────────

export interface LeadEnriched {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  empresa?: string;
  canal: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  tipo_servico?: string;
  regiao?: string;
  status: string;
  valor_estimado?: number;
  valor_fechado?: number;
  atendente?: string;
  notas?: string;
  pipedrive_id?: number;
  pipedrive_pipeline?: string;
  pipedrive_stage?: string;
  primeiro_contato: string;
  ultimo_contato: string;
}

export interface GA4Source {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  conversions: number;
  users: number;
}

const _campaigns = [
  'LP | Particular | RJ | MSG', 'LP | Particular | SP | MSG',
  'LP | Eventos | RJ', 'LP | Eventos | SP',
  'LP | Corporativo | RJ', 'LP | Corporativo | SP',
  'LP | UTI | RJ | MSG', 'LP | UTI | SP | MSG',
  'LP | Remoção | RJ', 'LP | Remoção | SP',
  'Brand | Savior | RJ', 'Brand | Savior | SP',
];
const _sources = ['google', 'google', 'google', 'direct', 'chatgpt', 'instagram', 'facebook'];
const _mediums = ['cpc', 'organic', 'cpc', '(none)', 'referral', 'social', 'cpc'];
const _statuses = ['convertido', 'perdido', 'novo', 'novo', 'qualificado', 'cotado', 'novo', 'perdido', 'novo', 'convertido'];
const _canais = ['whatsapp', 'whatsapp', 'site', 'whatsapp', 'site', 'telefone', 'whatsapp', 'site', 'whatsapp', 'outro'];
const _servicos = ['UTI Movel', 'Basica', 'Cobertura Evento', 'Remoção Inter-hospitalar', 'UTI Movel', 'Basica', 'Cobertura Evento'];
const _regioes = ['Zona Sul RJ', 'Centro RJ', 'Zona Oeste SP', 'Niteroi', 'Barra da Tijuca', 'Guarulhos', 'Zona Norte RJ', 'Copacabana', 'Tijuca', 'Vila Mariana SP'];
const _nomes = [
  'Maria Helena Souza','Carlos Eduardo Martins','Patricia Lopes','Roberto Andrade','Fernanda Costa',
  'Andre Goncalves','Lucia Mendes','Marcos Pereira','Ana Paula Ribeiro','Joao Ricardo Lima',
  'Beatriz Almeida','Rafael Torres','Camila Oliveira','Bruno Nascimento','Juliana Santos',
  'Fernando Rocha','Daniela Cruz','Gustavo Pinto','Mariana Ferreira','Pedro Henrique Silva',
  'Tatiana Moreira','Leonardo Carvalho','Vanessa Barbosa','Ricardo Gomes','Cristina Ramos',
  'Alexandre Duarte','Monica Teixeira','Eduardo Cardoso','Renata Vieira','Fabio Monteiro',
  'Simone Araujo','Thiago Correia','Claudia Fonseca','Rodrigo Mello','Isabela Neves',
  'Diego Sampaio','Amanda Cunha','Vinicius Braga','Priscila Dias','Marcelo Costa',
  'Carolina Campos','Felipe Borges','Larissa Lima','Giovanni Rossi','Sandra Machado',
  'Hugo Rezende','Raquel Medeiros','Otavio Freitas','Lilian Castro','Danilo Sousa',
];
const _empresas = [
  'Eventos Premium RJ', 'Hospital Sao Lucas', 'Construtora AGC', 'Petrobras', 'FIRJAN',
  'Rede D\'or', 'Hospital Einstein', 'SESC', 'Confederação de Voleibol', 'SENAC',
  null, null, null, null, null, null, null, null, null, null,
];
const _atendentes = ['Carlos Xavier', 'Comercial SP', 'Rodrigo Monfort', 'Renan Melo', 'Gabrielly', 'Claudia Feitoza'];

function _genLeads(count: number): LeadEnriched[] {
  const leads: LeadEnriched[] = [];
  const baseDate = new Date('2026-08-20T12:00:00');
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const d = new Date(baseDate.getTime() - daysAgo * 86400000);
    const srcIdx = i % _sources.length;
    const statusIdx = i % _statuses.length;
    const val = [0, 800, 950, 1200, 1800, 2250, 2800, 3500, 4500, 6900, 9500, 15000, 22000, 45000][i % 14];
    leads.push({
      id: `lead-${i + 1}`,
      nome: _nomes[i % _nomes.length],
      telefone: `(21) 9${String(1000 + i).slice(-4)}-${String(5000 + i * 3).slice(-4)}`,
      email: i % 3 === 0 ? `${_nomes[i % _nomes.length].split(' ')[0].toLowerCase()}@email.com` : undefined,
      empresa: _empresas[i % _empresas.length] || undefined,
      canal: _canais[i % _canais.length],
      utm_source: _sources[srcIdx],
      utm_medium: _mediums[srcIdx],
      utm_campaign: _campaigns[i % _campaigns.length],
      tipo_servico: _servicos[i % _servicos.length],
      regiao: _regioes[i % _regioes.length],
      status: _statuses[statusIdx],
      valor_estimado: val,
      valor_fechado: _statuses[statusIdx] === 'convertido' ? val : undefined,
      atendente: _atendentes[i % _atendentes.length],
      notas: `Lead #${i + 1} via ${_campaigns[i % _campaigns.length]}`,
      pipedrive_id: 1000 + i,
      pipedrive_pipeline: i % 3 === 0 ? 'BOT WhatsApp' : i % 3 === 1 ? 'SITE Eventos RJ' : 'SITE Corporativo RJ',
      pipedrive_stage: ['Novo Lead', 'Em cotação', 'Proposta enviada', 'Fechado'][i % 4],
      primeiro_contato: d.toISOString(),
      ultimo_contato: new Date(d.getTime() + Math.random() * 7 * 86400000).toISOString(),
    });
  }
  return leads;
}

export const mockLeadsEnriched: LeadEnriched[] = _genLeads(100);

export const mockGA4Sources: GA4Source[] = [
  { source: 'google', medium: 'cpc', campaign: 'LP | Particular | RJ | MSG', sessions: 4280, conversions: 312, users: 3890 },
  { source: 'google', medium: 'cpc', campaign: 'LP | Particular | SP | MSG', sessions: 2150, conversions: 148, users: 1980 },
  { source: 'google', medium: 'cpc', campaign: 'LP | Eventos | RJ', sessions: 890, conversions: 45, users: 820 },
  { source: 'google', medium: 'cpc', campaign: 'LP | Eventos | SP', sessions: 620, conversions: 31, users: 570 },
  { source: 'google', medium: 'cpc', campaign: 'LP | UTI | RJ | MSG', sessions: 1340, conversions: 98, users: 1210 },
  { source: 'google', medium: 'organic', campaign: '(not set)', sessions: 3120, conversions: 89, users: 2780 },
  { source: '(direct)', medium: '(none)', campaign: '(not set)', sessions: 2450, conversions: 67, users: 2100 },
  { source: 'chatgpt.com', medium: 'referral', campaign: '(not set)', sessions: 580, conversions: 34, users: 510 },
  { source: 'instagram', medium: 'social', campaign: '(not set)', sessions: 340, conversions: 12, users: 290 },
  { source: 'facebook', medium: 'cpc', campaign: 'LP | Corporativo | RJ', sessions: 420, conversions: 18, users: 380 },
  { source: 'google', medium: 'cpc', campaign: 'Brand | Savior | RJ', sessions: 1560, conversions: 124, users: 1420 },
  { source: 'google', medium: 'cpc', campaign: 'Brand | Savior | SP', sessions: 780, conversions: 56, users: 710 },
  { source: 'bing', medium: 'organic', campaign: '(not set)', sessions: 180, conversions: 8, users: 160 },
  { source: 'whatsapp', medium: 'referral', campaign: '(not set)', sessions: 290, conversions: 22, users: 260 },
  { source: 'linkedin', medium: 'social', campaign: '(not set)', sessions: 95, conversions: 3, users: 85 },
];
