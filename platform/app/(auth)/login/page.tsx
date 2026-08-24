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
    <div className="login-container">
      <div className="login-box">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="login-logo">
            <svg width="30" height="30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="none" stroke="var(--green)" strokeWidth="8" />
              <circle cx="50" cy="50" r="14" fill="var(--green)" />
            </svg>
          </div>
          <h1 className="font-display login-title">
            Savior Platform
          </h1>
          <p className="text-muted text-md mt-1.5">
            Central de operações
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="panel p-6 bg-card">
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
                <p className="form-error">{errors.email}</p>
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
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-green btn-full mt-1 ${loading ? 'opacity-70' : ''}`}
              disabled={loading}
            >
              {loading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="login-forgot"
            >
              Esqueci minha senha
            </a>
          </div>
        </form>

        {/* Footer */}
        <p className="mono text-muted2 login-footer">
          Savior Medical Service · v0.2
        </p>
      </div>
    </div>
  );
}
