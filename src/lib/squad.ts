// Squad do convidado: quem é chamado para um projeto fica nele até o fim do ciclo de 30 dias. Sem tela.
import { somaDias, type Projeto } from './dados';

type ComProjeto = { projeto_id?: string | null };

/** Último dia em que o squad vale: o trigésimo dia do ciclo do projeto. */
export const fimDoSquad = (p: Pick<Projeto, 'inicio'>) => somaDias(p.inicio, 29);

/** Projeto em que o convidado está agora. Sem projeto, com o ciclo vencido ou com o projeto apagado, ele é do lab todo. */
export function noSquad(a: ComProjeto, projetos: Projeto[], hoje: string): Projeto | null {
  const p = a.projeto_id ? projetos.find(x => x.id === a.projeto_id) : undefined;
  return p && hoje <= fimDoSquad(p) ? p : null;
}

/** Se a pessoa pode receber missão de um pedido deste projeto. Quem está num squad só recebe do projeto dele. */
export const podeReceber = (a: ComProjeto, projeto_id: string | null, projetos: Projeto[], hoje: string) => {
  const p = noSquad(a, projetos, hoje);
  return !p || p.id === projeto_id;
};
