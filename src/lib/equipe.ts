// Quem trabalha no lab e onde fica a mesa de cada um.
export type Membro = { id: string; nome: string; papel: string; zona: string };

export const EQUIPE: Membro[] = [
  { id: 'lia', nome: 'Lia', papel: 'Analista de diagnóstico', zona: 'estrategia' },
  { id: 'davi', nome: 'Davi', papel: 'Inteligência competitiva', zona: 'estrategia' },
  { id: 'rui', nome: 'Rui', papel: 'Gerente de projeto', zona: 'planejamento' },
  { id: 'nina', nome: 'Nina', papel: 'Processos lean', zona: 'planejamento' },
  { id: 'caio', nome: 'Caio', papel: 'Executivo de contas', zona: 'comercial' },
  { id: 'bela', nome: 'Bela', papel: 'Propostas', zona: 'comercial' },
  { id: 'iara', nome: 'Iara', papel: 'Direção de marca', zona: 'marca' },
  { id: 'theo', nome: 'Theo', papel: 'Conteúdo', zona: 'marca' },
  { id: 'duda', nome: 'Duda', papel: 'Tráfego e orquestração', zona: 'trafego' },
  { id: 'rosa', nome: 'Rosa', papel: 'Arquitetura de CX', zona: 'cx' },
  { id: 'beto', nome: 'Beto', papel: 'Operação de loja', zona: 'cx' },
  { id: 'lara', nome: 'Lara', papel: 'Ciência de dados', zona: 'dados' },
  { id: 'otto', nome: 'Otto', papel: 'Finanças e decisão', zona: 'dados' },
  { id: 'max', nome: 'Max', papel: 'Desenvolvimento e protótipo', zona: 'produto' },
  { id: 'ana', nome: 'Ana', papel: 'Agentes de IA', zona: 'produto' },
  { id: 'nico', nome: 'Nico', papel: 'Gestão de conhecimento', zona: 'arquivo' },
  { id: 'clara', nome: 'Clara', papel: 'Atendimento e briefing', zona: 'atendimento' },
];
