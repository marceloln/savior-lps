import { useState, useEffect, Component, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import DashboardTab from './DashboardTab';
import AgendamentosTab from './AgendamentosTab';
import LeadsTab from './LeadsTab';
import CandidaturasTab from './CandidaturasTab';
import './admin.css';

type Tab = 'dashboard' | 'agendamentos' | 'leads' | 'candidaturas';

interface User {
  email: string;
  id: string;
}

// Error Boundary to catch render crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#D9534F', fontFamily: 'Inter, sans-serif', background: '#07182B', minHeight: '100vh' }}>
          <h2 style={{ color: '#F4EFE6' }}>Erro no painel</h2>
          <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap', marginTop: 16, color: '#6B7785' }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => { this.setState({ error: null }); location.reload(); }}
            style={{ marginTop: 20, padding: '10px 20px', background: '#00B87C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminInner() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          setAuthError(error.message);
          setCheckingAuth(false);
          return;
        }
        if (session?.user) {
          setUser({ email: session.user.email ?? '', id: session.user.id });
        }
        setCheckingAuth(false);
      })
      .catch((err) => {
        setAuthError(err?.message || 'Erro ao verificar sessão');
        setCheckingAuth(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? '', id: session.user.id });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab('dashboard');
  }

  if (checkingAuth) {
    return (
      <div className="admin-loading-screen" aria-busy="true">
        Carregando...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="admin-loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#D9534F', marginBottom: 16 }}>Erro de autenticação: {authError}</div>
          <button onClick={() => location.reload()}
            style={{ padding: '10px 20px', background: '#00B87C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as Tab)}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <main className="admin-content">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'agendamentos' && <AgendamentosTab userEmail={user.email} />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'candidaturas' && <CandidaturasTab userEmail={user.email} />}
      </main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <ErrorBoundary>
      <AdminInner />
    </ErrorBoundary>
  );
}
