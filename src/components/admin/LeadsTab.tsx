import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  source_page: string | null;
  pipeline: string | null;
  campaign: string | null;
  status: string | null;
  pipedrive_deal_id: number | null;
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPipeline, setFilterPipeline] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [pipelines, setPipelines] = useState<string[]>([]);

  const fetchLeads = useCallback(async () => {
    setError('');
    let query = supabase
      .from('savior_leads_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filterPipeline !== 'todos') {
      query = query.eq('pipeline', filterPipeline);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom + 'T00:00:00');
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const allLeads = (data as Lead[]) ?? [];

    const uniquePipelines = [...new Set(allLeads.map(l => l.pipeline).filter(Boolean))] as string[];
    setPipelines(uniquePipelines);

    setLeads(allLeads);
    setLoading(false);
  }, [filterPipeline, dateFrom, dateTo]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = search
    ? leads.filter(l => {
        const q = search.toLowerCase();
        return (
          (l.name?.toLowerCase() ?? '').includes(q) ||
          (l.phone?.replace(/\D/g, '') ?? '').includes(q.replace(/\D/g, ''))
        );
      })
    : leads;

  if (loading) {
    return (
      <div>
        <div className="admin-header"><h1>Leads</h1></div>
        <div className="admin-card">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="admin-loading skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="admin-header"><h1>Leads</h1></div>
        <div className="admin-card admin-error">
          <p>Erro: {error}</p>
          <button className="admin-btn" onClick={fetchLeads}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (leads.length === 0 && !dateFrom && !dateTo && filterPipeline === 'todos') {
    return (
      <div>
        <div className="admin-header"><h1>Leads</h1></div>
        <div className="admin-card admin-empty">
          <div className="admin-empty-icon">{'\u{1F465}'}</div>
          <h3>Sincronizacao de leads ainda nao configurada</h3>
          <p>Os leads estao no Pipedrive. Quando a sincronizacao estiver ativa, eles aparecerao aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Leads</h1>
          <div className="admin-header-sub">{filteredLeads.length} registro(s)</div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <select
          className="admin-select"
          value={filterPipeline}
          onChange={e => setFilterPipeline(e.target.value)}
        >
          <option value="todos">Todos os pipelines</option>
          {pipelines.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="date"
          className="admin-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          title="Data inicio"
        />
        <input
          type="date"
          className="admin-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          title="Data fim"
        />
        <div className="admin-search-input">
          <input
            type="text"
            className="admin-input"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="admin-card admin-empty">
          <div className="admin-empty-icon">{'\u{1F50D}'}</div>
          <h3>Nenhum lead encontrado</h3>
          <p>Tente alterar os filtros de busca.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Pagina de origem</th>
                  <th>Pipeline</th>
                  <th>Campanha</th>
                  <th>Status</th>
                  <th>Pipedrive</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{formatDate(lead.created_at)}</td>
                    <td>{lead.name ?? '--'}</td>
                    <td>{lead.phone ?? '--'}</td>
                    <td>{lead.source_page ?? '--'}</td>
                    <td>{lead.pipeline ?? '--'}</td>
                    <td>{lead.campaign ?? '--'}</td>
                    <td>
                      {lead.status ? (
                        <span className="admin-badge badge-novo">{lead.status}</span>
                      ) : '--'}
                    </td>
                    <td>
                      {lead.pipedrive_deal_id ? (
                        <a
                          href={`https://savior.pipedrive.com/deal/${lead.pipedrive_deal_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          style={{ textDecoration: 'none', fontSize: 11 }}
                        >
                          Ver deal
                        </a>
                      ) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
