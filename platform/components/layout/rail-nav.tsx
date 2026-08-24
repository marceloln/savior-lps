'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Headset,
  Map,
  Truck,
  Users,
  Settings,
  Database,
  Target,
} from 'lucide-react';

const mainNav = [
  { href: '/', label: 'Central', icon: Headset, badge: 1 },
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/frota', label: 'Frota', icon: Truck },
  { href: '/equipe', label: 'Equipe', icon: Users },
];

const gestaoNav = [
  { href: '/cadastros', label: 'Cadastros', icon: Database },
  { href: '/leads', label: 'Leads', icon: Target },
];

export function RailNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="rail">
      {/* Logo */}
      <div className="rail-logo" style={{ marginBottom: 14 }}>
        <svg width="28" height="28" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="none" stroke="oklch(0.82 0.13 168)" strokeWidth="8" />
          <circle cx="50" cy="50" r="14" fill="oklch(0.82 0.13 168)" />
        </svg>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rail-item ${active ? 'rail-item-active' : ''}`}
            >
              {item.badge && !active && (
                <span className="nav-badge">{item.badge}</span>
              )}
              <Icon size={19} strokeWidth={1.9} />
              <span className="rail-tooltip">{item.label}</span>
            </Link>
          );
        })}

        <div className="rail-sep" />
        <span className="rail-section-label">Gestão</span>

        {gestaoNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rail-item ${active ? 'rail-item-active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span className="rail-tooltip">{item.label}</span>
            </Link>
          );
        })}

        <div className="rail-sep" />

        <Link
          href="/configuracoes"
          className={`rail-item ${pathname.startsWith('/configuracoes') ? 'rail-item-active' : ''}`}
        >
          <Settings size={19} strokeWidth={1.9} />
          <span className="rail-tooltip">Configurações</span>
        </Link>
      </div>

      {/* Bottom: avatar */}
      <div className="flex flex-col items-center gap-2 pb-3">
        <div className="rail-avatar">RM</div>
      </div>
    </nav>
  );
}
