import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { CustomCheckbox } from '../../components/auth/CustomCheckbox';
import { FormInput } from '../../components/auth/FormInput';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { SplitAuthLayout } from '../../layouts/Auth/SplitAuthLayout';
import { getPasswordStrength } from '../../utils/passwordStrength';

function goTo(path: string) {
  window.location.href = path;
}

export function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'learner' | 'provider'>('learner');
  const [showPwd, setShowPwd] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;
  const canSubmit = !!name && !!email && password.length >= 8 && terms;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      goTo('/verify-email');
    }, 1800);
  };

  return (
    <SplitAuthLayout screen="signup">
      <div className="w-full max-w-sm">
        <div className="mb-7">
          <h1 className="text-[#111827] mb-1.5" style={{ fontWeight: 700, fontSize: 28 }}>Create your account</h1>
          <p className="text-[#6B7280]" style={{ fontSize: 15 }}>Join 50,000+ learners building their future</p>
        </div>

        <div className="space-y-4 mb-5">
          <FormInput label="Full name" placeholder="Alex Morgan" value={name} onChange={setName} icon={<User className="w-4 h-4" />} />
          <FormInput label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={<Mail className="w-4 h-4" />} />

          <div>
            <FormInput
              label="Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={setPassword}
              icon={<Lock className="w-4 h-4" />}
              rightEl={
                <button onClick={() => setShowPwd((value) => !value)} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {password && strength && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1.5">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ backgroundColor: item <= strength.level ? strength.color : '#F3F4F6' }} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                  <p className="text-xs text-[#9CA3AF]">Min. 8 characters</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-2 uppercase tracking-wider">I want to learn or teach?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('learner')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${role === 'learner'
                  ? 'border-[#E11D48] bg-[#FFF1F4] text-[#E11D48] shadow-sm shadow-[#E11D48]/10'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                  }`}
              >
                <span className="font-bold text-sm">Learner</span>
                <span className="text-[10px] text-opacity-80 text-center mt-1">I want to study</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${role === 'provider'
                  ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] shadow-sm shadow-[#7C3AED]/10'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                  }`}
              >
                <span className="font-bold text-sm">Course Provider</span>
                <span className="text-[10px] text-opacity-80 text-center mt-1">I want to teach</span>
              </button>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
          <CustomCheckbox checked={terms} onChange={() => setTerms((value) => !value)} />
          <span className="text-sm text-[#6B7280]" style={{ lineHeight: 1.55 }}>
            I agree to the <span className="text-[#E11D48]" style={{ fontWeight: 500 }}>Terms of Service</span> and <span className="text-[#E11D48]" style={{ fontWeight: 500 }}>Privacy Policy</span>
          </span>
        </label>

        <div className="space-y-4">
          <PrimaryButton onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
            Create Account
          </PrimaryButton>
          {/* <Divider label="or sign up with" />
          <SocialButtons /> */}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Already have an account?{' '}
          <button onClick={() => goTo('/login')} className="text-[#E11D48] hover:text-[#BE123C] transition-colors" style={{ fontWeight: 600 }}>
            Sign in
          </button>
        </p>
      </div>
    </SplitAuthLayout>
  );
}
