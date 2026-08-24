'use client';

import Link from 'next/link';
import {
  Truck,
  Users,
  Building2,
  Stethoscope,
  FileText,
  CircleDot,
  Warehouse,
  Wrench,
  ClipboardCheck,
  Calculator,
} from 'lucide-react';
import {
  mockVtrs,
  mockFuncionariosDetail,
  mockFornecedores,
  mockEquipamentos,
  mockDocumentos,
  mockPneusBackoffice,
  mockWarehouses,
  mockOrdensServico,
  mockOrcamentosEvento,
} from '@/lib/mock-data';

const cards = [
  { href: '/frota', label: 'Veículos', count: mockVtrs.length, desc: 'VTRs ativas na frota RJ e SP', icon: Truck, bgCls: 'bg-green-l', colorCls: 'text-green-d' },
  { href: '/equipe', label: 'Funcionários', count: mockFuncionariosDetail.length, desc: 'Motoristas, médicos e enfermeiros', icon: Users, bgCls: 'bg-blue-l', colorCls: 'text-blue' },
  { href: '/cadastros/fornecedores', label: 'Fornecedores', count: mockFornecedores.length, desc: 'Oficinas, postos e prestadores', icon: Building2, bgCls: 'bg-violet-l', colorCls: 'text-violet' },
  { href: '/cadastros/equipamentos', label: 'Equipamentos', count: mockEquipamentos.length, desc: 'Monitores, ventiladores e acessórios', icon: Stethoscope, bgCls: 'bg-amber-l', colorCls: 'text-amber' },
  { href: '/cadastros/documentos', label: 'Documentos', count: mockDocumentos.length, desc: 'CRLVs, CNHs, alvarás e seguros', icon: FileText, bgCls: 'bg-red-l', colorCls: 'text-red' },
  { href: '/cadastros/pneus', label: 'Pneus', count: mockPneusBackoffice.length, desc: 'Controle de vida útil e recapagem', icon: CircleDot, bgCls: 'bg-slate-l', colorCls: 'text-slate-c' },
  { href: '/cadastros/almoxarifados', label: 'Almoxarifados', count: mockWarehouses.length, desc: 'Estoques de peças RJ e SP', icon: Warehouse, bgCls: 'bg-green-l', colorCls: 'text-green-d' },
  { href: '/cadastros/os', label: 'Ordens de Serviço', count: mockOrdensServico.length, desc: 'Manutenções preventivas e corretivas', icon: Wrench, bgCls: 'bg-blue-l', colorCls: 'text-blue' },
  { href: '/cadastros/checklists', label: 'Checklists', count: 2, desc: 'Modelos de checklist e execuções diárias', icon: ClipboardCheck, bgCls: 'bg-green-l', colorCls: 'text-green-d' },
  { href: '/cadastros/orcamentos', label: 'Orçamentos', count: mockOrcamentosEvento.length, desc: 'Orçamentos de eventos com calculadora de preços', icon: Calculator, bgCls: 'bg-green-l', colorCls: 'text-green-d' },
];

export default function CadastrosPage() {
  return (
    <div>
      <div className="page-hd">
        <div>
          <p className="breadcrumb breadcrumb-spaced">GESTÃO</p>
          <h1 className="page-title">Cadastros</h1>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="hub-card">
              <div className={`hub-card-icon ${card.bgCls} ${card.colorCls}`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div className="hub-card-count">{card.count}</div>
              <div className="hub-card-name">{card.label}</div>
              <div className="hub-card-desc">{card.desc}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
