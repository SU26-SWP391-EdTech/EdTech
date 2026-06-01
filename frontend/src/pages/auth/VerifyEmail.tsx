import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Inbox, RefreshCw } from 'lucide-react';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { SplitAuthLayout } from '../../layouts/Auth/SplitAuthLayout';

function goTo(path: string) {
  window.location.href = path;
}

export function VerifyEmail() {
  const [countdown, setCountdown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    setResent(true);
    setCountdown(60);
  };

  return (
    <SplitAuthLayout screen="verify">
      <div className="w-full max-w-sm text-center">
        <div className="relative w-20 h-20 mx-auto mb-7">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFF1F4] to-[#FEE2E2] border border-[#FECDD3] flex items-center justify-center">
            <Inbox className="w-9 h-9 text-[#E11D48]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h1 className="text-[#111827] mb-2" style={{ fontWeight: 700, fontSize: 26 }}>Check your inbox</h1>
        <p className="text-[#6B7280] mb-1" style={{ fontSize: 14, lineHeight: 1.6 }}>
          We sent a verification link to
        </p>
        <p className="text-[#111827] mb-2" style={{ fontWeight: 600, fontSize: 14 }}>alex@example.com</p>
        <p className="text-[#9CA3AF] mb-7" style={{ fontSize: 13, lineHeight: 1.65 }}>
          Click the link in the email to verify your account. The link expires in 24 hours.
        </p>

        {resent && countdown > 50 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl mb-5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <p className="text-sm text-[#15803D]" style={{ fontWeight: 500 }}>Verification email resent!</p>
          </div>
        )}

        <div className="space-y-3">
          <PrimaryButton onClick={() => goTo('/')}>
            Continue to Platform
          </PrimaryButton>
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className="w-full py-3 border border-[#E5E7EB] bg-white text-sm text-[#374151] rounded-xl hover:bg-[#F8FAFC] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontWeight: 500 }}
          >
            <RefreshCw className="w-4 h-4" />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] mt-6" style={{ lineHeight: 1.65 }}>
          Can't find the email? Check your spam folder or{' '}
          <button className="text-[#E11D48] hover:underline" style={{ fontWeight: 500 }}>contact support</button>
        </p>
      </div>
    </SplitAuthLayout>
  );
}
