import { type ReactNode } from 'react';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';
import { type AuthScreen } from '../../types/auth/auth';

export function SplitAuthLayout({ screen, children }: { screen: AuthScreen; children: ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      <AuthLeftPanel screen={screen} />

      <div className="flex-1 flex items-center justify-center overflow-auto" style={{ padding: '32px' }}>
        {children}
      </div>
    </div>
  );
}
