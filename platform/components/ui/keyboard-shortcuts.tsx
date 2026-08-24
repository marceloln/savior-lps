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
