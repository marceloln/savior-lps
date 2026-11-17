// Pauta de reunião montada com o que o lab sabe do projeto, na ordem do ritual da V30. Sem tela e sem modelo de IA.
import { FASES, somaDias, type EstadoLab, type Reuniao } from './dados';

const POR_BLOCO = 5;
const FECHO = 'Fecho: o que sai decidido hoje e quem é dono de cada próximo passo.';
/** A pauta que a equipe monta sempre abre pelo onde estamos. */
export const ehDaEquipe = (pauta: string) => pauta.startsWith('1. Onde estamos');
const dm = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** Monta a pauta da reunião: onde o projeto está, o que foi entregue, o que travou, o que vence logo, o que foi decidido
 * desde a última reunião e o fecho. Bloco sem nada fica de fora e cada bloco mostra no máximo cinco linhas, as mais novas. */
export function pautaDaReuniao(e: EstadoLab, r: Pick<Reuniao, 'projeto_id' | 'dia'> & { pauta?: string }, hoje: string): string {
  // o que quem marcou escreveu fica na pauta, também quando a equipe refaz a que já tinha montado
  const antes = r.pauta?.trim() ?? '';
  const assunto = !ehDaEquipe(antes) ? antes : antes.match(/^\d+\. Assunto de quem marcou: (.+)$/m)?.[1] ?? '';
  const proj = r.projeto_id ? e.projetos.find(p => p.id === r.projeto_id) : null;
  const blocos: [string, string[]][] = [];
  if (!proj) blocos.push(['Onde estamos: assuntos do lab, sem projeto.', []]);
  else {
    const nome = (id: string) => e.agentes.find(a => a.id === id)?.nome ?? id;
    const doProjeto = e.tarefas.filter(t => t.projeto_id === proj.id).sort((a, b) => b.id - a.id);
    const ate = somaDias(hoje, 7);
    // a última reunião feita do projeto marca o começo; sem ela, valem as duas últimas semanas
    const anterior = e.reunioes.filter(x => x.projeto_id === proj.id && x.status === 'feita' && x.dia < r.dia).map(x => x.dia).sort().at(-1) ?? somaDias(hoje, -14);
    const linhas = (l: string[]) => l.slice(0, POR_BLOCO).map(x => '- ' + x);
    blocos.push(
      [`Onde estamos: ${proj.nome}, fase ${FASES[proj.fase] ?? FASES[0]}, dia ${proj.dia} de 30.`, []],
      [assunto ? `Assunto de quem marcou: ${assunto}` : '', []],
      ['Entregue', linhas(doProjeto.filter(t => t.estado === 'feito').map(t => `${t.titulo}, ${nome(t.agente)}`))],
      ['Travado ou com prazo vencido', linhas(doProjeto.filter(t => t.estado !== 'feito' && t.prazo && t.prazo < hoje).map(t => `${t.titulo}, ${nome(t.agente)}, venceu em ${dm(t.prazo!)}`))],
      [`Andando e vence até ${dm(ate)}`, linhas(doProjeto.filter(t => t.estado !== 'feito' && t.prazo && t.prazo >= hoje && t.prazo <= ate).map(t => `${t.titulo}, ${nome(t.agente)}, vence em ${dm(t.prazo!)}`))],
      ['Decidido desde a última reunião, para confirmar', linhas(e.decisoes.filter(d => d.projeto_id === proj.id && d.criado_em.slice(0, 10) >= anterior).sort((a, b) => b.id - a.id).map(d => d.titulo))],
    );
  }
  const usados = blocos.filter(([titulo, l], i) => i === 0 || l.length > 0 || (titulo.startsWith('Assunto') && assunto));
  return [...usados, [FECHO, []] as [string, string[]]].flatMap(([titulo, l], i) => [`${i + 1}. ${titulo}`, ...l]).join('\n');
}
