'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SlideOver({ open, onClose, title, children, footer }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    function handleCustomClose() {
      onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-slide-over', handleCustomClose);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-slide-over', handleCustomClose);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="slide-over-backdrop" onClick={onClose} />
      <div className="slide-over">
        <div className="slide-over-header">
          <h2 className="slide-over-title">{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="slide-over-body">{children}</div>
        {footer && <div className="slide-over-footer">{footer}</div>}
      </div>
    </>
  );
}
