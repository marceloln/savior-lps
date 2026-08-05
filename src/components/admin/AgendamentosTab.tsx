import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface Hospital {
  id: string;
  name: string;
  neighborhood: string;
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
  contact_phone: string;
  contact_name: string | null;
  origin_address: string;
  destination_address: string;
  service_type: string;
  ambulance_type: string | null;
  status: string;
  payment_method: string;
  notes: string | null;
  admin_notes: string | null;
  assigned_team: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  diagnosis: string | null;
  mobility: string | null;
  equipment_needs: string | null;
  patient_gender: string | null;
  patient_height: string | null;
  access_type: string | null;
  floor_number: string | null;
  status_history: StatusHistoryEntry[];
  destination_hospital_id: string | null;
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

const STATUS_VERB_LABELS: Record<string, string> = {
  confirmado: 'Confirmar',
  em_rota: 'Iniciar rota',
  realizado: 'Finalizar',
  cancelado: 'Cancelar',
};

function formatDateTime(dt: string | null): string {
  if (!dt) return '--';
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatScheduled(date: string | null, time: string | null): string {
  if (!date) return '--';
  const d = new Date(date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  if (time) return `${dateStr} ${time}`;
  return dateStr;
}

export default function AgendamentosTab({ userEmail }: { userEmail: string }) {
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
    const query = supabase
      .from('savior_bookings')
      .select('id, created_at, status, service_type, ambulance_type, patient_name, origin_address, destination_address, contact_phone, contact_name, scheduled_date, scheduled_time, payment_method, notes, status_history, admin_notes, assigned_team, destination_hospital_id, diagnosis, mobility, equipment_needs, savior_hospitals!destination_hospital_id(id, name, neighborhood)')
      .order('created_at', { ascending: false })
      .limit(50);

    let filteredQuery = query;

    if (filterStatus !== 'todos') {
      filteredQuery = filteredQuery.eq('status', filterStatus);
    }
    if (dateFrom) {
      filteredQuery = filteredQuery.gte('created_at', dateFrom + 'T00:00:00');
    }
    if (dateTo) {
      filteredQuery = filteredQuery.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data, error: fetchError } = await filteredQuery;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const normalized = (data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      savior_hospitals: Array.isArray(row.savior_hospitals)
        ? (row.savior_hospitals[0] ?? null)
        : (row.savior_hospitals ?? null),
    }));
    setBookings(normalized as Booking[]);
    setLoading(false);
  }, [filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedBooking) {
        setSelectedBooking(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBooking]);

  async function handleStatusChange(booking: Booking, newStatus: BookingStatus) {
    if (newStatus === 'cancelado' && !window.confirm('Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.')) return;

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
      showToast('Não foi possível atualizar o status.', 'error');
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
      showToast('Não foi possível salvar a observação.', 'error');
      return;
    }

    showToast('Observação salva');
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
          <p>Não foi possível carregar os agendamentos.</p>
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
          placeholder="Data início"
          title="Data início"
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="clickable" onClick={() => openModal(b)}>
                    <td>{formatScheduled(b.scheduled_date, b.scheduled_time) !== '--' ? formatScheduled(b.scheduled_date, b.scheduled_time) : formatDateTime(b.created_at)}</td>
                    <td>{b.patient_name}</td>
                    <td>{b.origin_address}</td>
                    <td>{b.destination_address}</td>
                    <td>{b.service_type}</td>
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
                          aria-label={`Alterar status de ${b.patient_name}`}
                          onChange={e => {
                            if (e.target.value) {
                              handleStatusChange(b, e.target.value as BookingStatus);
                            }
                          }}
                        >
                          <option value="">Alterar status...</option>
                          {STATUS_FLOW[b.status].map(s => (
                            <option key={s} value={s}>
                              {STATUS_VERB_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
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
          <div className="admin-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Detalhes do agendamento</h2>
              <button className="admin-modal-close" aria-label="Fechar modal" onClick={() => setSelectedBooking(null)}>
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
                  {selectedBooking.contact_phone}
                  {selectedBooking.contact_phone && (
                    <a
                      href={`https://wa.me/55${selectedBooking.contact_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-sm"
                      style={{ marginLeft: 12, textDecoration: 'none', fontSize: 11 }}
                    >
                      Abrir WhatsApp
                    </a>
                  )}
                </div>
              </div>
              {selectedBooking.contact_name && (
                <div className="detail-row">
                  <div className="detail-label">Contato</div>
                  <div className="detail-value">{selectedBooking.contact_name}</div>
                </div>
              )}
              <div className="detail-row">
                <div className="detail-label">Origem</div>
                <div className="detail-value">{selectedBooking.origin_address}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Destino</div>
                <div className="detail-value">{selectedBooking.destination_address}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Tipo de serviço</div>
                <div className="detail-value">{selectedBooking.service_type}</div>
              </div>
              {selectedBooking.ambulance_type && (
                <div className="detail-row">
                  <div className="detail-label">Tipo de ambulância</div>
                  <div className="detail-value">{selectedBooking.ambulance_type}</div>
                </div>
              )}
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
                <div className="detail-value">{formatScheduled(selectedBooking.scheduled_date, selectedBooking.scheduled_time)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Criado em</div>
                <div className="detail-value">{formatDateTime(selectedBooking.created_at)}</div>
              </div>
              {selectedBooking.diagnosis && (
                <div className="detail-row">
                  <div className="detail-label">Diagnóstico</div>
                  <div className="detail-value">{selectedBooking.diagnosis}</div>
                </div>
              )}
              {selectedBooking.mobility && (
                <div className="detail-row">
                  <div className="detail-label">Mobilidade</div>
                  <div className="detail-value">{selectedBooking.mobility}</div>
                </div>
              )}
              {selectedBooking.equipment_needs && (
                <div className="detail-row">
                  <div className="detail-label">Equipamentos</div>
                  <div className="detail-value">{selectedBooking.equipment_needs}</div>
                </div>
              )}
              {selectedBooking.patient_gender && (
                <div className="detail-row">
                  <div className="detail-label">Gênero</div>
                  <div className="detail-value">{selectedBooking.patient_gender === 'masculino' ? 'Masculino' : selectedBooking.patient_gender === 'feminino' ? 'Feminino' : 'Prefere não informar'}</div>
                </div>
              )}
              {selectedBooking.patient_height && (
                <div className="detail-row">
                  <div className="detail-label">Altura</div>
                  <div className="detail-value">{selectedBooking.patient_height} cm</div>
                </div>
              )}
              {selectedBooking.access_type && (
                <div className="detail-row">
                  <div className="detail-label">Acesso</div>
                  <div className="detail-value">
                    {selectedBooking.access_type === 'casa_terreo' ? 'Casa/térreo' : selectedBooking.access_type === 'apto_elevador' ? 'Apto com elevador' : selectedBooking.access_type === 'apto_escada' ? `Apto só escada${selectedBooking.floor_number ? ` (${selectedBooking.floor_number}º andar)` : ''}` : selectedBooking.access_type === 'comercial' ? 'Prédio comercial' : 'Hospital/clínica'}
                  </div>
                </div>
              )}
              {selectedBooking.savior_hospitals && (
                <div className="detail-row">
                  <div className="detail-label">Hospital</div>
                  <div className="detail-value">
                    {selectedBooking.savior_hospitals.name} ({selectedBooking.savior_hospitals.neighborhood})
                  </div>
                </div>
              )}

              {(selectedBooking.status_history ?? []).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="detail-label" style={{ marginBottom: 8 }}>Histórico de status</div>
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
                  Observações
                </label>
                <textarea
                  className="admin-textarea"
                  value={modalNote}
                  onChange={e => setModalNote(e.target.value)}
                  placeholder="Adicionar observação..."
                />
              </div>
            </div>

            <div className="admin-modal-actions">
              {STATUS_FLOW[selectedBooking.status]?.map(nextStatus => (
                <button
                  key={nextStatus}
                  className={`admin-btn ${nextStatus === 'cancelado' ? 'admin-btn-danger' : ''}`}
                  disabled={saving}
                  onClick={() => handleStatusChange(selectedBooking, nextStatus)}
                >
                  {STATUS_VERB_LABELS[nextStatus] ?? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('_', ' ')}
                </button>
              ))}
              <button
                className="admin-btn admin-btn-secondary"
                disabled={saving}
                onClick={() => handleSaveNote(selectedBooking)}
              >
                {saving ? 'Salvando...' : 'Salvar observação'}
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
