import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Shield,
  Mail,
  Upload,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth/auth.stores';
import {
  createPlatformSettings,
  getPlatformSettingsStatus,
} from '../../services/platform-setting/platform-setting.service';

export function PlatformSetup() {
  const navigate = useNavigate();
  const clearRequiresPlatformSetup = useAuthStore((state) => state.clearRequiresPlatformSetup);

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isAlreadyConfigured, setIsAlreadyConfigured] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const { configured } = await getPlatformSettingsStatus();
        if (cancelled) return;
        setIsAlreadyConfigured(configured);
      } catch (err) {
        console.error('Failed to check platform setup status:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const errors = {
    name: name.trim().length === 0 ? 'Platform name is required.' : null,
    email: email.trim().length === 0 ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email format.' : null,
    description: description.trim().length === 0 ? 'Description is required.' : null,
  };

  const isFormValid = Object.values(errors).every(v => v === null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, description: true });

    if (!isFormValid) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setSubmitError('');

    try {
      await createPlatformSettings({
        platformName: name.trim(),
        platformEmail: email.trim(),
        description: description.trim(),
      });
      clearRequiresPlatformSetup();
      toast.success('Platform settings configured successfully!');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to create platform settings.';
      setSubmitError(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
          <p className="text-sm font-medium text-[#6B7280]">Initializing setup wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] overflow-y-auto py-12 px-6 flex items-center justify-center">
      {/* Centered setup container */}
      <div className="max-w-[960px] w-full my-auto flex flex-col">
        
        {/* Header (matches style of PlatformSettings.tsx) */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Security & Platform Config</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Platform Setup</h1>
            <p className="text-sm text-[#6B7280] mt-1">Initialize global variables, branding materials, and public contact information for your new academy.</p>
          </div>
        </div>

        {/* 2-Column Grid (matches PlatformSettings.tsx structure) */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Form: 8 columns */}
          <form onSubmit={handleSubmit} className="col-span-12 md:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-3 mb-2">
              <Settings className="w-4 h-4 text-[#7C3AED]" /> General Branding
            </h2>

            {isAlreadyConfigured && (
              <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] rounded-xl text-xs flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
                <div>
                  <p className="font-semibold text-sm">Platform already configured</p>
                  <p className="mt-0.5 text-[#1E40AF]/80 leading-relaxed">
                    The system has already been initialized. Submitting this form again might result in a conflict error (409 Conflict) from the database since only one configuration record is allowed.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/settings')}
                    className="mt-3 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg transition-all text-xs shadow-sm animate-fade-in"
                  >
                    Go to System Settings
                  </button>
                </div>
              </div>
            )}

            {/* Platform Name */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Platform Brand Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, name: true }))}
                placeholder="e.g. EdTech Academy"
                disabled={isAlreadyConfigured}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 transition-all ${
                  isAlreadyConfigured ? 'opacity-65 cursor-not-allowed bg-[#F3F4F6]' : ''
                } ${
                  touched.name && errors.name
                    ? 'border-[#EF4444] focus:border-[#EF4444]'
                    : touched.name && !errors.name
                      ? 'border-[#10B981] focus:border-[#10B981]'
                      : 'border-[#E5E7EB] focus:border-[#7C3AED]'
                }`}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* Platform Email */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Support/Contact Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  placeholder="e.g. support@edtech.com"
                  disabled={isAlreadyConfigured}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 transition-all ${
                    isAlreadyConfigured ? 'opacity-65 cursor-not-allowed bg-[#F3F4F6]' : ''
                  } ${
                    touched.email && errors.email
                      ? 'border-[#EF4444] focus:border-[#EF4444]'
                      : touched.email && !errors.email
                        ? 'border-[#10B981] focus:border-[#10B981]'
                        : 'border-[#E5E7EB] focus:border-[#7C3AED]'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Platform Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider">System Description</label>
                <span className="text-[10px] font-medium text-[#9CA3AF]">{description.length}/500</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setDescription(e.target.value);
                  }
                }}
                onBlur={() => setTouched(p => ({ ...p, description: true }))}
                placeholder="Write a short pitch or description of the platform's vision..."
                rows={4}
                disabled={isAlreadyConfigured}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 resize-none transition-all ${
                  isAlreadyConfigured ? 'opacity-65 cursor-not-allowed bg-[#F3F4F6]' : ''
                } ${
                  touched.description && errors.description
                    ? 'border-[#EF4444] focus:border-[#EF4444]'
                    : touched.description && !errors.description
                      ? 'border-[#10B981] focus:border-[#10B981]'
                      : 'border-[#E5E7EB] focus:border-[#7C3AED]'
                }`}
              />
              {touched.description && errors.description && (
                <p className="text-xs text-[#EF4444] mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {errors.description}
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl text-xs flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Footer action (matches PlatformSettings.tsx style exactly) */}
            <div className="border-t border-[#F3F4F6] pt-4 mt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving || !isFormValid || isAlreadyConfigured}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm hover:bg-[#6D28D9] font-medium transition-all shadow-sm shadow-[#7C3AED]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Initialize Platform</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Info: 4 columns (matches PlatformSettings.tsx sidebar exactly) */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
            {/* Status Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-2">SYSTEM STATUS</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isAlreadyConfigured ? 'bg-[#16A34A]' : 'bg-[#EF4444]'}`}></span>
                <span className={`text-xs font-semibold ${isAlreadyConfigured ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                  {isAlreadyConfigured ? 'Live & Synchronized' : 'Setup Required'}
                </span>
              </div>
              <div className="text-xs text-[#6B7280] leading-relaxed flex flex-col gap-2">
                <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                  <span>Setup Status</span>
                  <span className="font-medium text-[#111827]">{isAlreadyConfigured ? 'Configured' : 'Unconfigured'}</span>
                </div>
                <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                  <span>Database Entry ID</span>
                  <span className="font-medium text-[#111827]">—</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-medium text-[#111827]">{isAlreadyConfigured ? 'Production' : 'Onboarding'}</span>
                </div>
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#7C3AED]" /> Guidelines
              </h3>
              <ul className="text-xs text-[#6B7280] space-y-2 list-disc pl-4 leading-relaxed">
                <li>The brand name is displayed in emails, headers, and footer copyrights.</li>
                <li>Support email is used for platform automated transactional emails.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
