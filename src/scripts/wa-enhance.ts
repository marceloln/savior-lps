// ============================================================
// WhatsApp Link Enhancer — enriquece hrefs WA com UTMs reais do cookie
// Executado após DOMContentLoaded, antes do usuário interagir
// Versão: 1.0.0
//
// Fluxo:
// 1. SSG gera href com tag base: "Mensagem [campaign-location-v01]"
// 2. Este script substitui pelo tag real com UTMs do cookie
// 3. Se cookie vazio, mantém a tag base gerada pelo SSG (retro-compat)
//
// NOTA: Este arquivo é a fonte documentada em TypeScript.
// O script inline equivalente está em src/layouts/Base.astro
// (bloco "WhatsApp link enhancer" antes de </body>).
// ============================================================

export {} // torna este arquivo um módulo TypeScript (evita colisão de escopo global)

const COOKIE_NAME = 'savior_utm'
const TAG_VERSION = 'v01'

interface UtmData {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  gclid?: string
}

function readUtm(): UtmData | null {
  // Prefere o objeto já parseado pelo utm-capture (evita re-parse do cookie)
  const cached = (window as unknown as Record<string, unknown>)._saviorUtm
  if (cached) return cached as UtmData

  // Fallback: lê o cookie diretamente
  const match = document.cookie.match('(^|;)\\s*' + COOKIE_NAME + '\\s*=\\s*([^;]+)')
  try {
    return match ? JSON.parse(decodeURIComponent(match[2])) : null
  } catch {
    return null
  }
}

function buildTag(campaign: string, loc: string, gclid?: string): string {
  const base = `[${campaign}-${loc}-${TAG_VERSION}]`
  return gclid ? `${base} [gclid:${gclid}]` : base
}

function enhanceWhatsAppLinks(): void {
  const utm = readUtm()
  if (!utm) return

  const campaign = utm.campaign ?? 'direct'
  const gclid = utm.gclid

  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-whatsapp]')
  links.forEach((a) => {
    const loc = a.dataset.location ?? 'unknown'
    const href = a.getAttribute('href')
    if (!href) return

    // Extrai a mensagem atual do parâmetro text=
    const urlMatch = href.match(/[?&]text=([^&]*)/)
    if (!urlMatch) return

    const rawMsg = decodeURIComponent(urlMatch[1])
    // Remove tag(s) de atribuição existentes no final (geradas no SSG ou por run anterior)
    const baseMsg = rawMsg.replace(/(\s*\[[^\]]+\])+$/, '').trimEnd()

    const tag = buildTag(campaign, loc, gclid)
    const newMsg = `${baseMsg} ${tag}`

    const newHref = href.replace(/([?&]text=)[^&]*/, (_, prefix) => {
      return prefix + encodeURIComponent(newMsg)
    })

    a.setAttribute('href', newHref)
  })
}

// Executa após o DOM estar disponível (pode já estar pronto se script está no final do body)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceWhatsAppLinks)
} else {
  enhanceWhatsAppLinks()
}
