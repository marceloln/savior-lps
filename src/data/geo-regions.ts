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
// Z4 — Zona Oeste
// ============================================================
const zonaOeste: GeoRegion = {
  id: 'zona-oeste',
  name: 'Zona Oeste',
  slug: 'zona-oeste',
  phase: 2,
  seo: {
    title: "Ambulância Zona Oeste RJ | Jacarepaguá, Campo Grande, Bangu | Savior",
    description:
      "Ambulância UTI na Zona Oeste: Jacarepaguá, Taquara, Bangu, Campo Grande. Remoções Rios D'Or, Oeste D'Or, Hospital de Jacarepaguá. Pix e cartão. (21) 3171-3030.",
    h1: 'Ambulância na Zona Oeste. Jacarepaguá, Campo Grande, Bangu e toda a região.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/zona-oeste',
    keywords: [
      'ambulância zona oeste rj',
      'ambulância jacarepaguá',
      'ambulância campo grande',
      'ambulância bangu',
      'remoção zona oeste rio de janeiro',
    ],
  },
  hero: {
    eyebrow: 'Zona Oeste · Central 24h',
    h1: 'Ambulância na Zona Oeste. Jacarepaguá, Campo Grande, Bangu e toda a região.',
    h1Highlight: 'Jacarepaguá, Campo Grande, Bangu',
    subhead:
      'Da Freguesia à Santa Cruz, cobrimos toda a extensão da Zona Oeste. Médico e enfermeiro a bordo. Remoções para Rios D\'Or, Oeste D\'Or e hospitais da região.',
    waCampaign: 'geo-zona-oeste',
    waMessage: 'Oi, preciso de ambulância na Zona Oeste.',
  },
  tempos: [
    {
      region: 'Jacarepaguá, Freguesia e Taquara',
      time: '25 a 40 min',
      route: 'Da base via Linha Amarela ou Estrada dos Bandeirantes',
      highlight: true,
    },
    {
      region: 'Bangu e Padre Miguel',
      time: '35 a 50 min',
      route: 'Via Av. Brasil ou Linha Amarela',
    },
    {
      region: 'Campo Grande',
      time: '45 a 65 min',
      route: 'Via Av. Brasil sentido oeste',
    },
    {
      region: 'Santa Cruz e Sepetiba',
      time: '55 a 75 min',
      route: 'Via Av. Brasil até o extremo oeste',
    },
  ],
  hospitals: [
    {
      name: "Hospital Rios D'Or",
      initials: 'RD',
      network: "Rede D'Or",
      detail: 'Jacarepaguá · Alta complexidade · JCI · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital de Jacarepaguá (HCJ)',
      initials: 'HJ',
      network: 'Particular',
      detail: 'Jacarepaguá · Clínica médica e cirurgia',
      tag: 'Cirurgia',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
    },
    {
      name: "Hospital Oeste D'Or",
      initials: 'OD',
      network: "Rede D'Or",
      detail: 'Campo Grande · ONA 3 · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital Bangu 24h',
      initials: 'HB',
      network: "Rede D'Or",
      detail: 'Bangu · Emergência 24h',
      tag: 'Emergência 24h',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital São Lourenço',
      initials: 'SL',
      network: 'Particular',
      detail: 'Bangu · Internação e clínica médica',
      tag: 'Internação',
      color: { bg: '#1A5632', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Di Camp',
      initials: 'DC',
      network: 'Particular',
      detail: 'Campo Grande · Atendimento geral',
      tag: 'Clínica Médica',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Memorial Santa Cruz',
      initials: 'MS',
      network: 'Particular',
      detail: 'Santa Cruz · Referência da região',
      tag: 'Internação',
      color: { bg: '#1B4F72', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Transporte programado recorrente',
      desc: 'Diálise, quimioterapia, consultas. Agendamento fixo para quem precisa ir ao hospital toda semana.',
      emphasis: true,
    },
    {
      title: 'Remoção para hospitais de alta complexidade',
      desc: "Campo Grande e Santa Cruz ficam longe dos grandes centros. Fazemos a rota até Rios D'Or, Oeste D'Or ou hospitais da capital.",
    },
    {
      title: 'Alta hospitalar',
      desc: 'Levamos o paciente do hospital para casa com segurança e conforto.',
    },
  ],
  feature: {
    label: 'A distância dos grandes hospitais é real aqui',
    h2: 'Campo Grande e Santa Cruz ficam longe de hospitais de alta complexidade. A rota mais comum é para a capital.',
    h2Highlight: 'A rota mais comum é para a capital',
    paragraphs: [
      'Quem mora no extremo da Zona Oeste sabe: quando o caso é grave, o hospital mais indicado pode estar a mais de uma hora. Campo Grande, Santa Cruz e Sepetiba dependem de remoção organizada para acessar unidades de alta complexidade.',
      'Nossa equipe conhece as rotas da Zona Oeste e dimensiona a ambulância certa para o tempo de percurso. Levamos tudo a bordo: equipamento, medicação e equipe treinada para manter o paciente estável durante o trajeto.',
    ],
    callout: {
      title: 'Transporte recorrente para quem mais precisa',
      body: "Moradores da Zona Oeste com diálise, quimioterapia ou consultas regulares em hospitais distantes podem contar com agendamento fixo. A Savior organiza a rota e o horário para você não depender de improvisar transporte toda semana.",
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo o Rio de janeiro inteiro' },
      { value: '24h', desc: 'Central ativa, inclusive de madrugada' },
      { value: 'UTI', desc: 'Ambulância completa para percursos longos' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Sônia R.',
        text: 'Minha mãe faz diálise três vezes por semana e mora em Campo Grande. A Savior organiza tudo: pontual, equipe atenciosa. Não precisamos mais nos preocupar com transporte.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Jorge A.',
        text: "Emergência em Bangu de madrugada. Chamei e em menos de 40 minutos estavam aqui. Levaram meu pai direto para o Oeste D'Or sem nenhum problema.",
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto custa a ambulância na Zona Oeste?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. O valor depende do percurso. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
    {
      q: 'Vocês fazem remoção de Campo Grande e Santa Cruz para hospitais no Rio?',
      a: "Sim. Essa é uma das solicitações mais comuns da Zona Oeste. Fazemos a rota para Rios D'Or, Oeste D'Or e qualquer hospital da capital com UTI completa a bordo.",
    },
    {
      q: 'Atendem 24 horas na Zona Oeste?',
      a: 'Sim. Central ativa 24 horas todos os dias do ano. De madrugada, aos fins de semana e feriados.',
    },
    {
      q: 'Que tipos de ambulância estão disponíveis?',
      a: 'Ambulância básica com técnico de enfermagem e ambulância UTI com médico e enfermeiro. O tipo é definido pelo quadro do paciente. Passamos a recomendação no WhatsApp antes da saída.',
    },
  ],
  nearbyRegions: [
    { name: 'Barra e Recreio', slug: 'barra-recreio', highlight: 'Condomínios e hospitais da Barra' },
    { name: 'Zona Norte', slug: 'zona-norte', highlight: 'Tijuca, Méier, São Cristóvão' },
    { name: 'Centro', slug: 'centro', highlight: '10 a 20 minutos da base' },
  ],
  schema: {
    geo: { lat: -22.9133, lng: -43.4017 },
    areaServed: [
      { name: 'Jacarepaguá' },
      { name: 'Freguesia' },
      { name: 'Taquara' },
      { name: 'Bangu' },
      { name: 'Padre Miguel' },
      { name: 'Campo Grande' },
      { name: 'Santa Cruz' },
      { name: 'Sepetiba' },
    ],
  },
};

// ============================================================
// Z5 — Zona Norte
// ============================================================
const zonaNorte: GeoRegion = {
  id: 'zona-norte',
  name: 'Zona Norte',
  slug: 'zona-norte',
  phase: 2,
  seo: {
    title: 'Ambulância Zona Norte RJ | Tijuca, Méier, Vila Isabel | Base Aqui | Savior',
    description:
      'Base própria em São Cristóvão: ambulância mais rápida da Zona Norte. Tijuca, Méier, Vila Isabel. Remoções Quinta D\'Or e Badim. (21) 3171-3030.',
    h1: 'Ambulância na Zona Norte em 10 a 25 minutos. Nossa base fica em São Cristóvão.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/zona-norte',
    keywords: [
      'ambulância zona norte rj',
      'ambulância tijuca',
      'ambulância méier',
      'ambulância vila isabel',
      'ambulância são cristóvão',
    ],
  },
  hero: {
    eyebrow: 'Zona Norte · Nossa base é aqui',
    h1: 'Ambulância na Zona Norte em 10 a 25 minutos. Nossa base fica em São Cristóvão.',
    h1Highlight: '10 a 25 minutos',
    subhead:
      "Nossa base fica em São Cristóvão, no coração da Zona Norte. Menores tempos de resposta da cidade para Tijuca, Maracanã, Méier e adjacências. Médico e enfermeiro a bordo.",
    waCampaign: 'geo-zona-norte',
    waMessage: 'Oi, preciso de ambulância na Zona Norte.',
  },
  tempos: [
    {
      region: 'São Cristóvão e Maracanã e Tijuca',
      time: '10 a 15 min',
      route: 'Base localizada em São Cristóvão',
      highlight: true,
    },
    {
      region: 'Vila Isabel, Grajaú e Andaraí',
      time: '15 a 20 min',
      route: 'Via Rua Haddock Lobo ou Av. Maracanã',
    },
    {
      region: 'Méier e Engenho Novo',
      time: '20 a 25 min',
      route: 'Via Radial Oeste ou Av. Suburbana',
    },
    {
      region: 'Penha e Olaria',
      time: '20 a 30 min',
      route: 'Via Linha Vermelha ou Av. Brasil',
    },
  ],
  hospitals: [
    {
      name: "Quinta D'Or",
      initials: 'QD',
      network: "Rede D'Or",
      detail: "São Cristóvão · Vizinho da nossa base · Alta complexidade · Emergência 24h",
      tag: 'Vizinho da Base',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital Badim',
      initials: 'HB',
      network: 'Particular',
      detail: 'Méier · Neurologia e neurocirurgia',
      tag: 'Neurologia',
      color: { bg: '#1A237E', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital São Vicente de Paulo',
      initials: 'SV',
      network: 'Particular',
      detail: 'Tijuca · Oncologia e transplantes',
      tag: 'Oncologia',
      color: { bg: '#1A5632', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Evangélico',
      initials: 'HE',
      network: 'Particular',
      detail: 'Zona Norte · Internação e cirurgia geral',
      tag: 'Internação',
      color: { bg: '#154360', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Israelita Albert Sabin',
      initials: 'AS',
      network: 'Particular',
      detail: 'Zona Norte · Clínica médica e cirurgia',
      tag: 'Cirurgia',
      color: { bg: '#1B4F72', text: '#FFFFFF' },
    },
    {
      name: "Hospital Norte D'Or",
      initials: 'ND',
      network: "Rede D'Or",
      detail: 'Cascadura · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital Memorial',
      initials: 'HM',
      network: 'Particular',
      detail: 'Engenho de Dentro · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Salgado Filho',
      initials: 'SF',
      network: 'SUS',
      detail: 'Méier · Emergência pública',
      tag: 'SUS',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'ProntoBaby Tijuca',
      initials: 'PB',
      network: 'Particular',
      detail: 'Tijuca · Pediatria e emergência infantil',
      tag: 'Pediatria',
      color: { bg: '#6C3483', text: '#FFFFFF' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto. Menores tempos da cidade para a Zona Norte.',
      emphasis: true,
    },
    {
      title: 'Remoção programada',
      desc: 'Consultas, exames, quimioterapia. Agendamento no horário que você escolher.',
    },
    {
      title: "Transferência para Quinta D'Or",
      desc: "Hospital de alta complexidade vizinho da nossa base. Coordenamos a chegada antes de sair.",
    },
    {
      title: 'Alta hospitalar',
      desc: 'Levamos o paciente do hospital para casa com segurança e conforto.',
    },
  ],
  feature: {
    label: 'Nossa base é aqui',
    h2: 'Menores tempos de resposta da cidade. Nossa base fica em São Cristóvão.',
    h2Highlight: 'Nossa base fica em São Cristóvão',
    paragraphs: [
      'A maioria das empresas de ambulância tem base no centro ou na Zona Sul. A Savior tem base própria em São Cristóvão, no coração da Zona Norte. Isso significa que, quando você liga, a ambulância já está perto.',
      'Em dias de jogo no Maracanã, o trânsito na Tijuca e em São Cristóvão pode ser intenso. Nossa central monitora a situação e define a rota antes de sair, evitando os principais bloqueios.',
    ],
    callout: {
      title: "Quinta D'Or a minutos da base",
      body: "O hospital de alta complexidade Quinta D'Or fica a poucos minutos da nossa base em São Cristóvão. Transferências para lá são feitas com tempo de chegada entre os menores da cidade.",
    },
    stats: [
      { value: '10 min', desc: "Tempo mínimo para São Cristóvão e Maracanã" },
      { value: '46 anos', desc: 'Atendendo o Rio de Janeiro' },
      { value: '24h', desc: 'Central ativa todos os dias do ano' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Tatiana M.',
        text: 'Chamei às 2h da manhã para meu pai em Tijuca. A ambulância chegou em 12 minutos. Equipe calma e muito preparada. A base em São Cristóvão faz toda a diferença.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Ricardo L.',
        text: 'Precisei transferir minha avó do Hospital Badim para o Méier. Rápido, eficiente e a equipe foi muito atenciosa com ela durante todo o trajeto.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo a ambulância leva para chegar na Tijuca e no Maracanã?',
      a: 'Entre 10 e 15 minutos da nossa base em São Cristóvão. É um dos menores tempos de resposta da cidade para essa região.',
    },
    {
      q: 'E em Méier e Engenho Novo?',
      a: 'Entre 20 e 25 minutos via Radial Oeste ou Av. Suburbana. A central informa a estimativa exata no momento do chamado.',
    },
    {
      q: "Vocês fazem remoções para a Quinta D'Or?",
      a: "Sim. O hospital fica vizinho da nossa base em São Cristóvão. Coordenamos a chegada simultaneamente com a saída da ambulância.",
    },
    {
      q: 'Quanto custa a ambulância na Zona Norte?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Centro', slug: 'centro', highlight: '10 a 20 minutos da base' },
    { name: 'Copacabana', slug: 'copacabana', highlight: 'Orla histórica e hospitais' },
    { name: 'Zona Oeste', slug: 'zona-oeste', highlight: 'Jacarepaguá, Bangu, Campo Grande' },
  ],
  schema: {
    geo: { lat: -22.8967, lng: -43.2256 },
    areaServed: [
      { name: 'São Cristóvão' },
      { name: 'Maracanã' },
      { name: 'Tijuca' },
      { name: 'Vila Isabel' },
      { name: 'Grajaú' },
      { name: 'Andaraí' },
      { name: 'Méier' },
      { name: 'Engenho Novo' },
      { name: 'Penha' },
      { name: 'Olaria' },
    ],
  },
};

// ============================================================
// Z7 — Região Oceânica
// ============================================================
const regiaoOceanica: GeoRegion = {
  id: 'regiao-oceanica',
  name: 'Região Oceânica',
  slug: 'regiao-oceanica',
  phase: 2,
  seo: {
    title: 'Ambulância Região Oceânica e Maricá | Itaipu, Piratininga | Savior',
    description:
      'Ambulância UTI na Região Oceânica de Niterói e Maricá. Piratininga, Itaipu, Itacoatiara, Engenho do Mato. Remoções para CHN e Rio. (21) 3171-3030.',
    h1: 'Ambulância na Região Oceânica e Maricá. Onde o hospital fica longe, nós chegamos.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/regiao-oceanica',
    keywords: [
      'ambulância região oceânica niterói',
      'ambulância maricá',
      'ambulância itaipu piratininga',
      'ambulância itacoatiara',
      'remoção região oceânica rio',
    ],
  },
  hero: {
    eyebrow: 'Região Oceânica · Central 24h',
    h1: 'Ambulância na Região Oceânica e Maricá. Onde o hospital fica longe, nós chegamos.',
    h1Highlight: 'nós chegamos',
    subhead:
      'Piratininga, Itaipu, Itacoatiara, Engenho do Mato e Maricá. A infraestrutura de saúde cresce mais devagar que a região. Quando é preciso ir ao hospital, a Savior organiza a rota.',
    waCampaign: 'geo-regiao-oceanica',
    waMessage: 'Oi, preciso de ambulância na Região Oceânica.',
  },
  tempos: [
    {
      region: 'Piratininga e Itaipu',
      time: '40 a 55 min',
      route: 'Da base via Ponte Rio-Niterói e vias litorâneas',
      highlight: true,
    },
    {
      region: 'Itacoatiara e Engenho do Mato',
      time: '45 a 60 min',
      route: 'Via Niterói e estrada para a Região Oceânica',
    },
    {
      region: 'Maricá',
      time: '55 a 75 min',
      route: 'Via Ponte Rio-Niterói e RJ-106',
    },
  ],
  hospitals: [
    {
      name: 'UPA Oceânica',
      initials: 'UO',
      network: 'Municipal',
      detail: 'Região Oceânica · Pronto-atendimento',
      tag: 'UPA',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Municipal Conde Modesto Leal',
      initials: 'ML',
      network: 'Municipal',
      detail: 'Maricá · Referência municipal',
      tag: 'Municipal',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
    },
    {
      name: "Hospital São Gonçalo D'Or",
      initials: 'GD',
      network: "Rede D'Or",
      detail: 'São Gonçalo · Alta complexidade',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'CHN — Centro Hospitalar de Niterói',
      initials: 'CH',
      network: 'Particular',
      detail: 'Niterói · Quaternário · Principal destino de remoções',
      tag: 'Quaternário',
      color: { bg: '#1A237E', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: "Niterói D'Or",
      initials: 'ND',
      network: "Rede D'Or",
      detail: 'Niterói · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'Emergência 24h',
      desc: 'Ambulância com médico e enfermeiro. Central atende em menos de 1 minuto.',
      emphasis: true,
    },
    {
      title: 'Transporte programado recorrente',
      desc: 'Diálise, quimioterapia, consultas regulares. Solução para quem precisa sair da região toda semana.',
      emphasis: true,
    },
    {
      title: 'Remoção para Niterói e Rio',
      desc: 'CHN, Niterói D\'Or ou hospitais do Rio. Coordenamos a chegada antes de sair.',
    },
    {
      title: 'Alta hospitalar',
      desc: 'Trazemos o paciente de volta para casa com segurança e conforto.',
    },
  ],
  feature: {
    label: 'A região cresce mais rápido que a infraestrutura de saúde',
    h2: 'A Região Oceânica cresce mais rápido que a infraestrutura de saúde. O transporte organizado faz a diferença.',
    h2Highlight: 'O transporte organizado faz a diferença',
    paragraphs: [
      'Piratininga, Itaipu, Itacoatiara e Maricá cresceram muito na última década. A infraestrutura de saúde não acompanhou o mesmo ritmo. Quando o caso exige hospital de alta complexidade, a remoção para Niterói ou Rio é inevitável.',
      'A Savior organiza essa rota com regularidade. Equipe médica a bordo para manter o paciente estável durante o percurso. Contato simultâneo com o hospital de destino antes de chegar.',
    ],
    callout: {
      title: 'Transporte recorrente para quem depende de tratamento fora da região',
      body: 'Moradores da Região Oceânica e de Maricá que precisam de diálise, quimioterapia ou acompanhamento regular em Niterói ou Rio podem agendar transporte fixo. A Savior cuida do horário e da rota.',
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo o Rio de Janeiro e região' },
      { value: '24h', desc: 'Central ativa todos os dias do ano' },
      { value: 'UTI', desc: 'Ambulância completa para percursos longos' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Claudia T.',
        text: 'Moro em Itaipu e minha mãe precisou de remoção urgente para o CHN em Niterói. A Savior chegou dentro do prazo informado e a equipe foi excelente durante todo o trajeto.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'André M.',
        text: 'Uso o serviço de transporte programado da Savior toda semana para levar meu pai de Maricá para o tratamento em Niterói. Pontual, cuidadoso e profissional.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo leva a ambulância para chegar em Itaipu e Piratininga?',
      a: 'Entre 40 e 55 minutos da base em São Cristóvão, via Ponte Rio-Niterói. A central informa a estimativa exata no chamado.',
    },
    {
      q: 'E em Maricá?',
      a: 'Entre 55 e 75 minutos via Ponte Rio-Niterói e RJ-106. Para casos programados, a central ajusta o horário de saída com antecedência.',
    },
    {
      q: 'Vocês fazem transporte programado recorrente?',
      a: 'Sim. Moradores da Região Oceânica e Maricá com tratamentos regulares em Niterói ou Rio podem agendar transporte fixo. Ligamos ou mandamos mensagem para confirmar horário.',
    },
    {
      q: 'Quanto custa a ambulância na Região Oceânica?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Niterói e São Gonçalo', slug: 'niteroi', highlight: 'CHN, Niterói D\'Or, Hospital Icaraí' },
    { name: 'Búzios', slug: 'buzios', highlight: 'Atendimento turístico e emergência' },
    { name: 'Intermunicipal', slug: 'intermunicipal', highlight: 'Cobertura no estado inteiro' },
  ],
  schema: {
    geo: { lat: -22.9414, lng: -43.0492 },
    areaServed: [
      { name: 'Piratininga' },
      { name: 'Itaipu' },
      { name: 'Itacoatiara' },
      { name: 'Engenho do Mato' },
      { name: 'Maricá' },
    ],
  },
};

// ============================================================
// Z8 — Região Serrana
// ============================================================
const regiaoSerrana: GeoRegion = {
  id: 'regiao-serrana',
  name: 'Região Serrana',
  slug: 'regiao-serrana',
  phase: 2,
  seo: {
    title: 'Ambulância Petrópolis, Teresópolis, Friburgo | Remoção Serra Rio | Savior',
    description:
      'Ambulância UTI da serra para o Rio. Petrópolis, Teresópolis, Nova Friburgo. Equipe treinada para estradas de montanha, neblina e percurso longo. (21) 3171-3030.',
    h1: 'Da serra para o Rio com UTI móvel. Petrópolis, Teresópolis e Friburgo.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/regiao-serrana',
    keywords: [
      'ambulância petrópolis',
      'ambulância teresópolis',
      'ambulância nova friburgo',
      'remoção petrópolis rio de janeiro',
      'ambulância serra fluminense',
    ],
  },
  hero: {
    eyebrow: 'Região Serrana · Central 24h',
    h1: 'Da serra para o Rio com UTI móvel. Petrópolis, Teresópolis e Friburgo.',
    h1Highlight: 'UTI móvel',
    subhead:
      'Estrada de serra exige preparo diferente: freio, suspensão, oxigênio reforçado e equipe treinada para neblina na BR-040. A Savior faz essa rota com regularidade.',
    waCampaign: 'geo-regiao-serrana',
    waMessage: 'Oi, preciso de orçamento para remoção da serra.',
  },
  tempos: [
    {
      region: 'Petrópolis e Itaipava',
      time: '60 a 90 min',
      route: 'Via BR-040 ou Estrada União e Indústria',
      highlight: true,
    },
    {
      region: 'Teresópolis',
      time: '90 a 110 min',
      route: 'Via BR-116 (Rio-Teresópolis)',
    },
    {
      region: 'Nova Friburgo',
      time: '2h a 2h30',
      route: 'Via BR-116 e RJ-130',
    },
  ],
  hospitals: [
    {
      name: 'Hospital Santa Teresa',
      initials: 'ST',
      network: 'Particular',
      detail: 'Petrópolis · Desde 1876 · Referência regional',
      tag: 'Referência Regional',
      color: { bg: '#1A5632', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Unimed Petrópolis',
      initials: 'UP',
      network: 'Unimed',
      detail: 'Petrópolis · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#1B5E20', text: '#FFFFFF' },
    },
    {
      name: 'Clínica Revitalis',
      initials: 'CR',
      network: 'Particular',
      detail: 'Araras · Clínica médica',
      tag: 'Clínica Médica',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
    {
      name: 'HCTCO — Hospital',
      initials: 'HC',
      network: 'Particular',
      detail: 'Teresópolis · Cirurgia geral e ortopedia',
      tag: 'Cirurgia',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Beneficência Portuguesa Teresópolis',
      initials: 'BP',
      network: 'Particular',
      detail: 'Teresópolis · Internação e clínica médica',
      tag: 'Internação',
      color: { bg: '#1A3C5E', text: '#FFFFFF' },
    },
    {
      name: 'Unimed Nova Friburgo',
      initials: 'UF',
      network: 'Unimed',
      detail: 'Nova Friburgo · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#1B5E20', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Serrano',
      initials: 'HS',
      network: 'Particular',
      detail: 'Nova Friburgo · Referência municipal',
      tag: 'Clínica Médica',
      color: { bg: '#154360', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Remoção da serra para o Rio',
      desc: 'UTI completa, equipe preparada para percurso longo em estrada de montanha.',
      emphasis: true,
    },
    {
      title: 'Transporte programado',
      desc: 'Consultas, exames e tratamentos em hospitais do Rio. Agendamento com antecedência.',
      emphasis: true,
    },
    {
      title: 'Transferência inter-hospitalar',
      desc: 'De Petrópolis, Teresópolis ou Friburgo para qualquer hospital de alta complexidade no Rio.',
    },
    {
      title: 'Oxigênio reforçado a bordo',
      desc: 'Altitude e percurso longo exigem reserva maior. Saímos com O2 dimensionado para o tempo de viagem.',
    },
  ],
  feature: {
    label: 'Estrada de serra exige preparo específico',
    h2: 'Estrada de serra exige preparo específico: freio, suspensão e oxigênio reforçado.',
    h2Highlight: 'freio, suspensão e oxigênio reforçado',
    paragraphs: [
      'A descida da BR-040 e da BR-116 não é igual a uma remoção em via urbana. A inclinação exige freio e suspensão preparados. A altitude exige mais O2 a bordo. Neblina frequente na BR-040 exige atenção redobrada da equipe.',
      'A Savior faz a rota Serra-Rio com regularidade. Equipe treinada para percurso longo, ambulância dimensionada para manter o paciente estável durante todo o trajeto e contato simultâneo com o hospital de destino no Rio.',
    ],
    callout: {
      title: 'Petrópolis, Teresópolis e Friburgo: orçamento antes de decidir',
      body: 'Para remoções da serra, pedimos o quadro do paciente antes de passar o orçamento. Isso garante que a ambulância certa saia com o equipamento certo para o percurso específico.',
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo remoções no estado do Rio' },
      { value: '24h', desc: 'Central ativa para emergências e programadas' },
      { value: 'UTI', desc: 'Ambulância completa para a descida da serra' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Beatriz C.',
        text: 'Meu pai caiu em Petrópolis e precisava de transferência urgente para um hospital no Rio. A Savior chegou em 70 minutos e a equipe foi impecável durante toda a descida da BR-040.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Paulo M.',
        text: 'Faço transporte programado de Teresópolis para tratamento no Rio toda semana. Pontual, profissional e a equipe trata minha mãe com muito cuidado.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo leva a ambulância para chegar em Petrópolis?',
      a: 'Entre 60 e 90 minutos da base em São Cristóvão, via BR-040. O tempo varia conforme condições da estrada e neblina. A central informa a estimativa exata no chamado.',
    },
    {
      q: 'E em Teresópolis e Nova Friburgo?',
      a: 'Teresópolis: 90 a 110 minutos. Nova Friburgo: 2h a 2h30. Para casos programados, combinamos o horário de saída com antecedência.',
    },
    {
      q: 'A ambulância tem preparo específico para estrada de serra?',
      a: 'Sim. As ambulâncias usadas para a região serrana saem com reserva de O2 maior, equipe treinada para percurso de montanha e verificação de freio e suspensão antes da saída.',
    },
    {
      q: 'Como faço para pedir orçamento para remoção da serra?',
      a: 'Entre em contato pelo WhatsApp ou pelo (21) 3171-3030. Precisamos saber: cidade de origem, condição atual do paciente e hospital de destino no Rio. Passamos o orçamento completo antes de qualquer compromisso.',
    },
  ],
  nearbyRegions: [
    { name: 'Intermunicipal', slug: 'intermunicipal', highlight: 'Cobertura em todo o estado' },
    { name: 'Angra dos Reis', slug: 'angra-dos-reis', highlight: 'Costa Verde e Ilha Grande' },
    { name: 'Zona Norte', slug: 'zona-norte', highlight: 'Base em São Cristóvão' },
  ],
  schema: {
    geo: { lat: -22.5047, lng: -43.1788 },
    areaServed: [
      { name: 'Petrópolis' },
      { name: 'Itaipava' },
      { name: 'Teresópolis' },
      { name: 'Nova Friburgo' },
    ],
  },
};

// ============================================================
// Z12 — Intermunicipal
// ============================================================
const intermunicipal: GeoRegion = {
  id: 'intermunicipal',
  name: 'Intermunicipal',
  slug: 'intermunicipal',
  phase: 2,
  seo: {
    title: 'Ambulância Intermunicipal RJ | Paraty, Campos, Volta Redonda, Macaé | Savior',
    description:
      'Remoção intermunicipal no estado do Rio. Paraty, Angra, Campos, Macaé, Volta Redonda, Região dos Lagos. Base no Rio. (21) 3171-3030.',
    h1: 'Remoção intermunicipal no Rio de Janeiro. Base no Rio, equipe que conhece o estado inteiro.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/intermunicipal',
    keywords: [
      'ambulância intermunicipal rio de janeiro',
      'remoção volta redonda rio',
      'ambulância campos dos goytacazes',
      'ambulância macaé',
      'remoção região dos lagos',
    ],
  },
  hero: {
    eyebrow: 'Intermunicipal · Base no Rio',
    h1: 'Remoção intermunicipal no Rio de Janeiro. Base no Rio, equipe que conhece o estado inteiro.',
    h1Highlight: 'equipe que conhece o estado inteiro',
    subhead:
      'Volta Redonda, Campos, Macaé, Paraty, Região dos Lagos. Uma ligação, uma empresa, equipe médica a bordo durante todo o percurso. Coordenamos a chegada no hospital de destino antes de sair.',
    waCampaign: 'geo-intermunicipal',
    waMessage: 'Oi, preciso de orçamento para remoção intermunicipal no Rio.',
  },
  tempos: [
    {
      region: 'Volta Redonda e Barra Mansa',
      time: '2h a 2h30',
      route: 'Via Presidente Dutra (BR-116)',
      highlight: true,
    },
    {
      region: 'Macaé',
      time: '2h30 a 3h',
      route: 'Via BR-101 (Rio-Santos sentido norte)',
    },
    {
      region: 'Campos dos Goytacazes',
      time: '3h30 a 4h',
      route: 'Via BR-101 norte',
    },
    {
      region: 'Região dos Lagos (Cabo Frio e Arraial)',
      time: '2h a 3h',
      route: 'Via BR-101 ou RJ-106',
    },
    {
      region: 'Paraty',
      time: '4h a 5h',
      route: 'Via BR-101 (Rio-Santos sentido sul)',
    },
  ],
  hospitals: [
    {
      name: 'Hospital Volta Redonda',
      initials: 'VR',
      network: "Rede D'Or",
      detail: 'Volta Redonda · Alta complexidade',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital do Retiro',
      initials: 'HR',
      network: 'Particular',
      detail: 'Volta Redonda · Cirurgia e internação',
      tag: 'Internação',
      color: { bg: '#1A3C5E', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Plantadores de Cana',
      initials: 'PC',
      network: 'Particular',
      detail: 'Campos dos Goytacazes · Referência regional',
      tag: 'Referência Regional',
      color: { bg: '#154360', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Ferreira Machado',
      initials: 'FM',
      network: 'SUS',
      detail: 'Campos dos Goytacazes · Emergência pública',
      tag: 'SUS',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital São Lucas Macaé',
      initials: 'SM',
      network: 'Particular',
      detail: 'Macaé · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
    },
    {
      name: 'Hospital São João Batista',
      initials: 'SJ',
      network: 'Particular',
      detail: 'Macaé · Clínica médica e emergência',
      tag: 'Emergência',
      color: { bg: '#17405A', text: '#FFFFFF' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'Remoção de longa distância',
      desc: 'Uma empresa, uma central, uma equipe. Do interior do estado até o Rio com UTI completa a bordo.',
      emphasis: true,
    },
    {
      title: 'Planejamento com hospitais de apoio na rota',
      desc: 'Mapeamos pontos de suporte ao longo do trajeto para percursos acima de 2 horas.',
      emphasis: true,
    },
    {
      title: 'Equipe dimensionada para o tempo de viagem',
      desc: 'Médico e enfermeiro a bordo. Oxigênio, medicação e equipamento calculados para a duração do percurso.',
    },
    {
      title: 'Coordenação de chegada',
      desc: 'Nossa central contata o hospital de destino antes de sair. Sem espera na recepção.',
    },
  ],
  feature: {
    label: 'Remoção de longa distância dentro do estado',
    h2: 'Uma ligação para cobrir qualquer ponto do estado do Rio. Base no Rio, equipe no percurso.',
    h2Highlight: 'Uma ligação para cobrir qualquer ponto do estado do Rio',
    paragraphs: [
      'Remoções intermunicipais longas exigem planejamento diferente. Equipe dimensionada para o tempo de viagem, oxigênio calculado para o percurso e mapeamento de hospitais de apoio na rota são parte do processo.',
      'Nossa central coordena saída e chegada simultaneamente. Quando a ambulância chega ao hospital de destino, a equipe de recepção já está avisada e pronta.',
    ],
    callout: {
      title: 'Orçamento antes de decidir',
      body: 'Para remoções intermunicipais, pedimos o quadro do paciente, cidade de origem e hospital de destino. Com essas informações, passamos o orçamento completo e explicamos o que está incluído antes de qualquer compromisso.',
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo remoções longas no estado do Rio' },
      { value: '24h', desc: 'Central ativa para emergências e programadas' },
      { value: 'UTI', desc: 'Ambulância completa para percursos longos' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Fernanda G.',
        text: 'Meu pai precisou ser removido de Campos para um hospital especializado no Rio. A Savior organizou tudo: equipe médica a bordo, chegada coordenada. Não tive que me preocupar com nada.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Diego R.',
        text: 'Remoção de Volta Redonda para o Rio após cirurgia. Equipe muito profissional, paciente monitorado durante todo o trajeto. Recomendo para qualquer remoção longa.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo leva a remoção de Volta Redonda para o Rio?',
      a: 'Entre 2h e 2h30 via Presidente Dutra, dependendo do tráfego. A central verifica as condições da via antes da saída.',
    },
    {
      q: 'E de Campos dos Goytacazes?',
      a: 'Entre 3h30 e 4h via BR-101. Para percursos acima de 2 horas, saímos com equipe e equipamento dimensionados para o tempo de viagem.',
    },
    {
      q: 'O que acontece se o paciente precisar de atenção no meio do caminho?',
      a: 'A equipe médica a bordo cuida imediatamente. Temos pontos de apoio hospitalar mapeados ao longo das principais rotas dentro do estado.',
    },
    {
      q: 'Como faço para pedir orçamento?',
      a: 'Pelo WhatsApp ou pelo (21) 3171-3030. Precisamos saber: cidade de origem, condição atual do paciente e hospital de destino. Passamos o orçamento completo antes de qualquer compromisso.',
    },
  ],
  nearbyRegions: [
    { name: 'Região Serrana', slug: 'regiao-serrana', highlight: 'Petrópolis, Teresópolis, Friburgo' },
    { name: 'Angra dos Reis', slug: 'angra-dos-reis', highlight: 'Costa Verde e Ilha Grande' },
    { name: 'Búzios', slug: 'buzios', highlight: 'Atendimento turístico e emergência' },
  ],
  schema: {
    geo: { lat: -22.9068, lng: -43.1729 },
    areaServed: [
      { name: 'Volta Redonda' },
      { name: 'Barra Mansa' },
      { name: 'Campos dos Goytacazes' },
      { name: 'Macaé' },
      { name: 'Cabo Frio' },
      { name: 'Arraial do Cabo' },
      { name: 'Paraty' },
    ],
  },
};

// ============================================================
// Z13 — Búzios
// ============================================================
const buzios: GeoRegion = {
  id: 'buzios',
  name: 'Búzios',
  slug: 'buzios',
  phase: 2,
  seo: {
    title: 'Ambulância Búzios | Emergência e Remoção para o Rio | Savior',
    description:
      'Ambulância UTI em Búzios. Emergência turística e remoção para hospitais do Rio. Cobertura de eventos e casamentos. (21) 3171-3030.',
    h1: 'Ambulância em Búzios: emergência e remoção para o Rio',
    canonical: 'https://www.savior.com.br/ambulancia-rj/buzios',
    keywords: [
      'ambulância búzios',
      'ambulância armação dos búzios',
      'emergência búzios',
      'remoção búzios rio de janeiro',
      'ambulância evento búzios',
    ],
  },
  hero: {
    eyebrow: 'Búzios · Atendimento turístico',
    h1: 'Ambulância em Búzios: emergência e remoção para o Rio',
    h1Highlight: 'remoção para o Rio',
    subhead:
      'Quando algo acontece em Búzios, o hospital mais próximo com alta complexidade fica a 30 minutos em Cabo Frio, ou a 2h30 no Rio. A Savior organiza essa rota com segurança.',
    waCampaign: 'geo-buzios',
    waMessage: 'Oi, preciso de ambulância em Búzios.',
  },
  tempos: [
    {
      region: 'Búzios (centro) e Geribá e Ferradura',
      time: '2h30 a 3h',
      route: 'Da base no Rio via RJ-106 ou BR-101',
      highlight: true,
    },
    {
      region: 'Cabo Frio (apoio)',
      time: '2h a 2h30',
      route: 'Da base no Rio via RJ-106',
    },
  ],
  hospitals: [
    {
      name: 'Hospital Municipal de Armação dos Búzios',
      initials: 'HB',
      network: 'Municipal',
      detail: 'Búzios · Pronto-atendimento limitado',
      tag: 'Municipal',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'UPA Búzios',
      initials: 'UB',
      network: 'Municipal',
      detail: 'Búzios · Urgência e emergência básica',
      tag: 'UPA',
      color: { bg: '#2C5F8A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Unilagos',
      initials: 'UL',
      network: "Rede D'Or",
      detail: 'Cabo Frio · Alta complexidade · 30 min de Búzios',
      tag: 'Cabo Frio',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital São José Operário',
      initials: 'SJ',
      network: 'Particular',
      detail: 'Cabo Frio · Internação e cirurgia',
      tag: 'Cabo Frio',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
  ],
  services: [
    {
      title: 'Emergência turística 24h',
      desc: 'Atendemos em hotel, pousada, praia ou condomínio. Equipe com médico e enfermeiro.',
      emphasis: true,
    },
    {
      title: 'Cobertura de eventos e casamentos',
      desc: 'Ambulância em standby durante o evento. Equipe médica no local para qualquer intercorrência.',
      emphasis: true,
    },
    {
      title: 'Remoção para Cabo Frio ou Rio',
      desc: 'Hospital Unilagos em Cabo Frio (30 min) ou hospitais de alta complexidade no Rio (2h30). A central define a melhor rota.',
    },
    {
      title: 'Transferência inter-hospitalar',
      desc: 'De Búzios ou Cabo Frio para qualquer hospital do Rio com UTI completa a bordo.',
    },
  ],
  feature: {
    label: 'Turismo de alto padrão exige suporte médico à altura',
    h2: 'Réveillon, casamentos, feriados prolongados. Búzios recebe turismo de alto padrão. E isso exige preparo.',
    h2Highlight: 'Búzios recebe turismo de alto padrão',
    paragraphs: [
      'Búzios concentra pousadas e resorts de alto padrão, casamentos na orla, réveillon com milhares de turistas e feriados que lotam a cidade. Em qualquer desses momentos, uma emergência médica pode acontecer.',
      'O hospital municipal de Búzios tem capacidade limitada. O hospital com alta complexidade mais próximo fica a 30 minutos em Cabo Frio. Para casos graves, a rota vai direto ao Rio. A Savior organiza essa logística com equipe médica a bordo desde o primeiro momento.',
    ],
    callout: {
      title: 'Cobertura de eventos em Búzios',
      body: 'Casamentos, aniversários, eventos corporativos e réveillon: a Savior fornece ambulância em standby com equipe médica no local durante todo o evento. Contato antecipado para orçamento e planejamento.',
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo emergências no Rio e região' },
      { value: '24h', desc: 'Central ativa em todos os feriados e réveillon' },
      { value: 'UTI', desc: 'Ambulância completa para remoção até o Rio' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Márcia V.',
        text: 'Contratei a Savior para cobrir nosso casamento em Búzios. A ambulância ficou no local durante toda a cerimônia e festa. Nada aconteceu, mas a tranquilidade que isso trouxe não tem preço.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto tempo a ambulância leva para chegar em Búzios?',
      a: 'Entre 2h30 e 3h da base no Rio, via RJ-106 ou BR-101. Para casos programados, combinamos horário com antecedência. A central informa a estimativa exata no chamado.',
    },
    {
      q: 'Atendem em hotel ou pousada em Búzios?',
      a: 'Sim. Atendemos em qualquer endereço: hotel, pousada, praia, condomínio ou embarcação. Informe o endereço no chamado e a equipe já sai com o equipamento adequado.',
    },
    {
      q: 'Cobrem casamentos e eventos em Búzios?',
      a: 'Sim. Fornecemos ambulância em standby com equipe médica durante o evento. O orçamento é fechado com antecedência, com planejamento de posicionamento e protocolo de emergência.',
    },
    {
      q: 'Quanto custa a remoção de Búzios para o Rio?',
      a: 'O valor depende do percurso e do tipo de ambulância. Básica a partir de R$ 1.200, UTI a partir de R$ 2.200 (valor base, percurso longo tem acréscimo). Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
  ],
  nearbyRegions: [
    { name: 'Região Oceânica', slug: 'regiao-oceanica', highlight: 'Itaipu, Piratininga, Maricá' },
    { name: 'Intermunicipal', slug: 'intermunicipal', highlight: 'Cobertura em todo o estado' },
  ],
  schema: {
    geo: { lat: -22.7469, lng: -41.8817 },
    areaServed: [
      { name: 'Armação dos Búzios' },
      { name: 'Geribá' },
      { name: 'Ferradura' },
      { name: 'Cabo Frio' },
    ],
  },
};

// ============================================================
// Z14 — Angra dos Reis
// ============================================================
const angraDosReis: GeoRegion = {
  id: 'angra-dos-reis',
  name: 'Angra dos Reis',
  slug: 'angra-dos-reis',
  phase: 2,
  seo: {
    title: 'Ambulância Angra dos Reis e Ilha Grande | UTI Remoção | Savior',
    description:
      'Ambulância UTI em Angra dos Reis e acesso marítimo à Ilha Grande. Remoção para hospitais do Rio pela BR-101. (21) 3171-3030.',
    h1: 'Ambulância em Angra dos Reis e Ilha Grande: remoção com UTI móvel',
    canonical: 'https://www.savior.com.br/ambulancia-rj/angra-dos-reis',
    keywords: [
      'ambulância angra dos reis',
      'ambulância ilha grande',
      'remoção angra rio de janeiro',
      'ambulância costa verde',
      'remoção ilha grande rio',
    ],
  },
  hero: {
    eyebrow: 'Angra dos Reis · Costa Verde',
    h1: 'Ambulância em Angra dos Reis e Ilha Grande: remoção com UTI móvel',
    h1Highlight: 'UTI móvel',
    subhead:
      'Para Angra, pela BR-101 Rio-Santos. Para a Ilha Grande, coordenamos a ambulância no porto com a equipe médica a bordo da lancha. Condomínios de luxo, marinas e eventos cobertos.',
    waCampaign: 'geo-angra',
    waMessage: 'Oi, preciso de ambulância em Angra dos Reis.',
  },
  tempos: [
    {
      region: 'Angra dos Reis (centro)',
      time: '2h30 a 3h',
      route: 'Via BR-101 (Rio-Santos)',
      highlight: true,
    },
    {
      region: 'Ilha Grande',
      time: 'Tempo variável',
      route: 'Lancha até o continente + ambulância no porto',
    },
    {
      region: 'Mangaratiba',
      time: '2h a 2h30',
      route: 'Via BR-101 (Rio-Santos)',
    },
  ],
  hospitals: [
    {
      name: 'Hospital da Japuíba',
      initials: 'HJ',
      network: 'Particular',
      detail: 'Angra dos Reis · Emergência 24h',
      tag: 'Emergência 24h',
      color: { bg: '#0D47A1', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Hugo Miranda',
      initials: 'HM',
      network: 'Particular',
      detail: 'Angra dos Reis · Internação e cirurgia',
      tag: 'Internação',
      color: { bg: '#17405A', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Codrato de Vilhena',
      initials: 'CV',
      network: 'SUS',
      detail: 'Angra dos Reis · Emergência pública',
      tag: 'Municipal',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Volta Redonda',
      initials: 'VR',
      network: "Rede D'Or",
      detail: 'Volta Redonda · Alta complexidade · Rota alternativa',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'Remoção com UTI móvel',
      desc: 'Angra para o Rio ou Volta Redonda com médico e enfermeiro a bordo durante todo o percurso.',
      emphasis: true,
    },
    {
      title: 'Coordenação para Ilha Grande',
      desc: 'Pacientes na Ilha Grande precisam de lancha até o continente. Coordenamos a ambulância no porto com a equipe médica a bordo.',
      emphasis: true,
    },
    {
      title: 'Cobertura de eventos e condomínios',
      desc: 'Frade, Porto Bracuhy, marinas e condomínios de luxo. Atendemos em qualquer endereço.',
    },
    {
      title: 'Emergência turística',
      desc: 'Réveillon, carnaval, feriados prolongados. Central ativa durante todo o período.',
    },
  ],
  feature: {
    label: 'Ilha Grande: quando a lancha faz parte do protocolo',
    h2: 'Pacientes na Ilha Grande precisam de lancha até o continente. Coordenamos a ambulância no porto.',
    h2Highlight: 'Coordenamos a ambulância no porto',
    paragraphs: [
      'Quem está na Ilha Grande em emergência médica precisa primeiro chegar ao continente de barco. Nossa equipe coordena a ambulância no porto de Angra simultaneamente à travessia de lancha, para que o paciente seja recebido imediatamente ao desembarcar.',
      'Para Angra dos Reis, a rota pela BR-101 Rio-Santos leva entre 2h30 e 3h. Para casos de alta complexidade, a remoção pode ir direto para hospitais do Rio ou para Volta Redonda, conforme a condição do paciente.',
    ],
    callout: {
      title: 'Condomínios de luxo: Frade e Porto Bracuhy',
      body: 'Moradores e hóspedes dos grandes condomínios de Angra podem contar com atendimento dentro das propriedades. A equipe entra no condomínio e atende no local.',
    },
    stats: [
      { value: '46 anos', desc: 'Atendendo emergências no Rio e estado' },
      { value: '24h', desc: 'Central ativa nos feriados e temporadas' },
      { value: 'UTI', desc: 'Ambulância completa para percurso longo' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Gustavo F.',
        text: 'Meu sogro passou mal na Ilha Grande durante o réveillon. A Savior coordenou tudo: lancha, ambulância no porto, traslado até o hospital. Profissionalismo total numa situação muito difícil.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Lívia S.',
        text: 'Usamos a Savior para cobrir o nosso evento em Angra. Equipe presente durante todo o evento, discretos e preparados. Essencial para quem organiza eventos em locais remotos.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Como funciona a remoção de pacientes na Ilha Grande?',
      a: 'Coordenamos a ambulância no porto de Angra dos Reis enquanto o paciente faz a travessia de lancha. Ao desembarcar, a equipe já está no cais. O tempo total depende da distância na ilha e das condições marítimas.',
    },
    {
      q: 'Atendem em condomínio fechado em Angra, como Frade ou Porto Bracuhy?',
      a: 'Sim. Atendemos dentro dos condomínios. Informamos o acesso no chamado e a equipe já sai preparada para o protocolo de entrada.',
    },
    {
      q: 'Quanto tempo leva até um hospital de alta complexidade saindo de Angra?',
      a: 'Para hospitais no Rio: entre 2h30 e 3h pela BR-101. Para Volta Redonda (Rede D\'Or): aproximadamente 2h pela BR-101 sentido interior. A central define a melhor rota conforme o quadro do paciente.',
    },
    {
      q: 'Cobrem eventos em Angra dos Reis?',
      a: 'Sim. Fornecemos ambulância em standby com equipe médica durante eventos em Angra, Ilha Grande e adjacências. Orçamento e planejamento com antecedência.',
    },
  ],
  nearbyRegions: [
    { name: 'Intermunicipal', slug: 'intermunicipal', highlight: 'Cobertura em todo o estado do Rio' },
    { name: 'Região Serrana', slug: 'regiao-serrana', highlight: 'Petrópolis, Teresópolis, Friburgo' },
  ],
  schema: {
    geo: { lat: -23.0067, lng: -44.3181 },
    areaServed: [
      { name: 'Angra dos Reis' },
      { name: 'Ilha Grande' },
      { name: 'Mangaratiba' },
      { name: 'Porto Bracuhy' },
      { name: 'Frade' },
    ],
  },
};

// ============================================================
// Z9 — Baixada Fluminense
// ============================================================
const baixadaFluminense: GeoRegion = {
  id: 'baixada-fluminense',
  name: 'Baixada Fluminense',
  slug: 'baixada-fluminense',
  phase: 3,
  seo: {
    title: 'Ambulância Baixada Fluminense | Caxias, Nova Iguaçu, Meriti | Savior',
    description:
      'Ambulância UTI em Duque de Caxias, Nova Iguaçu, São João de Meriti e Nilópolis. Remoções para hospitais do Rio. Pix e cartão. (21) 3171-3030.',
    h1: 'Ambulância na Baixada. Da sua casa ao hospital certo, no Rio ou na região.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/baixada-fluminense',
    keywords: [
      'ambulância baixada fluminense',
      'ambulância duque de caxias',
      'ambulância nova iguaçu',
      'ambulância são joão de meriti',
      'ambulância nilópolis',
    ],
  },
  hero: {
    eyebrow: 'Baixada Fluminense · Central 24h',
    h1: 'Ambulância na Baixada. Da sua casa ao hospital certo, no Rio ou na região.',
    h1Highlight: 'hospital certo',
    subhead:
      'Atendemos em Duque de Caxias, Nova Iguaçu, São João de Meriti e Nilópolis. Valor informado no WhatsApp antes de sair. Remoção para hospitais na capital ou na Baixada. Médico e enfermeiro a bordo.',
    waCampaign: 'geo-baixada',
    waMessage: 'Oi, preciso de ambulância na Baixada Fluminense.',
  },
  tempos: [
    {
      region: 'Duque de Caxias',
      time: '30 a 40 min',
      route: 'Via Avenida Brasil ou Linha Vermelha',
      highlight: true,
    },
    {
      region: 'São João de Meriti e Nilópolis',
      time: '35 a 45 min',
      route: 'Via Avenida Brasil ou BR-040',
    },
    {
      region: 'Nova Iguaçu e Belford Roxo',
      time: '40 a 55 min',
      route: 'Via BR-040 ou Avenida Brasil sentido interior',
    },
  ],
  hospitals: [
    {
      name: "Hospital Caxias D'Or",
      initials: 'CX',
      network: "Rede D'Or",
      detail: 'Duque de Caxias · Alta complexidade · Emergência 24h',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: 'Hospital Mário Lioni',
      initials: 'ML',
      network: 'Particular',
      detail: 'Duque de Caxias · Internação e cirurgia geral',
      tag: 'Internação',
      color: { bg: '#1B4F72', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Santa Branca',
      initials: 'SB',
      network: 'Particular',
      detail: 'Duque de Caxias · Clínica médica e emergência',
      tag: 'Emergência',
      color: { bg: '#17405A', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Prontonil',
      initials: 'PN',
      network: 'Particular',
      detail: 'Duque de Caxias · Pronto-socorro 24h',
      tag: 'Pronto-socorro',
      color: { bg: '#154360', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Hospital Terezinha de Jesus',
      initials: 'TJ',
      network: 'Particular',
      detail: 'São João de Meriti · Maternidade e internação',
      tag: 'Maternidade',
      color: { bg: '#6C3483', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Geral de Nova Iguaçu',
      initials: 'GI',
      network: 'SUS',
      detail: 'Nova Iguaçu · Referência em trauma · Emergência 24h',
      tag: 'SUS · Trauma',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'Preço confirmado antes de sair',
      desc: 'Valor informado no WhatsApp assim que o chamado é aberto. Pix com 5% de desconto, cartão em até 3x. Sem surpresa.',
      emphasis: true,
    },
    {
      title: 'Remoção para o Rio',
      desc: 'A rota mais comum: base na Baixada até hospital na capital. Coordenamos chegada e leito antes de partir.',
    },
    {
      title: 'Ambulância básica e UTI',
      desc: 'Ambulância com técnico de enfermagem para remoções simples. UTI móvel com médico e enfermeiro para casos críticos.',
    },
    {
      title: 'Emergência 24h',
      desc: 'Central ativa todos os dias do ano. Atendimento em menos de 1 minuto.',
    },
  ],
  feature: {
    label: 'Preço transparente',
    h2: 'Valor confirmado no WhatsApp antes de sair. Sem surpresa.',
    h2Highlight: 'Sem surpresa',
    paragraphs: [
      'Na Baixada, clareza no preço pesa. Por isso, quando você liga ou manda mensagem, a central já informa o valor antes de escalar a equipe. Sem cobrança surpresa depois da corrida.',
      'A rota mais comum que atendemos é: casa na Baixada, hospital na capital. Coordenamos a chegada e a vaga simultaneamente com a saída da ambulância, para o paciente não esperar na porta.',
    ],
    callout: {
      title: 'Pix com 5% de desconto',
      body: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. Pix com 5% de desconto, cartão em até 3x. Confirmamos tudo no WhatsApp antes da equipe sair.',
    },
    stats: [
      { value: '30 min', desc: 'Tempo estimado em Duque de Caxias' },
      { value: '46 anos', desc: 'Atendendo o Rio de Janeiro' },
      { value: '24h', desc: 'Central ativa todos os dias do ano' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Claudia R.',
        text: 'Precisei de ambulância em Caxias de madrugada. Confirmaram o valor antes de sair, chegaram no tempo prometido e levaram minha mãe para o hospital no Rio sem nenhuma complicação.',
        source: 'Google',
        rating: 5,
      },
      {
        name: 'Eduardo S.',
        text: 'Atendimento rápido e preço honesto. Informaram tudo no WhatsApp antes de sair. Equipe muito profissional durante todo o transporte.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Quanto custa a ambulância em Caxias?',
      a: 'Básica a partir de R$ 1.200, UTI a partir de R$ 2.200. Pix com 5% de desconto, cartão em até 3x. O valor é confirmado no WhatsApp antes da equipe sair.',
    },
    {
      q: 'Vocês levam para hospital no Rio?',
      a: 'Sim. É a rota mais comum que atendemos: base na Baixada com destino a hospitais na capital. Coordenamos a chegada e a vaga antes de partir.',
    },
    {
      q: 'Atendem de madrugada?',
      a: 'Sim. A central funciona 24 horas todos os dias do ano. Atendemos chamados a qualquer hora.',
    },
    {
      q: 'Quando preciso de ambulância simples e quando preciso de UTI?',
      a: 'Ambulância básica atende remoções programadas, altas hospitalares e casos estáveis. UTI móvel é indicada para casos críticos, instabilidade clínica ou quando o médico solicitar monitoramento contínuo. A central orienta conforme o quadro relatado.',
    },
  ],
  nearbyRegions: [
    { name: 'Zona Norte', slug: 'zona-norte', highlight: 'Tijuca, Méier, base em São Cristóvão' },
    { name: 'Zona Oeste', slug: 'zona-oeste', highlight: 'Jacarepaguá, Bangu, Campo Grande' },
    { name: 'Niterói', slug: 'niteroi', highlight: 'Hospital Icaraí, CHN, Vita' },
  ],
  schema: {
    geo: { lat: -22.7856, lng: -43.3111 },
    areaServed: [
      { name: 'Duque de Caxias' },
      { name: 'Nova Iguaçu' },
      { name: 'São João de Meriti' },
      { name: 'Nilópolis' },
      { name: 'Belford Roxo' },
    ],
  },
};

// ============================================================
// Z10 — Centro
// ============================================================
const centro: GeoRegion = {
  id: 'centro',
  name: 'Centro',
  slug: 'centro',
  phase: 3,
  seo: {
    title: 'Ambulância Centro do Rio | Empresas e Eventos | APH Corporativo | Savior',
    description:
      'Ambulância no Centro do Rio em 10 a 20 minutos. Empresas, eventos, remoções. Segundo menor tempo de chegada. (21) 3171-3030.',
    h1: 'Ambulância no Centro do Rio em 10 a 20 minutos.',
    canonical: 'https://www.savior.com.br/ambulancia-rj/centro',
    keywords: [
      'ambulância centro rio de janeiro',
      'ambulância corporativa rio',
      'aph evento centro rio',
      'ambulância lapa',
      'ambulância porto maravilha',
    ],
  },
  hero: {
    eyebrow: 'Centro do Rio · 2º menor tempo',
    h1: 'Ambulância no Centro do Rio em 10 a 20 minutos.',
    h1Highlight: '10 a 20 minutos',
    subhead:
      'Nossa base em São Cristóvão garante o segundo menor tempo de chegada da cidade. Empresas, órgãos públicos e eventos no Centro e na Lapa. Conhecemos os pontos de acesso nas ruas de pedestre e vias do BRT e VLT.',
    waCampaign: 'geo-centro',
    waMessage: 'Oi, preciso de ambulância no Centro do Rio.',
  },
  tempos: [
    {
      region: 'Cidade Nova e Praça da Bandeira',
      time: '10 a 15 min',
      route: 'Via Avenida Paulo de Frontin ou Radial Oeste',
      highlight: true,
    },
    {
      region: 'Centro, Lapa e Porto Maravilha',
      time: '15 a 20 min',
      route: 'Via Perimetral ou Avenida Brasil sentido Centro',
    },
  ],
  hospitals: [
    {
      name: "Quinta D'Or",
      initials: 'QD',
      network: "Rede D'Or",
      detail: 'São Cristóvão · Vizinho da base · Alta complexidade · Emergência 24h',
      tag: 'Vizinho da Base',
      color: { bg: '#003B71', text: '#E8A624' },
      emergency24h: true,
    },
    {
      name: "Glória D'Or",
      initials: 'GD',
      network: "Rede D'Or",
      detail: 'Glória · Alta complexidade · Cirurgia e internação',
      tag: 'Alta Complexidade',
      color: { bg: '#003B71', text: '#E8A624' },
    },
    {
      name: 'Hospital Espanhol',
      initials: 'HE',
      network: 'Particular',
      detail: 'Centro · Internação e cirurgia geral',
      tag: 'Internação',
      color: { bg: '#C0392B', text: '#FFFFFF' },
    },
    {
      name: 'Hospital do Carmo',
      initials: 'HC',
      network: 'Particular',
      detail: 'Centro · Clínica médica e emergência',
      tag: 'Emergência',
      color: { bg: '#17405A', text: '#FFFFFF' },
      emergency24h: true,
    },
    {
      name: 'Real Hospital Português',
      initials: 'RP',
      network: 'Particular',
      detail: 'Botafogo · Alta complexidade · Cardio e oncologia',
      tag: 'Cardio',
      color: { bg: '#154360', text: '#FFFFFF' },
    },
    {
      name: 'Hospital Souza Aguiar',
      initials: 'SA',
      network: 'SUS',
      detail: 'Centro · Maior emergência do Rio · Referência em trauma',
      tag: 'SUS · Maior Emergência',
      color: { bg: '#2E7D32', text: '#FFFFFF' },
      emergency24h: true,
    },
  ],
  services: [
    {
      title: 'APH para eventos corporativos',
      desc: 'Plantão fixo com equipe médica durante eventos no Centro, Lapa e Porto Maravilha. Orçamento e planejamento com antecedência.',
      emphasis: true,
    },
    {
      title: 'Plantão fixo para empresas',
      desc: 'Ambulância e equipe em standby na sede da empresa. Faturamento mensal, contrato com SLA.',
    },
    {
      title: 'Remoção e transferência',
      desc: 'Remoções programadas e emergenciais. Coordenamos chegada e vaga no hospital destino.',
    },
    {
      title: 'Emergência 24h',
      desc: 'Central ativa todos os dias do ano. Atendimento em menos de 1 minuto.',
    },
  ],
  feature: {
    label: 'Centro e corporativo',
    h2: 'A central conhece cada acesso do Centro. BRT, VLT e ruas de pedestre não são surpresa.',
    h2Highlight: 'não são surpresa',
    paragraphs: [
      'O Centro do Rio concentra restrições de circulação que travam quem não conhece: corredores de BRT, trilhos do VLT, vias exclusivas de pedestre no Porto Maravilha. Nossa central monitora e define a rota antes de sair.',
      'Além dos chamados de emergência, o Centro concentra sedes de empresas, órgãos públicos e casas de evento. Fornecemos ambulância de plantão fixo, APH para eventos corporativos e remoção com faturamento mensal.',
    ],
    callout: {
      title: 'Conheça os planos corporativos',
      body: 'Plantão fixo, APH para eventos e remoção com faturamento mensal. Consulte condições pelo WhatsApp ou acesse a página corporativa.',
    },
    stats: [
      { value: '10 min', desc: 'Tempo mínimo para Cidade Nova e Praça da Bandeira' },
      { value: '46 anos', desc: 'Atendendo o Rio de Janeiro' },
      { value: '24h', desc: 'Central ativa todos os dias do ano' },
    ],
  },
  socialProof: {
    reviews: [
      {
        name: 'Fernanda O.',
        text: 'Contratamos a Savior para um evento corporativo no Porto Maravilha. Equipe pontual, discreta e preparada. A central já conhecia os acessos do local.',
        source: 'Google',
        rating: 5,
      },
    ],
  },
  faq: [
    {
      q: 'Minha empresa precisa de ambulância de plantão fixo no Centro. Como funciona?',
      a: 'Fornecemos ambulância com equipe em standby na sede da empresa. Contrato com SLA definido e faturamento mensal. Entre em contato pelo WhatsApp para orçamento.',
    },
    {
      q: 'Entram em rua de pedestre ou área restrita no Centro?',
      a: 'Sim. Nossa central conhece os pontos de acesso nas vias do BRT, VLT e ruas de pedestre do Porto Maravilha. A rota é definida antes de sair para evitar bloqueios.',
    },
    {
      q: 'Cobrem eventos na Lapa?',
      a: 'Sim. Atendemos eventos no Centro, Lapa e adjacências com ambulância em standby e equipe médica. Solicite orçamento com antecedência.',
    },
    {
      q: 'Qual o tempo até o Porto Maravilha?',
      a: 'Entre 15 e 20 minutos da nossa base em São Cristóvão, via rotas que evitam os corredores exclusivos.',
    },
  ],
  nearbyRegions: [
    { name: 'Zona Norte', slug: 'zona-norte', highlight: 'Base em São Cristóvão, menores tempos' },
    { name: 'Copacabana', slug: 'copacabana', highlight: 'Orla histórica e hospitais' },
    { name: 'Zona Sul', slug: 'zona-sul', highlight: 'Ipanema, Leblon, Botafogo' },
  ],
  schema: {
    geo: { lat: -22.9068, lng: -43.1729 },
    areaServed: [
      { name: 'Centro' },
      { name: 'Lapa' },
      { name: 'Porto Maravilha' },
      { name: 'Cidade Nova' },
      { name: 'Praça da Bandeira' },
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
  zonaOeste,
  zonaNorte,
  regiaoOceanica,
  regiaoSerrana,
  intermunicipal,
  buzios,
  angraDosReis,
  baixadaFluminense,
  centro,
];

export function getRegion(id: string): GeoRegion {
  const region = GEO_REGIONS.find(r => r.id === id);
  if (!region) throw new Error(`Region "${id}" not found in geo-regions data`);
  return region;
}

export function getRegionsByPhase(phase: 1 | 2 | 3): GeoRegion[] {
  return GEO_REGIONS.filter(r => r.phase === phase);
}
