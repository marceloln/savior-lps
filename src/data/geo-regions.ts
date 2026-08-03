// ============================================================
// Dados geo-específicos para as landing pages regionais.
// Cada região tem SEO, hero, tempos, hospitais, serviços,
// feature, depoimentos, FAQ e regiões próximas.
// ============================================================

export interface GeoHospital {
  name: string;
  initials: string;
  network: string;
  detail: string;
  tag: string;
  color: { bg: string; text: string };
  emergency24h?: boolean;
}

export interface GeoTempo {
  region: string;
  time: string;
  route: string;
  highlight?: boolean;
}

export interface GeoService {
  title: string;
  desc: string;
  emphasis?: boolean;
}

export interface GeoReview {
  name: string;
  text: string;
  source: string;
  rating?: number;
}

export interface GeoNearbyRegion {
  name: string;
  slug: string;
  highlight: string;
}

export interface GeoRegion {
  id: string;
  name: string;
  slug: string;
  phase: 1 | 2 | 3;
  seo: {
    title: string;
    description: string;
    h1: string;
    canonical: string;
    keywords: string[];
  };
  hero: {
    eyebrow: string;
    h1: string;
    h1Highlight: string;
    subhead: string;
    waCampaign: string;
    waMessage: string;
  };
  tempos: GeoTempo[];
  hospitals: GeoHospital[];
  services: GeoService[];
  feature: {
    label: string;
    h2: string;
    h2Highlight: string;
    paragraphs: string[];
    callout?: { title: string; body: string };
    stats: Array<{ value: string; desc: string }>;
  };
  socialProof: {
    reviews: GeoReview[];
  };
  faq: Array<{ q: string; a: string }>;
  nearbyRegions: GeoNearbyRegion[];
  schema: {
    geo: { lat: number; lng: number };
    areaServed: Array<{ name: string }>;
  };
}

// ============================================================
// Z1 — Copacabana
// ============================================================
const copacabana: GeoRegion = {
  id: 'copacabana',
  name: 'Copacabana',
  slug: 'copacabana',
  phase: 1,
  seo: {
    title: "Ambulância Particular Copacabana | UTI 24h | Remoções Copa D'Or | Savior",
    description:
      "Ambulância UTI em Copacabana em 25 a 35 min. Remoções Copa D'Or, Copa Star, São Lucas. 2 ambulâncias nos PAs Unimed do bairro. Prédio sem elevador: equipe preparada. (21) 3171-3030.",
    h1: 'Ambulância em Copacabana em 25 a 35 minutos',
    canonical: 'https://www.savior.com.br/ambulancia-rj/copacabana',
    keywords: [
      'ambulância copacabana',
      'ambulância particular copacabana',
      "remoção copa d'or",
      'ambulância para idoso copacabana',
      'ambulância prédio sem elevador',
    ],
  },
  hero: {
    eyebrow: 'Copacabana · Central 24h',
    h1: 'Ambulância em Copacabana em 25 a 35 minutos',
    h1Highlight: '25 a 35 minutos',
    subhead:
      'Com 2 ambulâncias nos PAs da Unimed no bairro, o tempo de resposta pode ser ainda menor. Médico e enfermeiro a bordo. Remoção em prédio antigo sem elevador faz parte da nossa rotina aqui.',
    waCampaign: 'geo-copacabana',
    waMessage: 'Oi, preciso de ambulância em Copacabana.',
  },
  tempos: [
    {
      region: 'PA Unimed Copacabana',
      time: 'Imediato',
      route: 'Ambulância já posicionada no bairro',
      highlight: true,
    },
    {
      region: 'Copacabana e Leme',
      time: '25 a 35 min',
      route: 'Da base via Aterro ou Túnel Rebouças',
    },
    {
      region: 'Ipanema (fronteira)',
      time: '30 a 40 min',
      route: 'Continuação pela orla após Copacabana',
    },
  ],
  hospitals: [
    {
      name: "Hospital Copa D'Or",
      initials: 'CD',
      network: "Rede D'Or",
      detail: "Rua Figueiredo de Magalhães, 875 · Alta complexidade · Emergência 24h",
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Copa Star',
      initials: 'CS',
      network: "Rede D'Or",
      detail: 'Rua Figueiredo de Magalhães, 900 · Cardiologia e hemodinâmica',
      tag: 'Cardiologia',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'Hospital São Lucas Copacabana',
      initials: 'SL',
      network: 'Particular',
      detail: 'Rua Barata Ribeiro, 67 · Fígado, rim e pâncreas',
      tag: 'Transplantes',
      color: { bg: '#0B2540', text: '#1FD29A' },
    },
    {
      name: 'Casa de Saúde São José',
      initials: 'SJ',
      network: 'Rede Santa Catarina',
      detail: 'Rua Macedo Sobrinho, 21 · Humaitá · Desde 1923',
      tag: 'Tradicional',
      color: { bg: '#1A5632', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Federal de Ipanema',
      initials: 'FI',
      network: 'SUS',
      detail: 'Rua Antônio Parreiras, 67 · Cirurgia bariátrica e urologia',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Quali Ipanema',
      initials: 'QI',
      network: 'Particular',
      detail: 'Rua Visconde de Pirajá, 547 · 62 leitos · Emergência 24h',
      tag: 'Emergência 24h',
      color: { bg: '#1B4F72', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Clínica São Vicente da Gávea',
      initials: 'SV',
      network: "Rede D'Or",
      detail: 'Rua João Borges, 204 · Gávea · Referência cirúrgica',
      tag: 'Cirurgia',
      color: { bg: '#003B71', text: '#E8A624' },
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Remoção programada',
      desc: 'Consultas, exames, quimioterapia. Agendamento no horário que você escolher.',
    },
    {
      title: 'Transferência inter-hospitalar',
      desc: "Copa D'Or para Pró-Cardíaco, Santa Lúcia para qualquer UTI da cidade.",
    },
    {
      title: 'Alta hospitalar',
      desc: 'Levamos o paciente do hospital para casa com segurança e conforto.',
    },
  ],
  feature: {
    label: 'Por que Copacabana é diferente',
    h2: 'O bairro com mais idosos do Brasil. E centenas de prédios sem elevador para maca.',
    h2Highlight: 'sem elevador para maca',
    paragraphs: [
      'Copacabana tem a maior proporção de moradores acima de 60 anos do país. Boa parte dos prédios foi construída antes dos anos 70, quando ninguém pensava em elevador de serviço com espaço para maca.',
      'Nossa equipe é treinada para remoção em escada com cadeira de transporte e maca dobrável. Informe na hora do chamado se o prédio tem elevador de serviço: a equipe já sai preparada com o equipamento certo.',
    ],
    callout: {
      title: 'Presença física no bairro',
      body: 'Duas ambulâncias ficam posicionadas nos PAs da Unimed em Copacabana, reduzindo o tempo de resposta para o mínimo possível. Quando o chamado é na região, a ambulância pode já estar a poucos quarteirões.',
    },
    stats: [
      { value: '2', desc: 'Ambulâncias nos PAs Unimed do bairro' },
      { value: '46 anos', desc: 'Removendo pacientes em prédios antigos de Copacabana' },
      { value: '24h', desc: 'Inclusive de madrugada, horário com mais emergências em idosos' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Maria L.',
        text: 'Precisei de ambulância para minha mãe de 82 anos em Copacabana. O prédio não tem elevador e a equipe subiu com cadeira de transporte sem nenhum problema. Chegaram em 20 minutos.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Roberto S.',
        text: "Transferência do Copa D'Or para o Pró-Cardíaco. Tudo coordenado, sem espera na chegada. Equipe profissional e atenciosa.",
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo a ambulância leva para chegar em Copacabana?',
      a: 'Entre 25 e 35 minutos da base em São Cristóvão. Com ambulâncias posicionadas nos PAs Unimed do bairro, o tempo pode ser menor. A central informa a estimativa real no momento do chamado.',
    },
    {
      q: 'Meu prédio não tem elevador para maca. Vocês atendem?',
      a: 'Sim. Cadeira de transporte e maca dobrável para remoção em escada fazem parte da rotina da equipe em Copacabana. Avise na hora do chamado e a equipe já sai com o equipamento certo.',
    },
    {
      q: "Vocês fazem remoção do Copa D'Or ou Copa Star para casa?",
      a: 'Sim. Altas hospitalares com equipe adequada ao quadro do paciente, incluindo UTI móvel quando o caso pede. Coordenamos a saída com a equipe do hospital.',
    },
    {
      q: 'Quanto custa uma ambulância particular em Copacabana?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. O valor final depende do percurso e equipamento. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Zona Sul', slug: 'zona-sul', highlight: 'Ipanema, Leblon, Botafogo, Flamengo' },
    { name: 'Barra e Recreio', slug: 'barra-recreio', highlight: '2 ambulâncias nos PAs Unimed' },
    { name: 'Centro', slug: 'centro', highlight: '10 a 20 minutos da base' },
  ],
  schema: {
    geo: { lat: -22.9711, lng: -43.1822 },
    areaServed: [{ name: 'Copacabana' }, { name: 'Leme' }],
  },
};

// ============================================================
// Z2 — Zona Sul
// ============================================================
const zonaSul: GeoRegion = {
  id: 'zona-sul',
  name: 'Zona Sul',
  slug: 'zona-sul',
  phase: 1,
  seo: {
    title: 'Ambulância Zona Sul RJ | Ipanema, Leblon, Botafogo, Flamengo | Savior',
    description:
      'Ambulância UTI 24h na Zona Sul do Rio. Ipanema, Leblon, Botafogo, Flamengo, Laranjeiras, Gávea. Transferências entre hospitais particulares. Médico e enfermeiro a bordo. (21) 3171-3030.',
    h1: 'Ambulância na Zona Sul em 20 a 40 minutos',
    canonical: 'https://www.savior.com.br/ambulancia-rj/zona-sul',
    keywords: [
      'ambulância zona sul rj',
      'ambulância ipanema',
      'ambulância leblon',
      'ambulância botafogo',
      'ambulância flamengo',
      'remoção inter-hospitalar zona sul',
    ],
  },
  hero: {
    eyebrow: 'Zona Sul · Central 24h',
    h1: 'Ambulância na Zona Sul em 20 a 40 minutos',
    h1Highlight: '20 a 40 minutos',
    subhead:
      'Ipanema, Leblon, Botafogo, Flamengo, Laranjeiras, Gávea e São Conrado. Equipe com médico e enfermeiro. Transferências entre os principais hospitais particulares do Rio.',
    waCampaign: 'geo-zona-sul',
    waMessage: 'Oi, preciso de ambulância na Zona Sul.',
  },
  tempos: [
    {
      region: 'Flamengo e Botafogo',
      time: '20 a 25 min',
      route: 'Da base via Aterro do Flamengo',
      highlight: true,
    },
    {
      region: 'Laranjeiras e Cosme Velho',
      time: '20 a 30 min',
      route: 'Via Túnel Santa Bárbara ou Aterro',
    },
    {
      region: 'Ipanema e Leblon',
      time: '30 a 40 min',
      route: 'Via Aterro e Túnel Rebouças',
    },
    {
      region: 'Gávea e São Conrado',
      time: '30 a 45 min',
      route: 'Via Lagoa ou Auto-Estrada Lagoa-Barra',
    },
  ],
  hospitals: [
    {
      name: 'Samaritano Botafogo',
      initials: 'SB',
      network: "Rede D'Or",
      detail: 'Rua Bambina, 98 · Botafogo · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Pró-Cardíaco',
      initials: 'PC',
      network: 'Particular',
      detail: 'Rua General Polidoro, 192 · Botafogo · Referência em cardiologia',
      tag: 'Cardiologia',
      color: { bg: '#7B0000', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Santa Lúcia',
      initials: 'SL',
      network: 'Particular',
      detail: 'Rua Fonte da Saudade, 282 · Lagoa · Maternidade e cirurgia geral',
      tag: 'Maternidade',
      color: { bg: '#1A5276', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Adventista Silvestre',
      initials: 'AS',
      network: 'Adventista',
      detail: 'Rua Silvestre, 143 · Cosme Velho · Oncologia e cirurgia',
      tag: 'Oncologia',
      color: { bg: '#1E6B3C', text: '#FFFFFF' },
    },
    {
      name: 'Clínica São Vicente da Gávea',
      initials: 'SV',
      network: "Rede D'Or",
      detail: 'Rua João Borges, 204 · Gávea · Referência cirúrgica',
      tag: 'Cirurgia',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'Casa de Saúde São José',
      initials: 'SJ',
      network: 'Rede Santa Catarina',
      detail: 'Rua Macedo Sobrinho, 21 · Humaitá · Desde 1923',
      tag: 'Tradicional',
      color: { bg: '#1A5632', text: '#FFFFFF' },
    },
    {
      name: 'Perinatal Laranjeiras',
      initials: 'PL',
      network: 'Particular',
      detail: 'Rua das Laranjeiras, 374 · Laranjeiras · Maternidade de referência',
      tag: 'Maternidade',
      color: { bg: '#6C3483', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Federal da Lagoa',
      initials: 'FL',
      network: 'SUS',
      detail: 'Rua Jardim Botânico, 501 · Lagoa · Ortopedia e neurologia',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Federal de Ipanema',
      initials: 'FI',
      network: 'SUS',
      detail: 'Rua Antônio Parreiras, 67 · Ipanema · Cirurgia bariátrica e urologia',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Quali Ipanema',
      initials: 'QI',
      network: 'Particular',
      detail: 'Rua Visconde de Pirajá, 547 · Ipanema · 62 leitos · Emergência 24h',
      tag: 'Emergência 24h',
      color: { bg: '#1B4F72', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Ipanema Care',
      initials: 'IC',
      network: 'Particular',
      detail: 'Ipanema · Clínica médica e internação',
      tag: 'Internação',
      color: { bg: '#154360', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Rio Laranjeiras',
      initials: 'RL',
      network: 'Particular',
      detail: 'Laranjeiras · Clínica médica geral',
      tag: 'Clínica Médica',
      color: { bg: '#0E3D6E', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Casa Rio Botafogo',
      initials: 'CR',
      network: 'Particular',
      detail: 'Botafogo · Internação e cirurgia ambulatorial',
      tag: 'Cirurgia',
      color: { bg: '#1A3C5E', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Municipal Rocha Maia',
      initials: 'RM',
      network: 'Municipal',
      detail: 'Rua General Severiano, 91 · Botafogo · Emergência pública',
      tag: 'Municipal',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: "Hospital Glória D'Or",
      initials: 'GD',
      network: "Rede D'Or",
      detail: 'Flamengo · Clínica médica e internação',
      tag: 'Internação',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'COT Flamengo',
      initials: 'CF',
      network: 'Particular',
      detail: 'Rua Marques de Abrantes · Flamengo · Ortopedia e traumatologia',
      tag: 'Ortopedia',
      color: { bg: '#1C4E80', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Transferência inter-hospitalar',
      desc: 'Samaritano para Pró-Cardíaco, Santa Lúcia para qualquer UTI. Tudo coordenado pela nossa central.',
    },
    {
      title: 'Remoção programada',
      desc: 'Consultas, exames, quimioterapia. Agendamento no horário que você escolher.',
    },
    {
      title: 'Alta hospitalar',
      desc: 'Levamos o paciente do hospital para casa com segurança e conforto.',
    },
  ],
  feature: {
    label: 'A região com mais transferências entre hospitais particulares do Rio',
    h2: 'A região com mais transferências entre hospitais particulares do Rio',
    h2Highlight: 'transferências entre hospitais particulares',
    paragraphs: [
      'A Zona Sul concentra a maior densidade de hospitais particulares de alta complexidade da cidade. Samaritano, Pró-Cardíaco, Santa Lúcia, Perinatal, São Vicente: quando um paciente precisa ser transferido de um para outro, a Savior é chamada.',
      'Nossa central coordena a saída de um hospital e a chegada no destino simultaneamente. A equipe de recepção já está avisada quando a ambulância chega.',
    ],
    callout: {
      title: 'Coordenação em tempo real',
      body: 'Enquanto a ambulância está a caminho, nossa central já está em contato com a equipe do hospital de destino. Sem espera na chegada, sem surpresa na recepção.',
    },
    stats: [
      { value: '16', desc: 'Hospitais atendidos na Zona Sul' },
      { value: '46 anos', desc: 'De experiência em remoções na região' },
      { value: '24h', desc: 'Central ativa todos os dias do ano' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Ana P.',
        text: 'Precisei transferir minha mãe do Samaritano para o Pró-Cardíaco às 2h da manhã. A equipe da Savior chegou em 25 minutos e toda a coordenação com os hospitais foi feita por eles. Profissionalismo total.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Carlos M.',
        text: 'Atendimento em Botafogo rápido e tranquilizador. Equipe muito bem treinada, médico e técnico preparados para qualquer situação. Recomendo sem hesitar.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Qual o tempo de chegada na Zona Sul?',
      a: 'Entre 20 e 40 minutos dependendo do bairro. Flamengo e Botafogo ficam entre 20 e 25 minutos da base. Ipanema e Leblon entre 30 e 40 minutos. A central informa a estimativa exata no momento do chamado.',
    },
    {
      q: 'Vocês fazem transferências entre os hospitais da Zona Sul?',
      a: 'Sim. Transferências inter-hospitalares são uma das principais solicitações na região. Nossa central coordena a saída e a chegada ao mesmo tempo, sem espera no hospital de destino.',
    },
    {
      q: 'Atendem em Gávea e São Conrado?',
      a: 'Sim. O tempo de chegada fica entre 30 e 45 minutos via Lagoa ou pela Auto-Estrada Lagoa-Barra, dependendo do trânsito.',
    },
    {
      q: 'Quanto custa a ambulância na Zona Sul?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. O valor depende do percurso e do equipamento. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Copacabana', slug: 'copacabana', highlight: 'Leme e bairros históricos da orla' },
    { name: 'Barra e Recreio', slug: 'barra-recreio', highlight: 'Condomínios e hospitais da Barra' },
    { name: 'Centro', slug: 'centro', highlight: '10 a 20 minutos da base' },
  ],
  schema: {
    geo: { lat: -22.9519, lng: -43.1857 },
    areaServed: [
      { name: 'Ipanema' },
      { name: 'Leblon' },
      { name: 'Botafogo' },
      { name: 'Flamengo' },
      { name: 'Laranjeiras' },
      { name: 'Cosme Velho' },
      { name: 'Gávea' },
      { name: 'São Conrado' },
    ],
  },
};

// ============================================================
// Z3 — Barra e Recreio
// ============================================================
const barraReCreio: GeoRegion = {
  id: 'barra-recreio',
  name: 'Barra e Recreio',
  slug: 'barra-recreio',
  phase: 1,
  seo: {
    title: 'Ambulância Barra da Tijuca e Recreio | UTI 24h | Unimed PA | Savior',
    description:
      'Ambulância UTI 24h na Barra da Tijuca e Recreio dos Bandeirantes. 2 ambulâncias nos PAs Unimed. Condomínios com portaria: ligamos durante o deslocamento. (21) 3171-3030.',
    h1: 'Ambulância na Barra e Recreio. Com 2 ambulâncias nos PAs Unimed.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/barra-recreio',
    keywords: [
      'ambulância barra da tijuca',
      'ambulância recreio dos bandeirantes',
      'ambulância particular barra',
      'ambulância condomínio barra',
      'ambulância unimed barra',
    ],
  },
  hero: {
    eyebrow: 'Barra e Recreio · Central 24h',
    h1: 'Ambulância na Barra e Recreio. Com 2 ambulâncias nos PAs Unimed.',
    h1Highlight: '2 ambulâncias nos PAs Unimed',
    subhead:
      'Com ambulâncias já posicionadas nos PAs Unimed da Barra, o tempo de resposta é menor. Condomínio com portaria? Ligamos para liberar a entrada durante o deslocamento.',
    waCampaign: 'geo-barra-recreio',
    waMessage: 'Oi, preciso de ambulância na Barra ou Recreio.',
  },
  tempos: [
    {
      region: 'PA Unimed Barra',
      time: 'Imediato',
      route: 'Ambulância já posicionada na Barra',
      highlight: true,
    },
    {
      region: 'Jacarepaguá e Freguesia',
      time: '30 a 45 min',
      route: 'Via Av. das Américas ou Estrada dos Bandeirantes',
    },
    {
      region: 'Barra da Tijuca',
      time: '35 a 50 min',
      route: 'Da base via Linha Amarela ou Túnel da Grota Funda',
    },
    {
      region: 'Recreio e Vargens',
      time: '45 a 60 min',
      route: 'Via Av. das Américas até o Recreio',
    },
  ],
  hospitals: [
    {
      name: "Barra D'Or",
      initials: 'BD',
      network: "Rede D'Or",
      detail: 'Av. Jorge Curi, 550 · Barra · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Americas Medical City',
      initials: 'AM',
      network: 'Americas Serviços Médicos',
      detail: 'Av. Jorge Curi, 550 · Barra · Oncologia e cardiologia',
      tag: 'Oncologia',
      color: { bg: '#B71C1C', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Vitória',
      initials: 'HV',
      network: 'Amil',
      detail: 'Av. Ayrton Senna, 2000 · Barra · Emergência e cirurgia',
      tag: 'Emergência',
      color: { bg: '#1565C0', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Rio Mar Barra',
      initials: 'RB',
      network: 'Particular',
      detail: 'Barra da Tijuca · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
    },
    {
      name: 'Perinatal Barra',
      initials: 'PB',
      network: 'Particular',
      detail: 'Barra da Tijuca · Maternidade de referência',
      tag: 'Maternidade',
      color: { bg: '#6C3483', text: '#FFFFFF' },
    },
    {
      name: 'Samaritano Barra',
      initials: 'SA',
      network: "Rede D'Or",
      detail: 'Barra · Clínica médica e internação',
      tag: 'Internação',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'Hospital Lourenço Jorge',
      initials: 'LJ',
      network: 'SUS',
      detail: 'Av. Ayrton Senna, 2000 · Barra · Emergência pública',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: "Oncologia D'Or Barra",
      initials: 'OD',
      network: "Rede D'Or",
      detail: 'Barra da Tijuca · Tratamento oncológico',
      tag: 'Oncologia',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'Barra Day Hospital',
      initials: 'DH',
      network: 'Particular',
      detail: 'Barra da Tijuca · Cirurgia ambulatorial e procedimentos',
      tag: 'Day Hospital',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Acesso a condomínios',
      desc: 'Ligamos para a portaria durante o deslocamento para garantir entrada imediata quando a equipe chegar.',
    },
    {
      title: 'Remoção programada',
      desc: 'Consultas, exames, quimioterapia. Agendamento no horário que você escolher.',
    },
    {
      title: 'Transferência inter-hospitalar',
      desc: "Barra D'Or, Americas Medical City, Vitória: coordenamos a saída e a chegada.",
    },
  ],
  feature: {
    label: 'Barra e condomínios: acesso sem demora',
    h2: 'Condomínio com portaria? Ligamos durante o deslocamento para liberar a entrada.',
    h2Highlight: 'Ligamos durante o deslocamento para liberar a entrada',
    paragraphs: [
      'A Barra da Tijuca tem uma das maiores densidades de condomínios fechados do Rio. Portaria, interfone, cancela e registro de placa fazem parte da rotina de qualquer morador. Em emergência, isso pode custar minutos.',
      'Nossa central liga para a portaria assim que a ambulância sai da base. Quando a equipe chega, a entrada já está liberada. Informe o nome do condomínio no chamado e a gente cuida do resto.',
    ],
    callout: {
      title: 'PAs Unimed na Barra',
      body: 'Duas ambulâncias ficam posicionadas nos Pronto-Atendimentos Unimed da Barra, reduzindo o tempo de resposta para moradores da região. Quando o chamado é próximo, a ambulância pode já estar no bairro.',
    },
    stats: [
      { value: '2', desc: 'Ambulâncias nos PAs Unimed da Barra' },
      { value: '46 anos', desc: 'Atendendo condomínios no Rio de Janeiro' },
      { value: '24h', desc: 'Central ativa, inclusive de madrugada' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Fernanda R.',
        text: 'Minha mãe passou mal no condomínio às 3h da manhã. A central ligou para a portaria antes da ambulância chegar e não teve nenhum atraso na entrada. Equipe muito preparada.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Paulo T.',
        text: 'Precisei de remoção para o Americas Medical City. A ambulância chegou em tempo excelente para a Barra e a equipe foi muito profissional durante todo o atendimento.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo leva a ambulância para chegar na Barra da Tijuca?',
      a: 'Com ambulâncias posicionadas nos PAs Unimed da Barra, o tempo pode ser imediato na região próxima. Da base em São Cristóvão, o tempo é de 35 a 50 minutos. A central informa a estimativa exata no chamado.',
    },
    {
      q: 'A ambulância consegue entrar em condomínio fechado?',
      a: 'Sim. Nossa central liga para a portaria durante o deslocamento para liberar a entrada antes da equipe chegar. Informe o nome do condomínio e o número do apartamento no chamado.',
    },
    {
      q: 'Atendem no Recreio dos Bandeirantes e nas Vargens?',
      a: 'Sim. O tempo de chegada é de 45 a 60 minutos via Av. das Américas. A central confirma a estimativa real no momento do chamado.',
    },
    {
      q: 'Quanto custa a ambulância na Barra?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. O valor depende do percurso e equipamento. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Zona Oeste', slug: 'zona-oeste', highlight: 'Campo Grande, Bangu, Santa Cruz' },
    { name: 'Zona Sul', slug: 'zona-sul', highlight: 'Ipanema, Leblon, Botafogo, Flamengo' },
    { name: 'Copacabana', slug: 'copacabana', highlight: 'Leme e orla histórica' },
  ],
  schema: {
    geo: { lat: -23.0003, lng: -43.3651 },
    areaServed: [
      { name: 'Barra da Tijuca' },
      { name: 'Recreio dos Bandeirantes' },
      { name: 'Jacarepaguá' },
      { name: 'Freguesia' },
      { name: 'Vargem Grande' },
      { name: 'Vargem Pequena' },
    ],
  },
};

// ============================================================
// Z6 — Niterói e São Gonçalo
// ============================================================
const niteroi: GeoRegion = {
  id: 'niteroi',
  name: 'Niterói e São Gonçalo',
  slug: 'niteroi',
  phase: 1,
  seo: {
    title: 'Ambulância Particular Niterói e São Gonçalo | UTI 24h | Savior',
    description:
      'Ambulância UTI 24h em Niterói e São Gonçalo. Monitoramento da Ponte Rio-Niterói em tempo real. CHN, Niterói D\'Or, Hospital Icaraí. Médico e enfermeiro a bordo. (21) 3171-3030.',
    h1: 'Ambulância em Niterói e São Gonçalo. UTI completa, 24 horas.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/niteroi',
    keywords: [
      'ambulância niterói',
      'ambulância são gonçalo',
      'ambulância particular niterói',
      'ambulância uti niterói',
      'remoção niterói rio',
    ],
  },
  hero: {
    eyebrow: 'Niterói e São Gonçalo · Central 24h',
    h1: 'Ambulância em Niterói e São Gonçalo. UTI completa, 24 horas.',
    h1Highlight: 'UTI completa, 24 horas',
    subhead:
      'Monitoramos o trânsito na Ponte Rio-Niterói em tempo real e escolhemos a rota mais rápida em cada chamado. Médico e enfermeiro a bordo. CHN, Niterói D\'Or e toda a rede hospitalar atendidos.',
    waCampaign: 'geo-niteroi',
    waMessage: 'Oi, preciso de ambulância em Niterói ou São Gonçalo.',
  },
  tempos: [
    {
      region: 'Centro e Icaraí',
      time: '25 a 35 min',
      route: 'Via Ponte Rio-Niterói monitorada',
      highlight: true,
    },
    {
      region: 'Santa Rosa, Fonseca e Barreto',
      time: '30 a 40 min',
      route: 'Via Ponte e vias internas de Niterói',
    },
    {
      region: 'São Gonçalo',
      time: '35 a 50 min',
      route: 'Via Ponte e BR-101 ou Niterói',
    },
  ],
  hospitals: [
    {
      name: 'CHN — Centro Hospitalar de Niterói',
      initials: 'CH',
      network: 'Particular',
      detail: 'Rua Dr. Silvio Henrique Braune, 90 · Centro · Quaternário · Transplantes',
      tag: 'Quaternário',
      color: { bg: '#1A237E', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: "Niterói D'Or",
      initials: 'ND',
      network: "Rede D'Or",
      detail: 'Rua São João, 82 · Fonseca · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital Icaraí',
      initials: 'HI',
      network: 'Particular',
      detail: 'Rua Dr. Celestino, 100 · Icaraí · Clínica médica e internação',
      tag: 'Internação',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
    },
    {
      name: 'São Lucas Niterói',
      initials: 'SN',
      network: 'Particular',
      detail: 'Niterói · Cirurgia geral e especialidades',
      tag: 'Cirurgia',
      color: { bg: '#0B2540', text: '#1FD29A' },
    },
    {
      name: 'Hospital do Ingá',
      initials: 'HG',
      network: 'SUS / Municipal',
      detail: 'Niterói · Emergência pública',
      tag: 'Municipal',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital de Clínicas Alameda',
      initials: 'CA',
      network: 'Particular',
      detail: 'Niterói · Clínica médica e cirurgia ambulatorial',
      tag: 'Clínica Médica',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
    {
      name: 'HCSG — Hospital Central de São Gonçalo',
      initials: 'HG',
      network: 'SUS',
      detail: 'São Gonçalo · Emergência pública e trauma',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Intermédica São Gonçalo',
      initials: 'IS',
      network: 'Intermédica',
      detail: 'São Gonçalo · Clínica médica e pronto-atendimento',
      tag: 'PA',
      color: { bg: '#1565C0', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Leste Fluminense',
      initials: 'LF',
      network: 'Unimed',
      detail: 'São Gonçalo · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#1B5E20', text: '#FFFFFF' },
    },
    {
      name: 'Hospital do Coração de São Gonçalo',
      initials: 'HC',
      network: 'Particular',
      detail: 'São Gonçalo · Cardiologia e hemodinâmica',
      tag: 'Cardiologia',
      color: { bg: '#7B0000', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Travessia monitorada',
      desc: 'Monitoramos o trânsito na Ponte Rio-Niterói em tempo real para escolher a rota mais rápida.',
    },
    {
      title: 'Transferência entre estados',
      desc: 'Niterói para Rio ou para São Paulo com equipe médica e UTI completa a bordo.',
    },
    {
      title: 'Alta hospitalar',
      desc: 'Levamos o paciente do hospital para casa em Niterói ou São Gonçalo com segurança.',
    },
  ],
  feature: {
    label: 'A travessia da ponte como fator crítico',
    h2: 'Monitoramos a Ponte Rio-Niterói em tempo real. A rota certa pode fazer diferença.',
    h2Highlight: 'A rota certa pode fazer diferença',
    paragraphs: [
      'A Ponte Rio-Niterói tem 13,3 km e o trânsito pode variar muito dependendo do horário e da direção. Nossa central monitora as condições em tempo real e define a rota antes de a ambulância sair da base.',
      'Em horário de pico ou eventos especiais, rotas alternativas pela Linha Vermelha e Av. Brasil podem ser mais rápidas. Já sabemos qual é a melhor opção quando o chamado chega.',
    ],
    callout: {
      title: 'CHN: referência quaternária em Niterói',
      body: 'O Centro Hospitalar de Niterói é referência em transplantes e alta complexidade no município. Nossa equipe conhece o fluxo de entrada e os protocolos de recepção para transferências urgentes.',
    },
    stats: [
      { value: '25 min', desc: 'Tempo médio para chegar ao Centro de Niterói' },
      { value: '10', desc: 'Hospitais atendidos em Niterói e São Gonçalo' },
      { value: '24h', desc: 'Central ativa monitorando trânsito e rotas' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Luiza F.',
        text: 'Meu pai precisou ser transferido do CHN para um hospital no Rio às 23h. A equipe da Savior chegou em Niterói em menos de 35 minutos e a travessia da ponte foi feita sem nenhum atraso. Muito obrigada.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Marcio V.',
        text: 'Atendimento em São Gonçalo ágil e profissional. Equipe tranquilizou a família desde o primeiro contato. Recomendo para quem precisa de serviço sério.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo a ambulância leva para chegar em Niterói?',
      a: 'Entre 25 e 35 minutos para o Centro e Icaraí. A central monitora o trânsito na Ponte Rio-Niterói em tempo real e informa a estimativa exata no momento do chamado.',
    },
    {
      q: 'E em São Gonçalo?',
      a: 'O tempo varia entre 35 e 50 minutos dependendo do bairro e das condições de tráfego. A central calcula a rota mais rápida, que pode ser via Niterói ou diretamente pela BR-101.',
    },
    {
      q: 'Vocês fazem transferências de Niterói para o Rio?',
      a: 'Sim. Transferências de Niterói para qualquer hospital do Rio fazem parte da nossa rotina. A central coordena saída e chegada simultaneamente.',
    },
    {
      q: 'Quanto custa a ambulância em Niterói?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. O valor inclui a travessia da ponte. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Região Oceânica', slug: 'regiao-oceanica', highlight: 'Piratininga, Itaipu, Itacoatiara' },
    { name: 'Zona Norte', slug: 'zona-norte', highlight: 'Tijuca, Méier, Ilha do Governador' },
    { name: 'Centro', slug: 'centro', highlight: '10 a 20 minutos da base' },
  ],
  schema: {
    geo: { lat: -22.8833, lng: -43.1036 },
    areaServed: [
      { name: 'Niterói' },
      { name: 'Icaraí' },
      { name: 'Fonseca' },
      { name: 'Santa Rosa' },
      { name: 'Barreto' },
      { name: 'São Gonçalo' },
    ],
  },
};

// ============================================================
// Z11 — Remoção Interestadual
// ============================================================
const interestadual: GeoRegion = {
  id: 'interestadual',
  name: 'Remoção Interestadual',
  slug: 'interestadual',
  phase: 1,
  seo: {
    title: 'Remoção Interestadual | Ambulância Rio e São Paulo | Base Própria | Savior',
    description:
      'Remoção de paciente entre Rio de Janeiro e São Paulo. Base própria nas duas cidades. UTI completa, médico e enfermeiro a bordo. ~430 km, 6 a 8h via Dutra. (21) 3171-3030.',
    h1: 'Remoção de paciente entre Rio e São Paulo. Base própria nas duas pontas.',
    canonical: 'https://www.savior.com.br/remocao-interestadual',
    keywords: [
      'remoção interestadual ambulância',
      'ambulância rio são paulo',
      'remoção de paciente rio sp',
      'ambulância dutra',
      'transferência inter-hospitalar interestadual',
    ],
  },
  hero: {
    eyebrow: 'Rio de Janeiro e São Paulo · Base própria nas duas cidades',
    h1: 'Remoção de paciente entre Rio e São Paulo. Base própria nas duas pontas.',
    h1Highlight: 'Base própria nas duas pontas',
    subhead:
      'Você contrata uma vez e é atendido pela mesma empresa na saída e na chegada. Equipe médica a bordo durante todo o trajeto de aproximadamente 430 km via Dutra.',
    waCampaign: 'geo-interestadual',
    waMessage: 'Oi, preciso de orçamento para remoção interestadual Rio-São Paulo.',
  },
  tempos: [
    {
      region: 'Avaliação do paciente',
      time: 'Passo 1',
      route: 'Médico avalia o quadro e define o equipamento necessário antes da saída',
    },
    {
      region: 'Planejamento da rota',
      time: 'Passo 2',
      route: 'Aproximadamente 430 km via Dutra, tempo estimado de 6 a 8 horas dependendo do tráfego',
    },
    {
      region: 'Remoção com equipe médica',
      time: 'Passo 3',
      route: 'Médico e enfermeiro a bordo durante todo o trajeto. Monitorização contínua do paciente',
    },
    {
      region: 'Recepção coordenada',
      time: 'Passo 4',
      route: 'Nossa central já contata o hospital de destino antes da chegada',
    },
  ],
  hospitals: [
    {
      name: 'Hospital de Apoio em Resende',
      initials: 'RV',
      network: 'Suporte de rota',
      detail: 'Resende · Ponto de apoio no trajeto Rio-São Paulo',
      tag: 'Apoio de Rota',
      color: { bg: '#37474F', text: '#FFFFFF' },
    },
    {
      name: 'Hospital de Apoio em Volta Redonda',
      initials: 'VR',
      network: 'Suporte de rota',
      detail: 'Volta Redonda · Ponto de apoio no trajeto Rio-São Paulo',
      tag: 'Apoio de Rota',
      color: { bg: '#37474F', text: '#FFFFFF' },
    },
    {
      name: 'Hospital de Apoio em Taubaté',
      initials: 'TB',
      network: 'Suporte de rota',
      detail: 'Taubaté · Ponto de apoio na entrada de São Paulo',
      tag: 'Apoio de Rota',
      color: { bg: '#37474F', text: '#FFFFFF' },
    },
    {
      name: 'Hospital de Apoio em São José dos Campos',
      initials: 'SJ',
      network: 'Suporte de rota',
      detail: 'São José dos Campos · Ponto de apoio antes de São Paulo capital',
      tag: 'Apoio de Rota',
      color: { bg: '#37474F', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Remoção interestadual',
      desc: 'Rio de Janeiro para São Paulo, ou São Paulo para Rio. Mesma empresa nas duas pontas.',
      emphasis: true,
    },
    {
      title: 'UTI móvel completa',
      desc: 'Ventilador mecânico, monitor multiparamétrico, desfibrilador e medicamentos a bordo.',
    },
    {
      title: 'Coordenação de chegada',
      desc: 'Nossa central contata o hospital de destino antes da ambulância chegar. Sem espera na recepção.',
    },
    {
      title: 'Suporte médico contínuo',
      desc: 'Médico e enfermeiro a bordo durante todo o trajeto. Monitorização do paciente sem interrupção.',
    },
  ],
  feature: {
    label: 'A única empresa com base própria nas duas cidades',
    h2: 'Você contrata uma vez e é atendido pela mesma empresa na saída e na chegada.',
    h2Highlight: 'mesma empresa na saída e na chegada',
    paragraphs: [
      'Remoções interestaduais costumam envolver duas empresas diferentes: uma no Rio, outra em São Paulo. Isso significa dois contratos, dois briefings, dois padrões de atendimento e comunicação entre equipes que nunca trabalharam juntas.',
      'A Savior tem base de atendimento no Rio de Janeiro desde 1979 e em São Paulo. Você faz um único chamado, fala com uma central e recebe uma equipe com o mesmo padrão nos dois lados.',
    ],
    callout: {
      title: 'Planejamento antes da saída',
      body: 'Antes de qualquer remoção interestadual, nosso médico avalia o quadro do paciente para definir o equipamento necessário. Casos estáveis podem ir em ambulância básica. UTI é indicada quando há risco durante o trajeto.',
    },
    stats: [
      { value: '430 km', desc: 'Distância aproximada Rio-SP via Dutra' },
      { value: '6 a 8h', desc: 'Tempo estimado de trajeto dependendo do tráfego' },
      { value: '46 anos', desc: 'Experiência em remoções de longa distância' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Renata C.',
        text: 'Meu pai precisou ser removido do Rio para São Paulo após uma cirurgia cardíaca. A equipe da Savior cuidou de tudo: desde a avaliação antes da saída até a entrega no hospital de destino. Profissionalismo do início ao fim.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Eduardo B.',
        text: 'Remoção de São Paulo para o Rio em UTI móvel. Comunicação impecável, equipe preparada e o hospital de destino já estava esperando quando chegamos. Recomendo.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo leva a remoção Rio-São Paulo?',
      a: 'Aproximadamente 6 a 8 horas pela Via Dutra, dependendo do tráfego. Antes da saída, nossa central verifica as condições da via e estima o tempo com precisão.',
    },
    {
      q: 'A ambulância tem médico durante todo o trajeto?',
      a: 'Sim. Médico e enfermeiro permanecem a bordo do início ao fim. O paciente fica em monitorização contínua durante as 6 a 8 horas de deslocamento.',
    },
    {
      q: 'O que acontece se o paciente precisar de atenção no meio do caminho?',
      a: 'A equipe médica a bordo trata a situação imediatamente. Temos pontos de apoio hospitalar mapeados em Volta Redonda, Resende, Taubaté e São José dos Campos caso seja necessário parar.',
    },
    {
      q: 'Como faço para pedir orçamento?',
      a: 'Entre em contato pelo WhatsApp ou pelo telefone (21) 3171-3030. Precisamos saber: diagnóstico, condição atual do paciente, cidade de origem e hospital de destino. Passamos o orçamento e explicamos o que está incluído antes de qualquer compromisso.',
    },
  ],
  nearbyRegions: [],
  schema: {
    geo: { lat: -22.9068, lng: -43.1729 },
    areaServed: [
      { name: 'Rio de Janeiro' },
      { name: 'São Paulo' },
      { name: 'Via Dutra' },
    ],
  },
};

// ============================================================
// Exportações principais
// ============================================================
export const GEO_REGIONS: GeoRegion[] = [
  copacabana,
  zonaSul,
  barraReCreio,
  niteroi,
  interestadual,
];

export function getRegion(id: string): GeoRegion {
  const region = GEO_REGIONS.find(r => r.id === id);
  if (!region) throw new Error(`Region "${id}" not found in geo-regions data`);
  return region;
}

export function getRegionsByPhase(phase: 1 | 2 | 3): GeoRegion[] {
  return GEO_REGIONS.filter(r => r.phase === phase);
}
