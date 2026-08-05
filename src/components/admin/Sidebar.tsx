interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',     icon: '\u{1F4CA}', label: 'Dashboard' },
  { id: 'agendamentos',  icon: '\u{1F691}', label: 'Agendamentos' },
  { id: 'leads',         icon: '\u{1F465}', label: 'Leads' },
  { id: 'candidaturas',  icon: '\u{1F4CB}', label: 'Candidaturas' },
];

export default function Sidebar({ activeTab, onTabChange, userEmail, onLogout }: SidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <h2>SAVIOR</h2>
        <span>PAINEL</span>
      </div>

      <nav className="admin-sidebar-nav" role="navigation" aria-label="Menu principal">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
            type="button"
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="user-email" title={userEmail}>{userEmail}</div>
        <button className="logout-btn" onClick={onLogout} type="button" aria-label="Sair do painel">
          Sair
        </button>
      </div>
    </aside>
  );
}
