import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface Hospital {
  id: string;
  name: string;
  city: string;
}

interface StatusHistoryEntry {
  status: string;
  at: string;
  by: string;
}

interface Booking {
  id: string;
  created_at: string;
  patient_name: string;
  patient_phone: string;
  origin: string;
  destination: string;
  booking_type: string;
  status: string;
  payment_method: string;
  notes: string | null;
  scheduled_at: string | null;
  status_history: StatusHistoryEntry[];
  hospital_id: string | null;
  savior_hospitals: Hospital | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const STATUS_OPTIONS = ['pendente', 'confirmado', 'em_rota', 'realizado', 'cancelado'] as const;
type BookingStatus = typeof STATUS_OPTIONS[number];

const STATUS_FLOW: Record<string, BookingStatus[]> = {
  pendente:   ['confirmado', 'cancelado'],
  confirmado: ['em_rota', 'cancelado'],
  em_rota:    ['realizado', 'cancelado'],
  realizado:  [],
  cancelado:  [],
};

function formatDateTime(dt: string | null): string {
  if (!dt) return '--';
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('pt-BR');
}

export default function AgendamentosTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalNote, setModalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchBookings = useCallback(async () => {
    setError('');
    let query = supabase
      .from('savior_bookings')
      .select('*, savior_hospitals(id, name, city)')
      .order('created_at', { ascending: false });

    if (filterStatus !== 'todos') {
      query = query.eq('status', filterStatus);
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

    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleStatusChange(booking: Booking, newStatus: BookingStatus, userEmail: string) {
    setSaving(true);
    const updatedHistory: StatusHistoryEntry[] = [
      ...(booking.status_history ?? []),
      { status: newStatus, at: new Date().toISOString(), by: userEmail },
    ];

    const { error: updateError } = await supabase
      .from('savior_bookings')
      .update({ status: newStatus, status_history: updatedHistory })
      .eq('id', booking.id);

    setSaving(false);

    if (updateError) {
      showToast('Erro ao atualizar status: ' + updateError.message, 'error');
      return;
    }

    showToast(`Status alterado para ${newStatus}`);
    setSelectedBooking(prev =>
      prev?.id === booking.id
        ? { ...prev, status: newStatus, status_history: updatedHistory }
        : prev
    );
    fetchBookings();
  }

  async function handleSaveNote(booking: Booking) {
    setSaving(true);
    const { error: updateError } = await supabase
      .from('savior_bookings')
      .update({ notes: modalNote })
      .eq('id', booking.id);

    setSaving(false);

    if (updateError) {
      showToast('Erro ao salvar nota: ' + updateError.message, 'error');
      return;
    }

    showToast('Nota salva');
    setSelectedBooking(prev =>
      prev?.id === booking.id ? { ...prev, notes: modalNote } : prev
    );
    fetchBookings();
  }

  function openModal(booking: Booking) {
    setSelectedBooking(booking);
    setModalNote(booking.notes ?? '');
  }

  if (loading) {
    return (
      <div>
        <div className="admin-header"><h1>Agendamentos</h1></div>
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
        <div className="admin-header"><h1>Agendamentos</h1></div>
        <div className="admin-card admin-error">
          <p>Erro: {error}</p>
          <button className="admin-btn" onClick={fetchBookings}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Agendamentos</h1>
          <div className="admin-header-sub">{bookings.length} registro(s)</div>
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
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
        <input
          type="date"
          className="admin-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          placeholder="Data inicio"
          title="Data inicio"
        />
        <input
          type="date"
          className="admin-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          placeholder="Data fim"
          title="Data fim"
        />
      </div>

      {bookings.length === 0 ? (
        <div className="admin-card admin-empty">
          <div className="admin-empty-icon">{'\u{1F691}'}</div>
          <h3>Nenhum agendamento encontrado</h3>
          <p>Altere os filtros ou aguarde novos agendamentos.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="clickable" onClick={() => openModal(b)}>
                    <td>{formatDateTime(b.scheduled_at ?? b.created_at)}</td>
                    <td>{b.patient_name}</td>
                    <td>{b.origin}</td>
                    <td>{b.destination}</td>
                    <td>{b.booking_type}</td>
                    <td>
                      <span className={`admin-badge badge-${b.status}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{b.payment_method ?? '--'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {STATUS_FLOW[b.status]?.length > 0 && (
                        <select
                          className="admin-select"
                          style={{ minWidth: 120, padding: '6px 28px 6px 10px', fontSize: 12 }}
                          value=""
                          onChange={e => {
                            if (e.target.value) {
                              handleStatusChange(b, e.target.value as BookingStatus, 'admin');
                            }
                          }}
                        >
                          <option value="">Alterar...</option>
                          {STATUS_FLOW[b.status].map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
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

      {selectedBooking && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Detalhes do agendamento</h2>
              <button className="admin-modal-close" onClick={() => setSelectedBooking(null)}>
                {'\u00D7'}
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-row">
                <div className="detail-label">Paciente</div>
                <div className="detail-value">{selectedBooking.patient_name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Telefone</div>
                <div className="detail-value">
                  {selectedBooking.patient_phone}
                  {selectedBooking.patient_phone && (
                    <a
                      href={`https://wa.me/55${selectedBooking.patient_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-sm"
                      style={{ marginLeft: 12, textDecoration: 'none', fontSize: 11 }}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Origem</div>
                <div className="detail-value">{selectedBooking.origin}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Destino</div>
                <div className="detail-value">{selectedBooking.destination}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Tipo</div>
                <div className="detail-value">{selectedBooking.booking_type}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className={`admin-badge badge-${selectedBooking.status}`}>
                    {selectedBooking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Pagamento</div>
                <div className="detail-value">{selectedBooking.payment_method ?? '--'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Agendado para</div>
                <div className="detail-value">{formatDateTime(selectedBooking.scheduled_at)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Criado em</div>
                <div className="detail-value">{formatDateTime(selectedBooking.created_at)}</div>
              </div>
              {selectedBooking.savior_hospitals && (
                <div className="detail-row">
                  <div className="detail-label">Hospital</div>
                  <div className="detail-value">
                    {selectedBooking.savior_hospitals.name} ({selectedBooking.savior_hospitals.city})
                  </div>
                </div>
              )}

              {(selectedBooking.status_history ?? []).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="detail-label" style={{ marginBottom: 8 }}>Historico de status</div>
                  {selectedBooking.status_history.map((entry, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--admin-gray)', marginBottom: 4 }}>
                      <span className={`admin-badge badge-${entry.status}`} style={{ marginRight: 8 }}>
                        {entry.status.replace('_', ' ')}
                      </span>
                      {formatDateTime(entry.at)} por {entry.by}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-gray)', display: 'block', marginBottom: 6 }}>
                  Observacoes
                </label>
                <textarea
                  className="admin-textarea"
                  value={modalNote}
                  onChange={e => setModalNote(e.target.value)}
                  placeholder="Adicionar observacao..."
                />
              </div>
            </div>

            <div className="admin-modal-actions">
              {STATUS_FLOW[selectedBooking.status]?.map(nextStatus => (
                <button
                  key={nextStatus}
                  className={`admin-btn ${nextStatus === 'cancelado' ? 'admin-btn-danger' : ''}`}
                  disabled={saving}
                  onClick={() => handleStatusChange(selectedBooking, nextStatus, 'admin')}
                >
                  {nextStatus === 'cancelado' ? 'Cancelar' : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('_', ' ')}
                </button>
              ))}
              <button
                className="admin-btn admin-btn-secondary"
                disabled={saving}
                onClick={() => handleSaveNote(selectedBooking)}
              >
                {saving ? 'Salvando...' : 'Salvar nota'}
              </button>
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
