import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginScreenProps {
  onLogin: (user: { email: string; id: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : authError.message
      );
      return;
    }

    if (data.user) {
      onLogin({ email: data.user.email ?? email, id: data.user.id });
    }
  }

  return (
    <div className="admin-login-wrapper">
      <form className="admin-login" onSubmit={handleSubmit}>
        <div className="admin-login-logo">
          <h1>SAVIOR</h1>
          <span>ADMIN PANEL</span>
        </div>

        {error && <div className="admin-login-error" aria-live="polite">{error}</div>}

        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="admin-input"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            className="admin-input"
            placeholder="Sua senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="admin-btn"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{
          width: '100%',
          marginTop: 16,
          color: '#6B7785',
          fontSize: '13px',
          textAlign: 'center',
          fontFamily: 'inherit',
        }}>
          Solicite seu acesso ao administrador.
        </p>
      </form>
    </div>
  );
}
