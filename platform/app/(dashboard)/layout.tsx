'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { RailNav } from '@/components/layout/rail-nav';
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts';
import { ToastProvider } from '@/components/ui/toast';

function SkeletonFallback() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-body" />
    </div>
  );
}

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
          <Suspense fallback={<SkeletonFallback />}>
            {children}
          </Suspense>
        ) : isMapa ? (
          <main className="ml-[58px] h-screen overflow-hidden">
            <Suspense fallback={<SkeletonFallback />}>
              {children}
            </Suspense>
          </main>
        ) : (
          <main className="content-area">
            <Suspense fallback={<SkeletonFallback />}>
              {children}
            </Suspense>
          </main>
        )}
      </div>
    </ToastProvider>
  );
}
