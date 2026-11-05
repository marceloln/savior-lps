import { useCallback, useState } from 'react';
import { MapaPixi, type Alvo } from '../components/MapaPixi';
import { Janela } from '../components/Janela';
import { Menu, NOMES, type Entrada } from '../components/Menu';
import { Chat } from '../components/Chat';
import { EmBreve, FichaAgente, PainelZona } from '../components/Fichas';
import { useLab } from '../hooks/useLab';
import { ZONAS } from '../lib/lab';
import { EQUIPE } from '../lib/equipe';

type Aberta = { tipo: 'menu'; entrada: Entrada } | { tipo: 'zona'; id: string } | { tipo: 'agente'; id: string } | null;

export function Lab() {
  const { lab, gente, erro } = useLab();
  const [dica, setDica] = useState<{ alvo: Alvo; x: number; y: number }>({ alvo: null, x: 0, y: 0 });
  const [aberta, setAberta] = useState<Aberta>(null);
  const [contato, setContato] = useState('lia');
  const fecha = useCallback(() => setAberta(null), []);
  const onHover = useCallback((alvo: Alvo, x: number, y: number) => setDica({ alvo, x, y }), []);
  const onClique = useCallback((alvo: Alvo) => {
    setDica(d => ({ ...d, alvo: null }));
    if (!alvo) return setAberta(null);
    setAberta(alvo.tipo === 'zona' ? { tipo: 'zona', id: alvo.id } : { tipo: 'agente', id: alvo.agente.id });
  }, []);
  const conversaCom = (id: string) => {
    if (id === 'clara') return setAberta({ tipo: 'menu', entrada: 'briefing' });
    setContato(id); setAberta({ tipo: 'menu', entrada: 'conversar' });
  };
  const zonaAtiva = aberta?.tipo === 'zona' ? aberta.id : aberta?.tipo === 'agente' ? EQUIPE.find(m => m.id === aberta.id)?.zona ?? null : null;

  let janela = null;
  if (aberta && gente) {
    if (aberta.tipo === 'zona') {
      const z = ZONAS.find(q => q.id === aberta.id)!;
      janela = <Janela titulo={z.nome} sobre="Quem trabalha aqui" cor={z.cor} aoFechar={fecha}>
        <PainelZona zona={z.id} gente={gente} abreAgente={id => setAberta({ tipo: 'agente', id })} briefing={() => conversaCom('clara')} /></Janela>;
    } else if (aberta.tipo === 'agente') {
      const m = EQUIPE.find(q => q.id === aberta.id)!, z = ZONAS.find(q => q.id === m.zona)!;
      janela = <Janela titulo={m.nome} sobre={m.papel} cor={z.cor} aoFechar={fecha}><FichaAgente m={m} gente={gente} conversa={() => conversaCom(m.id)} /></Janela>;
    } else if (aberta.entrada === 'conversar') {
      janela = <Janela titulo="Conversar" sobre="Fale com qualquer especialista do lab" largura="larga" aoFechar={fecha}><Chat agente={contato} setAgente={setContato} gente={gente} /></Janela>;
    } else if (aberta.entrada === 'briefing') {
      janela = <Janela titulo="Briefing com a Clara" sobre="Uma pergunta por vez, até fechar o pedido" cor="#6FAE9E" aoFechar={fecha}><Chat agente="clara" setAgente={() => {}} gente={gente} so /></Janela>;
    } else {
      janela = <Janela titulo={NOMES[aberta.entrada]} aoFechar={fecha}><EmBreve entrada={aberta.entrada} /></Janela>;
    }
  }

  return (
    <div className="lab">
      {erro && <p className="falha-carga" role="alert">{erro}</p>}
      {lab && gente && <MapaPixi lab={lab} gente={gente} onHover={onHover} onClique={onClique} zonaAtiva={zonaAtiva} />}
      <header className="topo vidro">
        <span className="marca">V30</span>
        <span className="titulo"><b>Lab V30</b><small>{EQUIPE.length} especialistas no open space</small></span>
        <button className="atalho escuro" onClick={() => conversaCom('clara')}>Novo briefing</button>
      </header>
      {dica.alvo && !aberta && (
        <div className="dica vidro" style={{ left: Math.min(dica.x + 18, innerWidth - 280), top: dica.y + 18 }}>
          {dica.alvo.tipo === 'agente'
            ? <><b>{dica.alvo.agente.nome}</b><small>{dica.alvo.agente.papel}</small><small className="acao">Clique para abrir a ficha</small></>
            : <><b>{ZONAS.find(q => q.id === (dica.alvo as { id: string }).id)?.nome}</b><small className="acao">Clique para ver quem trabalha aqui</small></>}
        </div>
      )}
      {janela}
      <Menu ativo={aberta?.tipo === 'menu' ? aberta.entrada : null} abre={e => setAberta(a => (a?.tipo === 'menu' && a.entrada === e ? null : { tipo: 'menu', entrada: e }))} />
    </div>
  );
}
