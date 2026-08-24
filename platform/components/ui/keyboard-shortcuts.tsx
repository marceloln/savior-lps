'use client';

import { useEffect, useState } from 'react';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        window.dispatchEvent(new CustomEvent('close-slide-over'));
      }

      if (isInput) return;

      if (e.key === '?' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('new-chamado'));
      }

      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-search'));
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('nav-next'));
      }

      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('nav-prev'));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  if (!showHelp) return null;

  const shortcuts = [
    { keys: '?', desc: 'Mostrar atalhos' },
    { keys: 'Esc', desc: 'Fechar painel' },
    { keys: 'N', desc: 'Novo chamado' },
    { keys: '/', desc: 'Buscar' },
    { keys: 'J', desc: 'Próximo item' },
    { keys: 'K', desc: 'Item anterior' },
  ];

  return (
    <div className="shortcut-modal">
      <div className="shortcut-backdrop" onClick={() => setShowHelp(false)} />
      <div className="shortcut-panel">
        <button className="shortcut-close" onClick={() => setShowHelp(false)}>
          &times;
        </button>
        <h3 className="shortcut-title">Atalhos do teclado</h3>
        {shortcuts.map((s) => (
          <div key={s.keys} className="shortcut-row">
            <span>{s.desc}</span>
            <kbd className="shortcut-key">{s.keys}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
