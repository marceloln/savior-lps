import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface Candidate {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  state: string;
  status: string;
  cv_url: string | null;
  message: string | null;
  experience: string | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const STATUS_OPTIONS = ['novo', 'analisado', 'entrevista', 'aprovado', 'rejeitado'] as const;
type CandidateStatus = typeof STATUS_OPTIONS[number];

const STATUS_FLOW: Record<string, CandidateStatus[]> = {
  novo:       ['analisado', 'rejeitado'],
  analisado:  ['entrevista', 'rejeitado'],
  entrevista: ['aprovado', 'rejeitado'],
  aprovado:   [],
  rejeitado:  [],
};

const STATUS_VERB_LABELS: Record<string, string> = {
  analisado: 'Analisar',
  entrevista: 'Agendar entrevista',
  aprovado: 'Aprovar',
  rejeitado: 'Rejeitar',
};

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CandidaturasTab({ userEmail }: { userEmail: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterState, setFilterState] = useState('todos');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCandidates = useCallback(async () => {
    setError('');
    let query = supabase
      .from('savior_candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filterStatus !== 'todos') {
      query = query.eq('status', filterStatus);
    }
    if (filterState !== 'todos') {
      query = query.eq('state', filterState);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setCandidates((data as Candidate[]) ?? []);
    setLoading(false);
  }, [filterStatus, filterState]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  async function handleStatusChange(candidate: Candidate, newStatus: CandidateStatus) {
    if (newStatus === 'rejeitado' && !window.confirm('Tem certeza que deseja rejeitar esta candidatura?')) return;

    setSaving(true);
    const { error: updateError } = await supabase
      .from('savior_candidates')
      .update({ status: newStatus })
      .eq('id', candidate.id);

    setSaving(false);

    if (updateError) {
      showToast('Não foi possível atualizar o status.', 'error');
      return;
    }

    showToast(`Status alterado para ${newStatus}`);
    setSelectedCandidate(prev =>
      prev?.id === candidate.id ? { ...prev, status: newStatus } : prev
    );
    fetchCandidates();
  }

  if (loading) {
    return (
      <div>
        <div className="admin-header"><h1>Candidaturas</h1></div>
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
        <div className="admin-header"><h1>Candidaturas</h1></div>
        <div className="admin-card admin-error">
          <p>Não foi possível carregar as candidaturas.</p>
          <button className="admin-btn" onClick={fetchCandidates}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (candidates.length === 0 && filterStatus === 'todos' && filterState === 'todos') {
    return (
      <div>
        <div className="admin-header"><h1>Candidaturas</h1></div>
        <div className="admin-card admin-empty">
          <div className="admin-empty-icon">{'\u{1F4CB}'}</div>
          <h3>Nenhuma candidatura registrada ainda</h3>
          <p>As candidaturas do site serão sincronizadas aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Candidaturas</h1>
          <div className="admin-header-sub">{candidates.length} registro(s)</div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <select
          className="admin-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          className="admin-select"
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
        >
          <option value="todos">Todos os estados</option>
          <option value="RJ">RJ</option>
          <option value="SP">SP</option>
        </select>
      </div>

      {candidates.length === 0 ? (
        <div className="admin-card admin-empty">
          <div className="admin-empty-icon">{'\u{1F50D}'}</div>
          <h3>Nenhuma candidatura encontrada</h3>
          <p>Tente alterar os filtros.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id} className="clickable" onClick={() => setSelectedCandidate(c)}>
                    <td>{formatDate(c.created_at)}</td>
                    <td>{c.name}</td>
                    <td>{c.position}</td>
                    <td>{c.state}</td>
                    <td>{c.email}</td>
                    <td>
                      <span className={`admin-badge badge-${c.status}`}>
                        {c.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {STATUS_FLOW[c.status]?.length > 0 && (
                        <select
                          className="admin-select"
                          style={{ minWidth: 120, padding: '6px 28px 6px 10px', fontSize: 12 }}
                          value=""
                          aria-label={`Alterar status de ${c.name}`}
                          onChange={e => {
                            if (e.target.value) {
                              handleStatusChange(c, e.target.value as CandidateStatus);
                            }
                          }}
                        >
                          <option value="">Alterar status...</option>
                          {STATUS_FLOW[c.status].map(s => (
                            <option key={s} value={s}>
                              {STATUS_VERB_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Detalhes da candidatura</h2>
              <button className="admin-modal-close" aria-label="Fechar modal" onClick={() => setSelectedCandidate(null)}>
                {'\u00D7'}
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-row">
                <div className="detail-label">Nome</div>
                <div className="detail-value">{selectedCandidate.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email</div>
                <div className="detail-value">{selectedCandidate.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Telefone</div>
                <div className="detail-value">{selectedCandidate.phone ?? '--'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Cargo</div>
                <div className="detail-value">{selectedCandidate.position}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Estado</div>
                <div className="detail-value">{selectedCandidate.state}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className={`admin-badge badge-${selectedCandidate.status}`}>
                    {selectedCandidate.status}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Data de envio</div>
                <div className="detail-value">{formatDate(selectedCandidate.created_at)}</div>
              </div>
              {selectedCandidate.experience && (
                <div className="detail-row">
                  <div className="detail-label">Experiência</div>
                  <div className="detail-value">{selectedCandidate.experience}</div>
                </div>
              )}
              {selectedCandidate.message && (
                <div className="detail-row">
                  <div className="detail-label">Mensagem</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCandidate.message}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-actions">
              {STATUS_FLOW[selectedCandidate.status]?.map(nextStatus => (
                <button
                  key={nextStatus}
                  className={`admin-btn ${nextStatus === 'rejeitado' ? 'admin-btn-danger' : ''}`}
                  disabled={saving}
                  onClick={() => handleStatusChange(selectedCandidate, nextStatus)}
                >
                  {STATUS_VERB_LABELS[nextStatus] ?? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </button>
              ))}
              {selectedCandidate.cv_url && (
                <a
                  href={selectedCandidate.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Ver currículo
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
