import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface AdsData {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

interface AdsDailyEntry {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

interface AdsCampaign {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

interface StatsData {
  ads: AdsData;
  ads_daily: AdsDailyEntry[];
  ads_campaigns: AdsCampaign[];
  ga4: { sessions: number; events: { whatsapp_click: number; phone_click: number } };
  blip: { active_rj: number; active_sp: number };
  pipedrive: { deals: number; persons: number };
}

const STATS_URL = 'https://savior-stats-api.marcelo-4f2.workers.dev/stats-data.json';
const REFRESH_INTERVAL = 5 * 60 * 1000;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + '%';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

  const { ads, ads_daily, ads_campaigns, ga4, blip } = stats;
  const totalBlipTickets = blip.active_rj + blip.active_sp;

  const cpa = ads.conversions > 0 ? ads.cost / ads.conversions : 0;
  const ctr = ads.impressions > 0 ? ads.clicks / ads.impressions : 0;

  const maxImpressions = Math.max(...(ads_daily?.map(d => d.impressions) ?? [1]), 1);
  const maxClicks = Math.max(...(ads_daily?.map(d => d.clicks) ?? [1]), 1);
  const maxConversions = Math.max(...(ads_daily?.map(d => d.conversions) ?? [1]), 1);
  const chartMax = Math.max(maxImpressions, maxClicks, maxConversions, 1);

  const last7 = (ads_daily ?? []).slice(-7);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <div className="admin-header-sub">
            Atualizado a cada 5 minutos
          </div>
        </div>
        <button className="admin-btn-secondary admin-btn" onClick={fetchData}>
          Atualizar
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi">
          <div className="kpi-label">Conversoes (total)</div>
          <div className="kpi-value">{formatNumber(ads.conversions)}</div>
          <div className="kpi-change positive">CPA: {formatCurrency(cpa)}</div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Sessoes GA4</div>
          <div className="kpi-value">{formatNumber(ga4.sessions)}</div>
          <div className="kpi-change positive">
            WA: {formatNumber(ga4.events.whatsapp_click)} | Tel: {formatNumber(ga4.events.phone_click)}
          </div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Tickets Blip</div>
          <div className="kpi-value">{formatNumber(totalBlipTickets)}</div>
          <div className="kpi-change positive">
            RJ: {formatNumber(blip.active_rj)} | SP: {formatNumber(blip.active_sp)}
          </div>
        </div>
        <div className="admin-kpi">
          <div className="kpi-label">Agendamentos pendentes</div>
          <div className="kpi-value">{formatNumber(pendingBookings)}</div>
          <div className="kpi-change" style={{ color: 'var(--admin-amber)' }}>
            Aguardando confirmacao
          </div>
        </div>
      </div>

      {last7.length > 0 && (
        <div className="admin-card admin-chart-container">
          <div className="admin-chart-title">Desempenho diario (ultimos 7 dias)</div>
          <div className="admin-chart">
            {last7.map(day => {
              const impH = Math.max((day.impressions / chartMax) * 100, 1);
              const clkH = Math.max((day.clicks / chartMax) * 100, 1);
              const convH = Math.max((day.conversions / chartMax) * 100, 1);
              return (
                <div key={day.date} className="admin-chart-day">
                  <div className="admin-chart-bars">
                    <div
                      className="admin-chart-bar impressions"
                      style={{ height: `${impH}%` }}
                      title={`Impressoes: ${formatNumber(day.impressions)}`}
                    />
                    <div
                      className="admin-chart-bar clicks"
                      style={{ height: `${clkH}%` }}
                      title={`Cliques: ${formatNumber(day.clicks)}`}
                    />
                    <div
                      className="admin-chart-bar conversions"
                      style={{ height: `${convH}%` }}
                      title={`Conversoes: ${formatNumber(day.conversions)}`}
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
              Impressoes
            </div>
            <div className="admin-chart-legend-item">
              <div className="admin-chart-legend-dot" style={{ background: 'var(--admin-green)' }} />
              Cliques
            </div>
            <div className="admin-chart-legend-item">
              <div className="admin-chart-legend-dot" style={{ background: 'var(--admin-amber)' }} />
              Conversoes
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
                <th className="text-right">Impressoes</th>
                <th className="text-right">Cliques</th>
                <th className="text-right">Conversoes</th>
                <th className="text-right">Custo</th>
                <th className="text-right">CPA</th>
                <th className="text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {(ads_campaigns ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray" style={{ padding: 32 }}>
                    Nenhuma campanha encontrada
                  </td>
                </tr>
              ) : (
                ads_campaigns.map((camp, idx) => {
                  const campCpa = camp.conversions > 0 ? camp.cost / camp.conversions : 0;
                  const campCtr = camp.impressions > 0 ? camp.clicks / camp.impressions : 0;
                  return (
                    <tr key={idx}>
                      <td>{camp.name}</td>
                      <td className="text-right">{formatNumber(camp.impressions)}</td>
                      <td className="text-right">{formatNumber(camp.clicks)}</td>
                      <td className="text-right">{formatNumber(camp.conversions)}</td>
                      <td className="text-right">{formatCurrency(camp.cost)}</td>
                      <td className="text-right">{camp.conversions > 0 ? formatCurrency(campCpa) : '--'}</td>
                      <td className="text-right">{formatPercent(campCtr)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {ads_campaigns.length > 0 && (
          <div style={{ borderTop: '1px solid var(--admin-card-border)', marginTop: 8, paddingTop: 12 }}>
            <table className="admin-table">
              <tbody>
                <tr style={{ fontWeight: 600 }}>
                  <td>Total</td>
                  <td className="text-right">{formatNumber(ads.impressions)}</td>
                  <td className="text-right">{formatNumber(ads.clicks)}</td>
                  <td className="text-right">{formatNumber(ads.conversions)}</td>
                  <td className="text-right">{formatCurrency(ads.cost)}</td>
                  <td className="text-right">{ads.conversions > 0 ? formatCurrency(cpa) : '--'}</td>
                  <td className="text-right">{formatPercent(ctr)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
