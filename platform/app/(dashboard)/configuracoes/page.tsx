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

      <div className="flex flex-col gap-5 max-w-[680px]">
        {/* Operador */}
        <div className="panel">
          <div className="panel-header">
            <p className="panel-title">Operador</p>
          </div>
          <div className="panel-body">
            <div className="flex flex-col gap-3">
              <div className="config-row">
                <span className="text-muted">Razão Social</span>
                <span className="fw-600">Savior Medical Service</span>
              </div>
              <div className="config-row">
                <span className="text-muted">CNPJ</span>
                <span className="mono fw-600 text-base">30.299.895/0001-78</span>
              </div>
              <div className="config-row">
                <span className="text-muted">Sede</span>
                <span className="fw-500">R. Gen. Padilha, 73 — São Cristóvão, RJ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrações */}
        <div className="panel">
          <div className="panel-header flex-between">
            <p className="panel-title">Integrações</p>
          </div>
          <div className="panel-body">
            <div className="flex flex-col gap-3">
              {integracoes.map((intg) => (
                <div
                  key={intg.nome}
                  className="flex items-center gap-3 integration-row"
                >
                  {/* Status dot */}
                  <span className={`status-dot ${intg.connected ? 'status-dot-green' : 'status-dot-amber'}`} />
                  <div className="flex-1">
                    <p className="text-md fw-600 text-ink">{intg.nome}</p>
                    <p className="text-sm text-muted">{intg.desc}</p>
                  </div>
                  <span className={`pill ${intg.connected ? 'pill-green' : 'pill-amber'}`}>
                    {intg.connected ? 'Conectado' : 'Pendente'}
                  </span>
                  <button
                    className={`btn-sm ${intg.connected ? 'btn-outline' : 'btn-sm-green'}`}
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
          <div className="panel-header flex-between">
            <p className="panel-title">Usuários</p>
            <button className="btn-sm btn-outline">
              Convidar
            </button>
          </div>
          <div className="panel-body">
            <div className="flex flex-col">
              {usuarios.map((u) => (
                <div
                  key={u.nome}
                  className="flex items-center justify-between user-row"
                >
                  <span className="fw-500 text-ink">{u.nome}</span>
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
