// ============================================================
// Dados compartilhados entre todas as LPs.
// Troque aqui e vale pra todas as páginas.
// ============================================================

export const BRAND = {
  name: 'Savior',
  fullName: 'Savior Medical Service',
  conceptMother: 'Medicina que chega',
  conceptAnchor: 'Quando cada segundo conta, nós já estamos a caminho',
  yearsFounded: 1979,
  yearsOperating: 46,
};

export const CONTACT_RJ = {
  phone: '(21) 3171-3030',
  phoneHref: '+552131713030',
  // WhatsApp oficial da Savior (extraído da LP atual)
  whatsapp: '5521980358200',
  whatsappDisplay: '(21) 98035-8200',
  email: 'comercial@savior.com.br',
  address: 'R. Gen. Padilha, 73. São Cristóvão, Rio de Janeiro, RJ. 20920-390',
};

export const CONTACT_SP = {
  // Número principal (mobile/WA) — usado nos CTAs de emergência
  phone: '(11) 94486-1329',
  phoneHref: '+5511944861329',
  whatsapp: '5511944861329',
  whatsappDisplay: '(11) 94486-1329',
  // Linha fixa — exibida no footer como contato geral
  phoneLandline: '(11) 3796-0058',
  phoneLandlineHref: '+551137960058',
  email: 'comercial@savior.com.br',
  address: 'Av. do Rio Bonito, 287 · Socorro · São Paulo · SP · 04776-000',
};

// ============ Analytics & Tracking ============
// Troque os placeholders pelos IDs reais antes do deploy.
// GTM orquestra GA4, Meta Pixel, LinkedIn Insight Tag e qualquer outra tag via dataLayer.
//
// Como obter cada ID:
// - GTM: tagmanager.google.com → novo container → GTM-XXXXXXX
// - GA4: configurado dentro do GTM (tag tipo "GA4 Configuration") — opcionalmente hardcoded aqui
// - Meta Pixel: business.facebook.com/events_manager → ID numérico 15-16 dígitos
// - LinkedIn: linkedin.com/campaignmanager → Insight Tag → Partner ID numérico
export const ANALYTICS = {
  // Google Tag Manager — DESATIVADO (conta 6244498214 com flag de malware herdado da agência
  // anterior netart1.com.br; scanner pausa tags automaticamente em qualquer container da conta)
  gtm: '',

  // GA4 — carregado direto via gtag.js (sem GTM)
  ga4: 'G-43FPPY00QR',

  // Meta Pixel — ID numérico do Pixel no Events Manager
  metaPixel: '571875002833284',

  // LinkedIn Insight Tag — Partner ID do Campaign Manager
  linkedInPartnerId: 'LINKEDIN_PARTNER_PLACEHOLDER',

  // Flag: false = GA4 + Meta + LinkedIn carregam direto no HTML (sem GTM)
  useGtmAsSource: false,
};

export const METRICS = {
  yearsOperating: 46,
  professionals: '+450',
  attendancesYear: '+100k',
  resolutivity: '96%',
  nps: 92,
  avgResponseTimeBase: '4 min',
  avgArrivalZonaSul: '18 min',
  avgArrivalZonaNorte: '25 min',
  avgArrivalNiteroi: '35 min',
  avgArrivalSP: '22 min',
};

// Lista real de clientes da LP atual da Savior
export const CLIENTS = [
  'SulAmérica',
  'Amil',
  'Bradesco',
  'Prevent Senior',
  'Intermédica',
  'Petrobras',
];

// Depoimentos reais publicados no Google Meu Negócio da Savior
// Perfil público: https://share.google/GZ7m1GMno4ibRxgYA
// Google score: 4.7 estrelas, 346 avaliações (abr/2026)
// Fotos WebP otimizadas em /public/img/testimonials/
export const TESTIMONIALS = [
  {
    name: 'Bruno Cesar',
    initials: 'BC',
    color: '#143458',
    photo: '/img/testimonials/bruno.webp',
    text: 'Precisei fazer a remoção da minha mãe de dentro da minha residência para o hospital, e os técnicos e motorista da ambulância foram super solícitos em colocar minha mãe na maca, visto que a maca não entrava no quarto. Eles foram super profissionais e acolhedores, recomendo o serviço da empresa.',
    context: 'Remoção domiciliar',
  },
  {
    name: 'Mara Reis',
    initials: 'MR',
    color: '#1FD29A',
    photo: '/img/testimonials/mara.webp',
    text: 'Profissionais excelentes, transportaram minha mãe de 93 anos com todo cuidado e carinho. Agradeço a toda equipe, sou grata à Viviane, à Dra. Eliana e ao motorista Rodrigo.',
    context: 'Transporte paciente idoso',
  },
  {
    name: 'Beatriz Netto',
    initials: 'BN',
    color: '#C5AA81',
    photo: '/img/testimonials/beatriz.webp',
    text: 'Recebi um atendimento maravilhoso por parte da empresa Savior e da técnica socorrista Ana Carolina e do motorista da ambulância Sérgio que prestaram o serviço de remoção e procedimentos com excelência. Muito obrigada.',
    context: 'Remoção com procedimentos',
  },
];

// Dados do Google Business Profile da Savior
export const GOOGLE_BUSINESS = {
  url: 'https://share.google/GZ7m1GMno4ibRxgYA',
  rating: 4.7,
  reviewCount: 346,
  name: 'SAVIOR Medical Service',
};

// Google Business Profile SP — https://share.google/Hihi3T31m6u9elsnx
export const GOOGLE_BUSINESS_SP = {
  url: 'https://share.google/Hihi3T31m6u9elsnx',
  rating: 4.7,
  reviewCount: 384,
  name: 'SAVIOR Medical Service São Paulo',
};

// Utilitário para gerar link do WhatsApp com tag de atribuição na mensagem
// O param `location` identifica qual CTA disparou (hero, final-cta, floating, etc.)
// A tag [campaign-location-v01] é gerada no SSG como fallback — o script
// wa-enhance.ts a substitui no client com os UTMs reais do cookie.
export function whatsappUrl(
  number: string,
  utmCampaign: string,
  message: string = 'Oi, preciso de ambulância.',
  location: string = 'unknown'
): string {
  const tag = `[${utmCampaign}-${location}-v01]`
  const params = new URLSearchParams({
    text: `${message} ${tag}`,
  })
  return `https://wa.me/${number}?${params.toString()}`
}
