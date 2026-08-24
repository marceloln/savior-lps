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
  { href: '/frota', label: 'Veículos', count: mockVtrs.length, desc: 'VTRs ativas na frota RJ e SP', icon: Truck, bg: 'var(--green-l)', color: 'var(--green-d)' },
  { href: '/equipe', label: 'Funcionários', count: mockFuncionariosDetail.length, desc: 'Motoristas, médicos e enfermeiros', icon: Users, bg: 'var(--blue-l)', color: 'var(--blue)' },
  { href: '/cadastros/fornecedores', label: 'Fornecedores', count: mockFornecedores.length, desc: 'Oficinas, postos e prestadores', icon: Building2, bg: 'var(--violet-l)', color: 'var(--violet)' },
  { href: '/cadastros/equipamentos', label: 'Equipamentos', count: mockEquipamentos.length, desc: 'Monitores, ventiladores e acessórios', icon: Stethoscope, bg: 'var(--amber-l)', color: 'var(--amber)' },
  { href: '/cadastros/documentos', label: 'Documentos', count: mockDocumentos.length, desc: 'CRLVs, CNHs, alvarás e seguros', icon: FileText, bg: 'var(--red-l)', color: 'var(--red)' },
  { href: '/cadastros/pneus', label: 'Pneus', count: mockPneusBackoffice.length, desc: 'Controle de vida útil e recapagem', icon: CircleDot, bg: 'var(--slate-l)', color: 'var(--slate)' },
  { href: '/cadastros/almoxarifados', label: 'Almoxarifados', count: mockWarehouses.length, desc: 'Estoques de peças RJ e SP', icon: Warehouse, bg: 'var(--green-l)', color: 'var(--green-d)' },
  { href: '/cadastros/os', label: 'Ordens de Serviço', count: mockOrdensServico.length, desc: 'Manutenções preventivas e corretivas', icon: Wrench, bg: 'var(--blue-l)', color: 'var(--blue)' },
  { href: '/cadastros/checklists', label: 'Checklists', count: 2, desc: 'Modelos de checklist e execuções diárias', icon: ClipboardCheck, bg: 'var(--green-l)', color: 'var(--green-d)' },
  { href: '/cadastros/orcamentos', label: 'Orçamentos', count: mockOrcamentosEvento.length, desc: 'Orçamentos de eventos com calculadora de preços', icon: Calculator, bg: 'var(--green-l)', color: 'var(--green-d)' },
];

export default function CadastrosPage() {
  return (
    <div>
      <div className="page-hd">
        <div>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>GESTÃO</p>
          <h1 className="page-title">Cadastros</h1>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginTop: 24 }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="hub-card">
              <div className="hub-card-icon" style={{ background: card.bg, color: card.color }}>
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
