import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { CustomCheckbox } from '../../components/auth/CustomCheckbox';
import { FormInput } from '../../components/auth/FormInput';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { SplitAuthLayout } from '../../layouts/Auth/SplitAuthLayout';

function goTo(path: string) {
  window.location.href = path;
}

export function SignIn() {
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('Incorrect email or password. Please try again.');
    }, 1800);
  };

  return (
    <SplitAuthLayout screen="signin">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-[#111827] mb-1.5" style={{ fontWeight: 700, fontSize: 28 }}>Welcome back</h1>
          <p className="text-[#6B7280]" style={{ fontSize: 15 }}>Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-[#FFF1F4] border border-[#FECDD3] rounded-xl mb-5">
            <AlertCircle className="w-4 h-4 text-[#E11D48] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#BE123C]" style={{ fontWeight: 500 }}>{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-5">
          <FormInput
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(value) => {
              setEmail(value);
              setError('');
            }}
            icon={<Mail className="w-4 h-4" />}
            error={error ? '' : undefined}
          />
          <FormInput
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setError('');
            }}
            icon={<Lock className="w-4 h-4" />}
            error={error ? '' : undefined}
            rightEl={
              <button onClick={() => setShowPwd((value) => !value)} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <CustomCheckbox checked={remember} onChange={() => setRemember((value) => !value)} />
            <span className="text-sm text-[#6B7280]">Remember me</span>
          </label>
          <button onClick={() => goTo('/forgot-password')} className="text-sm text-[#E11D48] hover:text-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
            Forgot password?
          </button>
        </div>

        <div className="space-y-4">
          <PrimaryButton onClick={handleSubmit} loading={loading}>
            Sign In
          </PrimaryButton>
          {/* <Divider label="or continue with" />
          <SocialButtons /> */}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Don't have an account?{' '}
          <button onClick={() => goTo('/register')} className="text-[#E11D48] hover:text-[#BE123C] transition-colors" style={{ fontWeight: 600 }}>
            Create account
          </button>
        </p>
      </div>
    </SplitAuthLayout>
  );
}
