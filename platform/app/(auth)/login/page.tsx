'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido';
    if (!password.trim()) errs.password = 'Senha obrigatória';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // Simula autenticação
    await new Promise((r) => setTimeout(r, 600));
    router.push('/');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '2.5px solid var(--green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="30" height="30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="none" stroke="var(--green)" strokeWidth="8" />
              <circle cx="50" cy="50" r="14" fill="var(--green)" />
            </svg>
          </div>
          <h1 className="font-display" style={{
            fontSize: '24px',
            letterSpacing: '-0.025em',
            color: 'var(--ink)',
          }}>
            Savior Platform
          </h1>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: 6 }}>
            Central de operações
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="panel" style={{ padding: '24px', background: 'var(--bg)' }}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="form-label">
                E-MAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="seu@email.com"
                className="form-input"
              />
              {errors.email && (
                <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                SENHA
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="••••••••"
                className="form-input"
              />
              {errors.password && (
                <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-green"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                textAlign: 'center',
                textDecoration: 'none',
                marginTop: 2,
              }}
            >
              Esqueci minha senha
            </a>
          </div>
        </form>

        {/* Footer */}
        <p className="mono text-muted2" style={{
          fontSize: '9px',
          textAlign: 'center',
          marginTop: 24,
          letterSpacing: '0.04em',
        }}>
          Savior Medical Service · v0.1
        </p>
      </div>
    </div>
  );
}
