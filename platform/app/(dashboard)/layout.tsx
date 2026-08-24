'use client';

import { usePathname } from 'next/navigation';
import { RailNav } from '@/components/layout/rail-nav';
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts';
import { ToastProvider } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCentral = pathname === '/';
  const isMapa = pathname === '/mapa';

  return (
    <ToastProvider>
      <div>
        <RailNav />
        <KeyboardShortcuts />
        {isCentral ? (
          <>{children}</>
        ) : isMapa ? (
          <main style={{ marginLeft: 58, height: '100vh', overflow: 'hidden' }}>
            {children}
          </main>
        ) : (
          <main className="content-area">
            {children}
          </main>
        )}
      </div>
    </ToastProvider>
  );
}
