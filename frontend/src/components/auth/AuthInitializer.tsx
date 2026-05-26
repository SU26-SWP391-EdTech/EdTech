import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../../stores/auth.store';

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <>{children}</>;
};

export default AuthInitializer;
