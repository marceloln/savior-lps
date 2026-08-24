export default function ConfiguracoesPage() {
  const integracoes = [
    { nome: 'SofitView', desc: 'Gestão de frota e colaboradores', connected: true },
    { nome: 'FullTrack / Movek', desc: 'Rastreamento veicular', connected: true },
    { nome: 'Meta Cloud API', desc: 'WhatsApp Business', connected: false },
    { nome: 'Asaas', desc: 'Cobrança e pagamento', connected: false },
  ];

  const usuarios = [
    { nome: 'Rodrigo Monfort', role: 'Admin' },
    { nome: 'Marcelo Nascimento', role: 'Admin' },
    { nome: 'Claudia Feitoza', role: 'Supervisor' },
    { nome: 'Renan Melo', role: 'Atendente' },
  ];

  return (
    <div>
      <div className="mb-5">
        <p className="breadcrumb mb-1">CONFIGURAÇÕES</p>
        <h1 className="page-title">Configurações</h1>
      </div>

      <div className="flex flex-col gap-5" style={{ maxWidth: 680 }}>
        {/* Operador */}
        <div className="panel">
          <div className="panel-header">
            <p className="panel-title">Operador</p>
          </div>
          <div className="panel-body">
            <div className="flex flex-col gap-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span className="text-muted">Razão Social</span>
                <span style={{ fontWeight: 600 }}>Savior Medical Service</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <span className="text-muted">CNPJ</span>
                <span className="mono" style={{ fontWeight: 600, fontSize: '12px' }}>30.299.895/0001-78</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <span className="text-muted">Sede</span>
                <span style={{ fontWeight: 500 }}>R. Gen. Padilha, 73 — São Cristóvão, RJ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrações */}
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="panel-title">Integrações</p>
          </div>
          <div className="panel-body">
            <div className="flex flex-col gap-3">
              {integracoes.map((intg) => (
                <div
                  key={intg.nome}
                  className="flex items-center gap-3"
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  {/* Status dot */}
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: intg.connected ? 'var(--green)' : 'var(--amber)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{intg.nome}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{intg.desc}</p>
                  </div>
                  <span className="pill" style={{
                    background: intg.connected ? 'var(--green-l)' : 'var(--amber-l)',
                    color: intg.connected ? 'var(--green-d)' : 'var(--amber)',
                  }}>
                    {intg.connected ? 'Conectado' : 'Pendente'}
                  </span>
                  <button
                    className="btn-sm"
                    style={{
                      background: intg.connected ? 'transparent' : 'var(--green)',
                      color: intg.connected ? 'var(--muted)' : 'oklch(0.24 0.05 168)',
                      border: intg.connected ? '1px solid var(--line2)' : 'none',
                    }}
                  >
                    {intg.connected ? 'Reconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usuários */}
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="panel-title">Usuários</p>
            <button className="btn-sm" style={{
              background: 'transparent',
              border: '1px solid var(--green)',
              color: 'var(--green-d)',
            }}>
              Convidar
            </button>
          </div>
          <div className="panel-body">
            <div className="flex flex-col">
              {usuarios.map((u) => (
                <div
                  key={u.nome}
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--line)',
                    fontSize: '12.5px',
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.nome}</span>
                  <span className="pill pill-slate">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
