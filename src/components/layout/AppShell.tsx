import type { ReactNode } from 'react';
import BottomTabBar from './BottomTabBar';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar />
      <main className="lg:ml-64 pb-20 lg:pb-4 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-4 lg:py-6">
          {children}
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
