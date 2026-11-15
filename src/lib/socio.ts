// Como o lab chama quem entrou, a partir do e-mail que o login da equipe entrega. Sem tela.

/** Nome de exibição: a parte antes da arroba, com ponto, traço e sublinhado virando espaço e cada palavra em maiúscula. */
export function nomeDoSocio(email: string | null): string {
  if (!email || !email.includes('@')) return 'Visitante';
  const partes = email.split('@')[0].split(/[._-]+/).filter(Boolean);
  return partes.map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(' ') || 'Visitante';
}

/** Até duas letras para o círculo do sócio. */
export function iniciaisDoSocio(email: string | null): string {
  const n = nomeDoSocio(email).split(' ');
  return email ? (n[0][0] + (n[1]?.[0] ?? '')).toUpperCase() : '?';
}
