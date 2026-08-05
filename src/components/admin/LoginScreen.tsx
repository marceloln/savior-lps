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
  const [isSignup, setIsSignup] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignup) {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.user && data.session) {
        onLogin({ email: data.user.email ?? email, id: data.user.id });
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar, ou faça login diretamente.');
        setIsSignup(false);
      }
      return;
    }

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
        {success && (
          <div aria-live="polite" style={{
            background: 'rgba(0,184,124,0.12)',
            border: '1px solid rgba(0,184,124,0.3)',
            color: '#00B87C',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

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
            placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Sua senha'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </div>

        <button
          type="submit"
          className="admin-btn"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
        >
          {loading
            ? (isSignup ? 'Criando...' : 'Entrando...')
            : (isSignup ? 'Criar conta' : 'Entrar')
          }
        </button>

        <button
          type="button"
          onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }}
          style={{
            width: '100%',
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: '#6B7785',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {isSignup ? 'Já tem conta? Fazer login' : 'Primeiro acesso? Criar conta'}
        </button>
      </form>
    </div>
  );
}
