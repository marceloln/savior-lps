import { useState, useEffect } from 'react';
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

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? '', id: session.user.id });
      }
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#07182B',
        color: '#6B7785',
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
      }}>
        Carregando...
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
        {activeTab === 'agendamentos' && <AgendamentosTab />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'candidaturas' && <CandidaturasTab />}
      </main>
    </div>
  );
}
