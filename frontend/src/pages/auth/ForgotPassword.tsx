import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react';
import { FormInput } from '../../components/auth/FormInput';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { SplitAuthLayout } from '../../layouts/Auth/SplitAuthLayout';

function goTo(path: string) {
  window.location.href = path;
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1600);
  };

  return (
    <SplitAuthLayout screen="forgot">
      {sent ? (
        <div className="w-full max-w-sm text-center">
          <div className="relative w-20 h-20 mx-auto mb-7">
            <div className="w-20 h-20 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#10B981]" />
            </div>
          </div>
          <h1 className="text-[#111827] mb-2" style={{ fontWeight: 700, fontSize: 26 }}>Reset link sent!</h1>
          <p className="text-[#6B7280] mb-1" style={{ fontSize: 14, lineHeight: 1.6 }}>We sent a password reset link to</p>
          <p className="text-[#111827] mb-2" style={{ fontWeight: 600, fontSize: 14 }}>{email}</p>
          <p className="text-[#9CA3AF] mb-8" style={{ fontSize: 13, lineHeight: 1.65 }}>
            The link expires in 15 minutes. Didn't receive it?{' '}
            <button onClick={() => setSent(false)} className="text-[#E11D48] hover:underline" style={{ fontWeight: 500 }}>
              Try again
            </button>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => goTo('/auth/sign-in')}
              className="w-full py-3 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              Back to Sign In
            </button>
            <p className="text-xs text-[#9CA3AF]">Check your spam folder if you don't see it within a minute</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <button
            onClick={() => goTo('/login')}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-7"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F4] flex items-center justify-center mb-5">
              <Lock className="w-6 h-6 text-[#E11D48]" />
            </div>
            <h1 className="text-[#111827] mb-2" style={{ fontWeight: 700, fontSize: 28 }}>Forgot your password?</h1>
            <p className="text-[#6B7280]" style={{ fontSize: 15, lineHeight: 1.55 }}>
              No worries! Enter your email and we'll send you a secure reset link.
            </p>
          </div>

          <div className="mb-6">
            <FormInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              onEnter={handleSend}
              icon={<Mail className="w-4 h-4" />}
              hint="We'll send a reset link to this address"
            />
          </div>

          <PrimaryButton onClick={handleSend} loading={loading} disabled={!email}>
            Send Reset Link
          </PrimaryButton>

          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Remember your password?{' '}
            <button onClick={() => goTo('/login')} className="text-[#E11D48] hover:text-[#BE123C] transition-colors" style={{ fontWeight: 600 }}>
              Sign in
            </button>
          </p>
        </div>
      )}
    </SplitAuthLayout>
  );
}
