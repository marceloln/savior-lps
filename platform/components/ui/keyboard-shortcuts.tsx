'use client';

import { useEffect, useState } from 'react';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        window.dispatchEvent(new CustomEvent('close-slide-over'));
      }

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  if (!showHelp) return null;

  const shortcuts = [
    { keys: 'Esc', desc: 'Fechar painel lateral / modal' },
    { keys: '?', desc: 'Mostrar atalhos' },
  ];

  return (
    <>
      <div
        className="slide-over-backdrop"
        onClick={() => setShowHelp(false)}
        style={{ zIndex: 9998 }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r)',
          padding: '24px 28px',
          zIndex: 9999,
          minWidth: 320,
          animation: 'fade-in 0.15s ease-out',
        }}
      >
        <h3
          className="font-display"
          style={{ fontSize: 16, marginBottom: 16, color: 'var(--ink)' }}
        >
          Atalhos do teclado
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12.5px',
              }}
            >
              <span style={{ color: 'var(--ink2)' }}>{s.desc}</span>
              <kbd
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 5,
                  padding: '2px 8px',
                  color: 'var(--muted)',
                }}
              >
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p
          className="mono text-muted2"
          style={{ fontSize: 9, marginTop: 16, textAlign: 'center' }}
        >
          Pressione ? para fechar
        </p>
      </div>
    </>
  );
}
