import { useEffect, useState } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/index';
import { ShieldAlert, RotateCw } from 'lucide-react';

const App = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const lastRefresh = sessionStorage.getItem('lastRefreshTime');
    const now = Date.now();

    if (lastRefresh) {
      const diff = now - parseInt(lastRefresh, 10);
      if (diff < 30000) {
        setIsBlocked(true);
        setTimeLeft(Math.ceil((30000 - diff) / 1000));
        return;
      }
    }
    // If not blocked, update the last refresh time
    sessionStorage.setItem('lastRefreshTime', now.toString());
  }, []);

  useEffect(() => {
    if (!isBlocked || timeLeft <= 0) {
      if (isBlocked && timeLeft <= 0) {
        setIsBlocked(false);
        sessionStorage.setItem('lastRefreshTime', Date.now().toString());
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBlocked(false);
          sessionStorage.setItem('lastRefreshTime', Date.now().toString());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBlocked, timeLeft]);

  if (isBlocked) {
    const circumference = 2 * Math.PI * 48;
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 max-w-md w-full text-center shadow-sm flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl flex items-center justify-center text-[#E11D48] relative">
            <ShieldAlert className="w-8 h-8" />
            <RotateCw className="w-4 h-4 absolute top-2 right-2 animate-spin text-[#E11D48]/50" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827] mb-2">Refresh Limit Active</h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              To protect server stability, you can only refresh this page once every 30 seconds.
            </p>
          </div>
          
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-[#F1F5F9]"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-[#E11D48] transition-all duration-1000 ease-linear"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - timeLeft / 30)}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">{timeLeft}</span>
              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-widest mt-0.5">seconds</span>
            </div>
          </div>

          <p className="text-xs text-[#9CA3AF]">
            The page will automatically unlock once the timer reaches zero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' },
        }}
      />
    </>
  );
};

export default App;