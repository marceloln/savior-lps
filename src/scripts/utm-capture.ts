// ============================================================
// UTM Capture — captura, persiste e expõe parâmetros de atribuição
// Executado de forma síncrona no <head>, ANTES do GTM iniciar
// Versão: 1.0.0
//
// NOTA: Este arquivo é a fonte documentada em TypeScript.
// O script inline equivalente está em src/layouts/Base.astro
// (bloco "UTM Capture — ANTES do GTM").
// Edite AQUI, depois reflita a mudança no Base.astro.
// ============================================================

export {} // torna este arquivo um módulo TypeScript (evita colisão de escopo global)

const COOKIE_NAME = 'savior_utm'
const COOKIE_TTL = 30 * 24 * 60 * 60 // 30 dias em segundos

interface UtmData {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  gclid?: string
  first_landing?: string
  first_seen_at?: number
}

function parseCookie(name: string): UtmData | null {
  const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
  try {
    return match ? JSON.parse(decodeURIComponent(match[2])) : null
  } catch {
    return null
  }
}

function setCookie(name: string, value: UtmData, seconds: number): void {
  try {
    document.cookie =
      `${name}=${encodeURIComponent(JSON.stringify(value))}` +
      `;max-age=${seconds};path=/;SameSite=Lax`
  } catch {
    // Cookies desabilitados — graceful degradation (só perde persistência)
  }
}

const params = new URLSearchParams(location.search)
const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const fromUrl: Record<string, string> = {}
let hasUtm = false

utmKeys.forEach((k) => {
  const v = params.get(k)
  if (v) {
    fromUrl[k.replace('utm_', '')] = v
    hasUtm = true
  }
})

// gclid — Google Click ID, necessário para Enhanced Conversions do Google Ads
const gclid = params.get('gclid')
if (gclid) {
  fromUrl.gclid = gclid
  hasUtm = true
}

const stored = parseCookie(COOKIE_NAME)
let attr: UtmData

if (hasUtm) {
  // UTMs na URL: sobrescreve cookie mas preserva first-touch
  attr = Object.assign(stored ?? {}, fromUrl)
  if (!attr.first_landing) attr.first_landing = location.pathname
  if (!attr.first_seen_at) attr.first_seen_at = Date.now()
  setCookie(COOKIE_NAME, attr, COOKIE_TTL)
} else if (stored) {
  // Sem UTMs na URL mas cookie existe: usa o que está persistido
  attr = stored
} else {
  // Visita direta sem histórico: marca como direct
  attr = { source: 'direct', medium: 'none', campaign: 'direct' }
}

// Expõe globalmente para wa-enhance.ts ler sem re-parsear o cookie
;(window as unknown as Record<string, unknown>)._saviorUtm = attr

// Push no dataLayer ANTES do GTM iniciar — GTM consegue ler na primeira tag
const w = window as unknown as Record<string, unknown[]>
w.dataLayer = (w.dataLayer as unknown[]) || []
;(w.dataLayer as unknown[]).push({
  event: 'utm_loaded',
  attribution: {
    source: attr.source ?? 'direct',
    medium: attr.medium ?? 'none',
    campaign: attr.campaign ?? 'direct',
    content: attr.content ?? '',
    term: attr.term ?? '',
    gclid: attr.gclid ?? '',
    first_landing: attr.first_landing ?? location.pathname,
    first_seen_at: attr.first_seen_at ?? Date.now(),
  },
})
