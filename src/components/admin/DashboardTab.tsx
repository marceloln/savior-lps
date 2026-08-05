import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface FunilPeriodo {
  impressions: number;
  ad_clicks: number;
  sessions: number;
  wa_clicks: number;
  blip: number;
  blip_closed: number;
  cost: number;
  conversions: number;
  blip_contacts: number;
}

interface DailyEntry {
  date: string;
  clicks: number;
  cost: number;
  conv: number;
  impr: number;
  sessions: number;
  blip: number;
  blip_closed: number;
  blip_rj: number;
  blip_sp: number;
  blip_contacts: number;
  rj_clicks: number;
  rj_cost: number;
  rj_conv: number;
  sp_clicks: number;
  sp_cost: number;
  sp_conv: number;
}

interface Campaign {
  Campanha: string;
  Impressoes: number;
  Cliques: number;
  'Custo RS': number;
  Conv: number;
  'CPA RS': number;
}

interface AdsResumo {
  Impressoes: number;
  Cliques: number;
  CTR: string;
  'Gasto RS': number;
  Conversoes: number;
  'CPA RS': number;
}

interface StatsData {
  gerado_em: string;
  ads: {
    resumo: AdsResumo;
    campanhas: Campaign[];
  };
  funil: {
    hoje: FunilPeriodo;
    ontem: FunilPeriodo;
  };
  daily: DailyEntry[];
  resumo: {
    pessoas: number;
    empresas: number;
    leads_wa_30d: number;
    formularios_30d: number;
  };
}

const STATS_URL = 'https://savior-stats-api.marcelo-4f2.workers.dev/stats-data.json';
const REFRESH_INTERVAL = 5 * 60 * 1000;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function parseGeradoEm(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function changeIndicator(atual: number, anterior: number): React.ReactNode {
  if (anterior === 0 && atual === 0) return null;
  const diff = atual - anterior;
  if (diff === 0) return <span style={{ color: 'var(--admin-muted)' }}>= ontem</span>;
  const arrow = diff > 0 ? '↑' : '↓';
  const color = diff > 0 ? 'var(--admin-green)' : 'var(--admin-alert)';
  return <span style={{ color }}>{arrow} {Math.abs(Math.round(diff))} vs ontem</span>;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError('');

      const [statsRes, bookingsRes] = await Promise.all([
        fetch(STATS_URL),
        supabase
          .from('savior_bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pendente'),
      ]);

      if (!statsRes.ok) throw new Error('Falha ao carregar estatísticas');

      const data: StatsData = await statsRes.json();
      setStats(data);
      setPendingBookings(bookingsRes.count ?? 0);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div>
        <div className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <div className="admin-header-sub">Carregando dados...</div>
          </div>
        </div>
        <div className="admin-kpi-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="admin-loading skeleton-kpi" />
          ))}
        </div>
        <div className="admin-loading skeleton-chart" style={{ marginBottom: 28 }} />
        <div className="admin-card">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-loading skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="admin-header">
          <h1>Dashboard</h1>
        </div>
        <div className="admin-card admin-error">
          <p>Erro ao carregar dados: {error}</p>
          <button className="admin-btn" onClick={fetchData}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const hoje = stats.funil?.hoje ?? {} as FunilPeriodo;
  const ontem = stats.funil?.ontem ?? {} as FunilPeriodo;
  const campanhas = stats.ads?.campanhas ?? [];
  const resumo = stats.ads?.resumo;
  const daily = stats.daily ?? [];

  const last7 = daily.slice(-7);

  const maxImpr = Math.max(...last7.map(d => d.impr ?? 0), 1);
  const maxClicks = Math.max(...last7.map(d => d.clicks ?? 0), 1);
  const maxConv = Math.max(...last7.map(d => d.conv ?? 0), 1);
  const chartMax = Math.max(maxImpr, maxClicks, maxConv, 1);

  const totalCpa = resumo?.['CPA RS'] ?? 0;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <div className="admin-header-sub">
            {stats.gerado_em
              ? `Atualizado às ${parseGeradoEm(stats.gerado_em)}`
              : 'Atualizado a cada 5 minutos'}
          </div>
        </div>
        <button className="admin-btn-secondary admin-btn" onClick={fetchData}>
          Atualizar
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi">
          <div className="kpi-label">Conversões hoje</div>
          <div className="kpi-value">{formatNumber(hoje.conversions ?? 0)}</div>
          <div className="kpi-change">
            {changeIndicator(hoje.conversions ?? 0, ontem.conversions ?? 0)}
          </div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Sessões hoje</div>
          <div className="kpi-value">{formatNumber(hoje.sessions ?? 0)}</div>
          <div className="kpi-change positive">
            WA: {formatNumber(hoje.wa_clicks ?? 0)}
          </div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Blip hoje</div>
          <div className="kpi-value">{formatNumber(hoje.blip ?? 0)}</div>
          <div className="kpi-change positive">
            Fechados: {formatNumber(hoje.blip_closed ?? 0)}
          </div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Agendamentos pendentes</div>
          <div className="kpi-value">{formatNumber(pendingBookings)}</div>
          <div className="kpi-change" style={{ color: 'var(--admin-amber)' }}>
            Aguardando confirmação
          </div>
        </div>
      </div>

      {last7.length > 0 && (
        <div className="admin-card admin-chart-container">
          <div className="admin-chart-title">Desempenho diário (últimos 7 dias)</div>
          <div className="admin-chart">
            {last7.map(day => {
              const impH = Math.max(((day.impr ?? 0) / chartMax) * 100, 1);
              const clkH = Math.max(((day.clicks ?? 0) / chartMax) * 100, 1);
              const convH = Math.max(((day.conv ?? 0) / chartMax) * 100, 1);
              return (
                <div key={day.date} className="admin-chart-day">
                  <div className="admin-chart-bars">
                    <div
                      className="admin-chart-bar impressions"
                      style={{ height: `${impH}%` }}
                      title={`Impressões: ${formatNumber(day.impr ?? 0)}`}
                    />
                    <div
                      className="admin-chart-bar clicks"
                      style={{ height: `${clkH}%` }}
                      title={`Cliques: ${formatNumber(day.clicks ?? 0)}`}
                    />
                    <div
                      className="admin-chart-bar conversions"
                      style={{ height: `${convH}%` }}
                      title={`Conversões: ${formatNumber(day.conv ?? 0)}`}
                    />
                  </div>
                  <div className="admin-chart-date">{formatDate(day.date)}</div>
                </div>
              );
            })}
          </div>
          <div className="admin-chart-legend">
            <div className="admin-chart-legend-item">
              <div className="admin-chart-legend-dot" style={{ background: 'rgba(59,130,246,0.5)' }} />
              Impressões
            </div>
            <div className="admin-chart-legend-item">
              <div className="admin-chart-legend-dot" style={{ background: 'var(--admin-green)' }} />
              Cliques
            </div>
            <div className="admin-chart-legend-item">
              <div className="admin-chart-legend-dot" style={{ background: 'var(--admin-amber)' }} />
              Conversões
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-section-title">Performance por campanha</div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campanha</th>
                <th className="text-right">Impressões</th>
                <th className="text-right">Cliques</th>
                <th className="text-right">Conversões</th>
                <th className="text-right">Custo</th>
                <th className="text-right">CPA</th>
                <th className="text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray" style={{ padding: 32 }}>
                    Nenhuma campanha encontrada
                  </td>
                </tr>
              ) : (
                campanhas.map((camp, idx) => {
                  const campCpa = camp['CPA RS'] ?? 0;
                  const campCtr = (camp.Impressoes ?? 0) > 0
                    ? (camp.Cliques ?? 0) / (camp.Impressoes ?? 1)
                    : 0;
                  return (
                    <tr key={idx}>
                      <td>{camp.Campanha ?? '--'}</td>
                      <td className="text-right">{formatNumber(camp.Impressoes ?? 0)}</td>
                      <td className="text-right">{formatNumber(camp.Cliques ?? 0)}</td>
                      <td className="text-right">{formatNumber(camp.Conv ?? 0)}</td>
                      <td className="text-right">{formatCurrency(camp['Custo RS'] ?? 0)}</td>
                      <td
                        className="text-right"
                        style={{
                          color: (camp.Conv ?? 0) > 0
                            ? (campCpa > 45 ? 'var(--admin-alert)' : 'var(--admin-green)')
                            : undefined,
                        }}
                      >
                        {(camp.Conv ?? 0) > 0 ? formatCurrency(campCpa) : '--'}
                      </td>
                      <td className="text-right">{formatPercent(campCtr)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {campanhas.length > 0 && resumo && (
          <div style={{ borderTop: '1px solid var(--admin-card-border)', marginTop: 8, paddingTop: 12 }}>
            <table className="admin-table">
              <tbody>
                <tr style={{ fontWeight: 600 }}>
                  <td>Total</td>
                  <td className="text-right">{formatNumber(resumo.Impressoes ?? 0)}</td>
                  <td className="text-right">{formatNumber(resumo.Cliques ?? 0)}</td>
                  <td className="text-right">{formatNumber(resumo.Conversoes ?? 0)}</td>
                  <td className="text-right">{formatCurrency(resumo['Gasto RS'] ?? 0)}</td>
                  <td
                    className="text-right"
                    style={{
                      color: (resumo.Conversoes ?? 0) > 0
                        ? (totalCpa > 45 ? 'var(--admin-alert)' : 'var(--admin-green)')
                        : undefined,
                    }}
                  >
                    {(resumo.Conversoes ?? 0) > 0 ? formatCurrency(totalCpa) : '--'}
                  </td>
                  <td className="text-right">{resumo.CTR ?? '--'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
