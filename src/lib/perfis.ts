// Perfil de cada especialista: quem é, como fala, o que domina e o que guarda. Entra em toda conversa com a pessoa e aparece na ficha.
// O da equipe fixa mora em perfis.json. O do convidado vem junto dele, em convidados.json.
import fixos from './perfis.json';
import { convidadoDe, type Perfil } from './convidados';

export type { Perfil };

/** O perfil de quem tem um: equipe fixa e convidados do banco. Especialista criado pelos sócios não tem. */
export const perfilDe = (agente: string): Perfil | null => (fixos as Record<string, Perfil>)[agente] ?? convidadoDe(agente)?.perfil ?? null;

/** As partes do perfil com o título que aparece na ficha e no comando do modelo. Parte vazia não entra. */
export function partesDoPerfil(p: Perfil): { titulo: string; linhas: string[] }[] {
  return [
    { titulo: 'Como fala', linhas: p.tom },
    { titulo: 'O que domina', linhas: p.competencias ?? [] },
    { titulo: 'O que não quebra', linhas: p.regras ?? [] },
    { titulo: 'O que guarda de um projeto para o outro', linhas: p.aprende },
  ].filter(x => x.linhas.length > 0);
}

/** O perfil em texto corrido, para as instruções do modelo. */
export function textoDoPerfil(p: Perfil): string {
  return [p.identidade, ...partesDoPerfil(p).map(x => x.titulo + '.\n' + x.linhas.map(l => '- ' + l).join('\n'))].join('\n\n');
}
