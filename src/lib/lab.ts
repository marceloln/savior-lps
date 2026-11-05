// Tipos do que o Blender exporta em public/assets/lab.json
export type Ponto = { x: number; y: number; olha: string | null };
export type Vec3 = [number, number, number];
export type DadosLab = {
  X: number; Y: number; k: number; larg: number; alt: number;
  R: Vec3; U: Vec3; D: Vec3; centro: Vec3; dist: number; prof: [number, number];
  zonas: Record<string, [number, number, number, number]>;
  obst: [number, number, number, number][];
  pontos: Record<string, Ponto[]>;
  telas: Record<string, Vec3[]>;
  objetos: { id: string; info: string; r: [number, number, number, number]; alt: number }[];
};

export type Zona = { id: string; nome: string; curto: string; cor: string };

export const ZONAS: Zona[] = [
  { id: 'estrategia', nome: 'Estratégia e Diagnóstico', curto: 'ESTRATÉGIA', cor: '#D46A47' },
  { id: 'planejamento', nome: 'Planejamento e PMO', curto: 'PLANEJAMENTO', cor: '#4F86C6' },
  { id: 'comercial', nome: 'Comercial', curto: 'COMERCIAL', cor: '#7FB069' },
  { id: 'arquivo', nome: 'Arquivo de clientes', curto: 'ARQUIVO', cor: '#A88A5C' },
  { id: 'reuniao', nome: 'Sala de reunião', curto: 'REUNIÃO', cor: '#5FA9C2' },
  { id: 'marca', nome: 'Marca e Conteúdo', curto: 'MARCA', cor: '#C95C8A' },
  { id: 'trafego', nome: 'Tráfego', curto: 'TRÁFEGO', cor: '#E9B949' },
  { id: 'cx', nome: 'CX e Operação de loja', curto: 'CX E LOJA', cor: '#3FA7A0' },
  { id: 'produto', nome: 'Produto, IA e Prototipagem', curto: 'LAB DE PROTOTIPAGEM', cor: '#E59A3C' },
  { id: 'dados', nome: 'Data Science e Decisões', curto: 'DADOS', cor: '#8E7CC3' },
  { id: 'academia', nome: 'Academia de skills', curto: 'ACADEMIA', cor: '#5FB6D9' },
  { id: 'lounge', nome: 'Lounge', curto: 'LOUNGE', cor: '#B98B5E' },
  { id: 'atendimento', nome: 'Atendimento', curto: 'ATENDIMENTO', cor: '#6FAE9E' },
];

export function zonaEm(lab: DadosLab, x: number, y: number): Zona | null {
  for (const z of ZONAS) {
    const r = lab.zonas[z.id];
    if (r && x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]) return z;
  }
  return null;
}
