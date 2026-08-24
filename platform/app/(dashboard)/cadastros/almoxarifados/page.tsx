'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { mockWarehouses } from '@/lib/mock-data';

export default function AlmoxarifadosPage() {
  return (
    <div>
      <div className="page-hd">
        <Link href="/cadastros" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </Link>
        <div style={{ flex: 1 }}>
          <p className="breadcrumb" style={{ marginBottom: 6 }}>CADASTROS</p>
          <h1 className="page-title">Almoxarifados</h1>
        </div>
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th className="th">ID</th>
              <th className="th">Nome</th>
              <th className="th">Filial</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockWarehouses.map((w) => (
              <tr key={w.id} className="table-row-click">
                <td className="td mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{w.id}</td>
                <td className="td" style={{ fontWeight: 600 }}>{w.nome}</td>
                <td className="td mono" style={{ fontSize: 11 }}>{w.uf}</td>
                <td className="td">
                  <span className={`pill ${w.ativo ? 'pill-green' : 'pill-slate'}`}>
                    {w.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
