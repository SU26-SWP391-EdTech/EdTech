import type { ReactNode } from 'react';
import loginHero from '../../assets/login-hero.png';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex w-full lg:w-[42%] flex-col px-8 py-8 sm:px-12 lg:px-16">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-content">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">
            Self-Learning System
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-6 pl-0">
        <img
          src={loginHero}
          alt=""
          className="h-[calc(100vh-3rem)] w-full rounded-3xl object-cover"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
