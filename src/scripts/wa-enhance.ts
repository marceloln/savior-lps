// ============================================================
// WhatsApp Link Enhancer v2 — Ref Code
// Gera código curto, armazena UTMs no Worker KV via POST /ref,
// e coloca apenas "Ref: XXXXX" na mensagem WA.
//
// Elimina as tags longas [campaign] [gclid:...] que poluíam
// a conversa no Blip e apareciam pro cliente no WhatsApp.
//
// Fluxo:
// 1. Página carrega → gera ref code (base36 timestamp + random)
// 2. POST fire-and-forget pro Worker /ref com UTM data
// 3. Atualiza todos os a[data-whatsapp] com "Msg Ref: XXXXX"
// 4. Blip webhook extrai Ref, consulta GET /ref/:code no Worker
//
// NOTA: Este arquivo é a fonte documentada em TypeScript.
// O script inline equivalente está em src/layouts/Base.astro
// (bloco "WhatsApp link enhancer — Ref code (v2)" antes de </body>).
// ============================================================

export {} // torna este arquivo um módulo TypeScript

const COOKIE_NAME = 'savior_utm'
const WORKER_URL = 'https://savior-lead-capture.marcelo-nascimento.workers.dev'

interface UtmData {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  gclid?: string
}

function readUtm(): UtmData | null {
  const cached = (window as unknown as Record<string, unknown>)._saviorUtm
  if (cached) return cached as UtmData

  const match = document.cookie.match('(^|;)\\s*' + COOKIE_NAME + '\\s*=\\s*([^;]+)')
  try {
    return match ? JSON.parse(decodeURIComponent(match[2])) : null
  } catch {
    return null
  }
}

function getGaClientId(): string {
  const match = document.cookie.match('(^|;)\\s*_ga\\s*=\\s*([^;]+)')
  if (!match) return ''
  const parts = match[2].split('.')
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : ''
}

function generateRef(): string {
  return Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 4)
}

function enhanceWhatsAppLinks(): void {
  const utm = readUtm()
  if (!utm) return

  const ref = generateRef()
  const campaign = utm.campaign ?? 'direct'
  const gclid = utm.gclid ?? ''
  const keyword = utm.term ?? ''
  const source = utm.source ?? 'direct'
  const medium = utm.medium ?? 'none'
  const gaClientId = getGaClientId()
  const page = location.pathname.replace(/^\/|\/$/g, '') || 'home'

  // Armazena ref → UTM no Worker KV (fire-and-forget)
  fetch(`${WORKER_URL}/ref`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref,
      campaign,
      gclid,
      kw: keyword,
      source,
      medium,
      ga_client_id: gaClientId,
      page,
    }),
  }).catch(() => {})

  // Atualiza links WA com mensagem limpa + ref code
  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-whatsapp]')
  links.forEach((a) => {
    const href = a.getAttribute('href')
    if (!href) return

    const urlMatch = href.match(/[?&]text=([^&]*)/)
    if (!urlMatch) return

    const rawMsg = decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ')
    // Remove tags antigas [xxx] e Ref: antigos, limpa + encoding
    const baseMsg = rawMsg
      .replace(/(\s*\[[^\]]+\])+$/, '')
      .replace(/\s*Ref:\s*\w+$/, '')
      .trimEnd()

    const newHref = href.replace(/([?&]text=)[^&]*/, (_, prefix) => {
      return prefix + encodeURIComponent(`${baseMsg} Ref: ${ref}`)
    })

    a.setAttribute('href', newHref)
  })

  // Expõe ref para o click handler e debug
  ;(window as unknown as Record<string, unknown>)._saviorRef = ref
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceWhatsAppLinks)
} else {
  enhanceWhatsAppLinks()
}
