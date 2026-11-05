import { EQUIPE, type Membro } from '../lib/equipe';
import { ZONAS } from '../lib/lab';
import { Retrato } from './Retrato';
import type { AtlasGente } from './MapaPixi';

export function FichaAgente({ m, gente, conversa }: { m: Membro; gente: AtlasGente; conversa: () => void }) {
  const z = ZONAS.find(q => q.id === m.zona)!;
  return (
    <div className="ficha">
      <Retrato id={m.id} tamanho={96} cor={z.cor + '40'} />
      <div>
        <p className="rotulo">{z.nome}</p>
        <p className="papel">{m.papel}</p>
        <button className="primario" onClick={conversa}>{m.id === 'clara' ? 'Começar briefing' : `Conversar com ${m.nome}`}</button>
      </div>
    </div>
  );
}

export function PainelZona({ zona, gente, abreAgente, briefing }: { zona: string; gente: AtlasGente; abreAgente: (id: string) => void; briefing: () => void }) {
  const time = EQUIPE.filter(m => m.zona === zona);
  return (
    <div className="zona">
      {time.length
        ? <ul className="time">{time.map(m => (
            <li key={m.id}><button onClick={() => abreAgente(m.id)}>
              <Retrato id={m.id} tamanho={40} cor="#F2EEE4" /><span><b>{m.nome}</b><small>{m.papel}</small></span>
            </button></li>))}</ul>
        : <p className="vazio">Ninguém tem mesa fixa aqui. É área de uso comum, cada um passa quando precisa.</p>}
      {zona === 'atendimento' && <button className="primario" onClick={briefing}>Começar briefing com a Clara</button>}
    </div>
  );
}

const PROXIMO: Record<string, string> = {
  clientes: 'A ficha de cada cliente, com setor, situação, fase e contatos por cargo, lida e gravada no banco.',
  projetos: 'A mesa com a planta azul, a pista do método, o kanban, o Gantt e o backlog.',
  agenda: 'Reuniões com o time e os mentores de IA, com ata e decisões registradas.',
  decisoes: 'O registro de decisões e o painel de dados do gerente.',
  conexoes: 'Os serviços ligados ao lab e os créditos de cada um.',
  trofeus: 'Conquistas, nível e energia da equipe.',
};
export function EmBreve({ entrada }: { entrada: string }) {
  return (
    <div className="em-breve">
      <p className="rotulo">Próxima etapa</p>
      <p>{PROXIMO[entrada]}</p>
      <p className="nota">Essa parte já existe no protótipo e está sendo trazida para o formato final.</p>
    </div>
  );
}
