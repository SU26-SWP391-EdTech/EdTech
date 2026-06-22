import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Shield, ChevronRight, Eye, Save, RefreshCw,
  FileText, CheckCircle2, AlertCircle, XCircle, Globe,
  Mail, Upload,
  Trash2, X, AlertTriangle, Check, Database,
  Code2, GraduationCap, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import {
  createPlatformSettings,
  getPlatformSettings,
  getPlatformSettingsStatus,
  updatePlatformSettings,
  type PlatformSetting,
} from '../../services/platform-setting/platform-setting.service';

/* MARKER-MAKE-KIT-INVOKED */
type SetupStep = 'setup-required' | 'configured';

interface PlatformData {
  name: string;
  email: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
}

interface PlatformFiles {
  logoFile: File | null;
  bannerFile: File | null;
}

const emptyPlatformFiles = (): PlatformFiles => ({
  logoFile: null,
  bannerFile: null,
});

interface PlatformMeta {
  id: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

const emptyPlatformData = (): PlatformData => ({
  name: '', email: '', logoUrl: '', bannerUrl: '', description: '',
});

function toPlatformData(setting: PlatformSetting): PlatformData {
  return {
    name: setting.platformName,
    email: setting.platformEmail,
    logoUrl: setting.logoUrl ?? '',
    bannerUrl: setting.bannerUrl ?? '',
    description: setting.description ?? '',
  };
}

function toFormData(data: PlatformData, files: PlatformFiles): FormData {
  const formData = new FormData();
  formData.append('platformName', data.name.trim());
  formData.append('platformEmail', data.email.trim());
  formData.append('description', data.description.trim());
  if (files.logoFile) formData.append('logoUrl', files.logoFile);
  if (files.bannerFile) formData.append('bannerUrl', files.bannerFile);
  return formData;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function validate(data: PlatformData, files: PlatformFiles, requireFiles = false) {
  const hasLogo = !!files.logoFile || data.logoUrl.trim().length > 0;
  const hasBanner = !!files.bannerFile || data.bannerUrl.trim().length > 0;

  return {
    name: data.name.trim().length === 0 ? 'Platform name is required.' : null,
    email: data.email.trim().length === 0 ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'Invalid email format.' : null,
    logoUrl: requireFiles
      ? (!files.logoFile ? 'Logo image is required.' : null)
      : (!hasLogo ? 'Logo image is required.' : null),
    bannerUrl: requireFiles
      ? (!files.bannerFile ? 'Banner image is required.' : null)
      : (!hasBanner ? 'Banner image is required.' : null),
    description: data.description.trim().length === 0 ? 'Description is required.' : null,
  };
}

function isValid(data: PlatformData, files: PlatformFiles, requireFiles = false) {
  const e = validate(data, files, requireFiles);
  return Object.values(e).every(v => v === null);
}

export function PlatformSetup() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearRequiresPlatformSetup = useAuthStore((state) => state.clearRequiresPlatformSetup);

  const [step, setStep] = useState<SetupStep>('setup-required');
  const [activeNav, setActiveNav] = useState('Settings');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showSaving, setShowSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [metaData, setMetaData] = useState<PlatformMeta>({
    id: '—',
    createdAt: '—',
    createdBy: user?.fullName ?? 'Admin',
    status: 'Setup Required',
  });
  const [savedForm, setSavedForm] = useState<PlatformData>(emptyPlatformData());

  const [setup, setSetup] = useState<PlatformData>(emptyPlatformData());
  const [setupFiles, setSetupFiles] = useState<PlatformFiles>(emptyPlatformFiles());
  const [setupTouched, setSetupTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<PlatformData>(emptyPlatformData());
  const [formFiles, setFormFiles] = useState<PlatformFiles>(emptyPlatformFiles());
  const [savedFormFiles, setSavedFormFiles] = useState<PlatformFiles>(emptyPlatformFiles());

  const navItems = ['Dashboard', 'Users', 'Courses', 'Learning Paths', 'Organizations', 'Approvals', 'Analytics', 'Settings'];
  const setupErrors = validate(setup, setupFiles, true);
  const formErrors = validate(form, formFiles, false);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  };

  const [setupLogoPreview, setSetupLogoPreview] = useState('');
  const [setupBannerPreview, setSetupBannerPreview] = useState('');
  const [formLogoPreview, setFormLogoPreview] = useState('');
  const [formBannerPreview, setFormBannerPreview] = useState('');

  const applySetting = (setting: PlatformSetting) => {
    const mapped = toPlatformData(setting);
    const clearedFiles = emptyPlatformFiles();
    setForm(mapped);
    setSavedForm(mapped);
    setFormFiles(clearedFiles);
    setSavedFormFiles(clearedFiles);
    setFormLogoPreview('');
    setFormBannerPreview('');
    setMetaData({
      id: String(setting.settingId),
      createdAt: formatDate(setting.createdAt),
      createdBy: user?.fullName ?? 'Admin',
      status: 'Active',
    });
  };

  useEffect(() => {
    if (!setupFiles.logoFile) {
      setSetupLogoPreview('');
      return;
    }
    const url = URL.createObjectURL(setupFiles.logoFile);
    setSetupLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [setupFiles.logoFile]);

  useEffect(() => {
    if (!setupFiles.bannerFile) {
      setSetupBannerPreview('');
      return;
    }
    const url = URL.createObjectURL(setupFiles.bannerFile);
    setSetupBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [setupFiles.bannerFile]);

  useEffect(() => {
    if (!formFiles.logoFile) {
      setFormLogoPreview('');
      return;
    }
    const url = URL.createObjectURL(formFiles.logoFile);
    setFormLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formFiles.logoFile]);

  useEffect(() => {
    if (!formFiles.bannerFile) {
      setFormBannerPreview('');
      return;
    }
    const url = URL.createObjectURL(formFiles.bannerFile);
    setFormBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formFiles.bannerFile]);

  useEffect(() => {
    let cancelled = false;

    const loadPlatformSettings = async () => {
      setIsLoading(true);
      try {
        const { configured } = await getPlatformSettingsStatus();
        if (cancelled) return;

        if (!configured) {
          setStep('setup-required');
          setSetup(emptyPlatformData());
          setSetupFiles(emptyPlatformFiles());
          setMetaData((prev) => ({
            ...prev,
            status: 'Setup Required',
            createdBy: user?.fullName ?? 'Admin',
          }));
          return;
        }

        const setting = await getPlatformSettings();
        if (cancelled) return;

        applySetting(setting);
        setStep('configured');
      } catch {
        if (!cancelled) {
          setStep('setup-required');
          setSubmitError('Unable to load platform settings. Please complete setup.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPlatformSettings();

    return () => {
      cancelled = true;
    };
  }, [user?.fullName]);

  const handleSetupField = (k: keyof PlatformData, v: string) => {
    setSetup(prev => ({ ...prev, [k]: v }));
    setSetupTouched(prev => ({ ...prev, [k]: true }));
  };

  const handleFormField = (k: keyof PlatformData, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setTouched(prev => ({ ...prev, [k]: true }));
  };

  const handleSetupFile = (kind: 'logoUrl' | 'bannerUrl', file: File | null) => {
    if (kind === 'logoUrl') {
      setSetupFiles((prev) => ({ ...prev, logoFile: file }));
    } else {
      setSetupFiles((prev) => ({ ...prev, bannerFile: file }));
    }
    setSetupTouched((prev) => ({ ...prev, [kind]: true }));
  };

  const handleFormFile = (kind: 'logoUrl' | 'bannerUrl', file: File | null) => {
    if (kind === 'logoUrl') {
      setFormFiles((prev) => ({ ...prev, logoFile: file }));
    } else {
      setFormFiles((prev) => ({ ...prev, bannerFile: file }));
    }
    setTouched((prev) => ({ ...prev, [kind]: true }));
  };

  const handleSetupSubmit = async () => {
    setSetupTouched({ name: true, email: true, logoUrl: true, bannerUrl: true, description: true });
    if (!isValid(setup, setupFiles, true)) return;

    setShowSaving(true);
    setSubmitError('');
    try {
      const created = await createPlatformSettings(toFormData(setup, setupFiles));
      applySetting(created);
      clearRequiresPlatformSetup();
      setShowSaving(false);
      toast('Platform settings created successfully.');
      navigate('/admin');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create platform settings.';
      setSubmitError(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      setShowSaving(false);
    }
  };

  const handleSave = async () => {
    setTouched({ name: true, email: true, logoUrl: true, bannerUrl: true, description: true });
    if (!isValid(form, formFiles, false)) return;

    setShowSaving(true);
    try {
      const updated = await updatePlatformSettings(toFormData(form, formFiles));
      applySetting(updated);
      setShowSaving(false);
      toast('Platform settings saved successfully.');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to save platform settings.';
      toast(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      setShowSaving(false);
    }
  };

  const handleReset = () => {
    setShowResetModal(false);
    setForm(savedForm);
    setFormFiles(savedFormFiles);
    setFormLogoPreview('');
    setFormBannerPreview('');
    setTouched({});
    toast('Form reset to last saved values.');
  };

  const resolvePreview = (filePreview: string, savedUrl: string) => filePreview || savedUrl;

  const fileUploadBoxStyle = (err: string | null, t: boolean): CSSProperties => ({
    width: '100%',
    border: `2px dashed ${t && err ? '#FCA5A5' : t && !err ? '#86EFAC' : '#E5E7EB'}`,
    borderRadius: 8,
    padding: '18px 12px',
    fontSize: 13,
    color: '#6B7280',
    outline: 'none',
    background: t && err ? '#FFF5F5' : t && !err ? '#F0FDF4' : '#FAFAFA',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    textAlign: 'center',
    cursor: 'pointer',
  });

  const FileUploadField = ({
    id,
    label,
    file,
    previewUrl,
    err,
    touched: t,
    onFileChange,
    variant,
  }: {
    id: string;
    label: string;
    file: File | null;
    previewUrl: string;
    err: string | null;
    touched: boolean;
    onFileChange: (file: File | null) => void;
    variant: 'logo' | 'banner';
  }) => (
    <div>
      <Label required>{label}</Label>
      <label htmlFor={id} style={fileUploadBoxStyle(err, t)}>
        <input
          id={id}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FFF1F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={18} style={{ color: '#E11D48' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
              {file ? file.name : 'Click to upload image'}
            </p>
            <p style={{ fontSize: 11.5, color: '#9CA3AF' }}>PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      </label>
      <FieldStatus err={err} touched={t} />
      {previewUrl && !err && variant === 'logo' && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={previewUrl}
            alt="Logo preview"
            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: '#E5E7EB' }}
          />
          <span style={{ fontSize: 11.5, color: '#6B7280', wordBreak: 'break-all' }}>
            {file ? file.name : 'Current logo'}
          </span>
        </div>
      )}
      {previewUrl && !err && variant === 'banner' && (
        <div style={{ marginTop: 8, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          <img
            src={previewUrl}
            alt="Banner preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );

  const FieldStatus = ({ err, touched: t }: { err: string | null; touched: boolean }) => {
    if (!t) return null;
    if (err) return <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={11} />{err}</p>;
    return <p style={{ fontSize: 11.5, color: '#16A34A', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={11} />Looks good</p>;
  };

  const inputStyle = (err: string | null, t: boolean): CSSProperties => ({
    width: '100%', border: `1px solid ${t && err ? '#FCA5A5' : t && !err ? '#86EFAC' : '#E5E7EB'}`,
    borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#374151', outline: 'none',
    background: t && err ? '#FFF5F5' : t && !err ? '#F0FDF4' : '#FAFAFA',
    boxSizing: 'border-box' as const, fontFamily: 'inherit', transition: 'border-color 0.15s',
  });

  const Label = ({ children, required }: { children: ReactNode; required?: boolean }) => (
    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
      {children}{required && <span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>}
    </label>
  );

  const MetaRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ width: 180, fontSize: 12.5, color: '#9CA3AF', flexShrink: 0, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: mono ? '#6D28D9' : '#374151', fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', fontWeight: mono ? 500 : 400 }}>{value}</span>
    </div>
  );

  const configChecklist = [
    { key: 'name', label: 'Platform name configured', val: form.name.trim().length > 0 && !formErrors.name },
    { key: 'email', label: 'Email configured', val: form.email.trim().length > 0 && !formErrors.email },
    { key: 'logo', label: 'Logo image configured', val: (form.logoUrl.trim().length > 0 || !!formFiles.logoFile) && !formErrors.logoUrl },
    { key: 'banner', label: 'Banner image configured', val: (form.bannerUrl.trim().length > 0 || !!formFiles.bannerFile) && !formErrors.bannerUrl },
    { key: 'desc', label: 'Description configured', val: form.description.trim().length > 0 },
    { key: 'ready', label: 'Ready for public display', val: isValid(form, formFiles, false) },
  ];

  const apiRoutes = [
    { method: 'POST', path: '/platform-settings', desc: 'Create platform settings' },
    { method: 'GET', path: '/platform-settings/status', desc: 'Check configuration status' },
    { method: 'GET', path: '/platform-settings', desc: 'Fetch current platform settings' },
    { method: 'PUT', path: '/platform-settings', desc: 'Update platform settings' },
  ];

  const methodColor: Record<string, string> = { POST: '#059669', GET: '#2563EB', PUT: '#D97706', DELETE: '#E11D48' };

  const dbFields = ['setting_id', 'platform_name', 'platform_email', 'logo_url', 'banner_url', 'description', 'created_at'];

  if (isLoading) {
    return (
      <div style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6B7280', fontSize: 14 }}>
          <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Loading platform settings...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>

      {/* TOP NAV */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: '#E11D48', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={15} color="#fff" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827', letterSpacing: '-0.3px' }}>SLS</span>
              <span style={{ fontWeight: 400, fontSize: 13, color: '#9CA3AF', marginLeft: 4 }}>Admin</span>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navItems.map(item => (
              <button key={item} onClick={() => setActiveNav(item)} style={{ padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeNav === item ? '#FFF1F3' : 'transparent', color: activeNav === item ? '#E11D48' : '#6B7280', transition: 'all 0.15s' }}>{item}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: '6px 10px', gap: 6, width: 220 }}>
              <Search size={13} style={{ color: '#9CA3AF' }} />
              <input placeholder="Search settings, users, courses..." style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#374151', outline: 'none', width: '100%' }} />
            </div>
            <button style={{ width: 34, height: 34, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell size={15} style={{ color: '#374151' }} />
              <span style={{ position: 'absolute', top: 6, right: 7, width: 6, height: 6, background: '#E11D48', borderRadius: '50%', border: '1.5px solid #fff' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #E11D48, #9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>AD</span>
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111827' }}>Admin</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FIRST-TIME SETUP MODAL */}
      {step === 'setup-required' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#fff', borderRadius: 18, width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, background: '#FFF1F3', border: '1px solid #FECDD3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} style={{ color: '#E11D48' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Complete Platform Setup</h2>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', background: '#FFF7ED', color: '#D97706', borderRadius: 20, border: '1px solid #FDE68A', letterSpacing: '0.3px' }}>REQUIRED SETUP</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Before accessing the admin dashboard, please configure the required platform settings.</p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: '22px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Platform Name */}
              <div>
                <Label required>Platform Name</Label>
                <input
                  value={setup.name}
                  onChange={e => handleSetupField('name', e.target.value)}
                  onBlur={() => setSetupTouched(p => ({ ...p, name: true }))}
                  placeholder="Self Learning System"
                  style={inputStyle(setupErrors.name, !!setupTouched.name)}
                />
                <FieldStatus err={setupErrors.name} touched={!!setupTouched.name} />
              </div>

              {/* Platform Email */}
              <div>
                <Label required>Platform Email</Label>
                <div style={{ position: 'relative' }}>
                  <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    value={setup.email}
                    onChange={e => handleSetupField('email', e.target.value)}
                    onBlur={() => setSetupTouched(p => ({ ...p, email: true }))}
                    placeholder="support@sls.edu.vn"
                    style={{ ...inputStyle(setupErrors.email, !!setupTouched.email), paddingLeft: 30 }}
                  />
                </div>
                <FieldStatus err={setupErrors.email} touched={!!setupTouched.email} />
              </div>

              <FileUploadField
                id="setup-logo-upload"
                label="Platform Logo"
                file={setupFiles.logoFile}
                previewUrl={resolvePreview(setupLogoPreview, setup.logoUrl)}
                err={setupErrors.logoUrl}
                touched={!!setupTouched.logoUrl}
                onFileChange={(file) => handleSetupFile('logoUrl', file)}
                variant="logo"
              />

              <FileUploadField
                id="setup-banner-upload"
                label="Platform Banner"
                file={setupFiles.bannerFile}
                previewUrl={resolvePreview(setupBannerPreview, setup.bannerUrl)}
                err={setupErrors.bannerUrl}
                touched={!!setupTouched.bannerUrl}
                onFileChange={(file) => handleSetupFile('bannerUrl', file)}
                variant="banner"
              />

              {/* Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <Label required>Description</Label>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{setup.description.length}/500</span>
                </div>
                <textarea
                  value={setup.description}
                  onChange={e => { if (e.target.value.length <= 500) handleSetupField('description', e.target.value); }}
                  onBlur={() => setSetupTouched(p => ({ ...p, description: true }))}
                  rows={3}
                  placeholder="Describe the platform purpose and learning mission..."
                  style={{ ...inputStyle(setupErrors.description, !!setupTouched.description), resize: 'vertical', lineHeight: 1.6 }}
                />
                <FieldStatus err={setupErrors.description} touched={!!setupTouched.description} />
              </div>

              {/* System Metadata */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>System Metadata</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Created At', value: 'Auto-generated on save' },
                    { label: 'Created By', value: user?.fullName ?? 'Admin (current session)' },
                    { label: 'Status', value: 'Setup Required' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                      <span style={{ width: 120, fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: '#374151' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 32px 26px', borderTop: '1px solid #F3F4F6' }}>
              {submitError && (
                <div style={{ marginBottom: 12, padding: '10px 12px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 12.5, color: '#BE123C' }}>
                  {submitError}
                </div>
              )}
              <button
                onClick={handleSetupSubmit}
                disabled={showSaving}
                style={{ width: '100%', padding: '12px', background: isValid(setup, setupFiles, true) ? '#E11D48' : '#D1D5DB', border: 'none', borderRadius: 10, cursor: isValid(setup, setupFiles, true) ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
              >
                {showSaving ? (
                  <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                ) : (
                  <><Shield size={15} /> Create Platform Settings</>
                )}
              </button>
              <p style={{ fontSize: 11.5, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>All fields are required. You cannot skip this setup.</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE CONTENT */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px 60px', filter: step === 'setup-required' ? 'blur(3px)' : 'none', pointerEvents: step === 'setup-required' ? 'none' : 'auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {['Dashboard', 'Settings', 'Platform Settings'].map((c, i, arr) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#374151' : '#9CA3AF', fontWeight: i === arr.length - 1 ? 500 : 400 }}>{c}</span>
              {i < arr.length - 1 && <ChevronRight size={12} style={{ color: '#D1D5DB' }} />}
            </div>
          ))}
        </div>

        {/* Page header */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 26px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px', marginBottom: 5 }}>Platform Settings</h1>
            <p style={{ fontSize: 13.5, color: '#6B7280' }}>Configure the global identity, branding, and contact information for your learning platform.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
              <Eye size={14} /> Preview Platform
            </button>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* S2: Platform Identity */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Platform Identity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <Label required>Platform Name</Label>
                  <input value={form.name} onChange={e => handleFormField('name', e.target.value)} onBlur={() => setTouched(p => ({ ...p, name: true }))} placeholder="Self Learning System" style={inputStyle(formErrors.name, !!touched.name)} />
                  <FieldStatus err={formErrors.name} touched={!!touched.name} />
                  <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>This name appears on the platform header and public pages.</p>
                </div>

                <div>
                  <Label required>Platform Email</Label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input value={form.email} onChange={e => handleFormField('email', e.target.value)} onBlur={() => setTouched(p => ({ ...p, email: true }))} placeholder="support@sls.edu.vn" style={{ ...inputStyle(formErrors.email, !!touched.email), paddingLeft: 30 }} />
                  </div>
                  <FieldStatus err={formErrors.email} touched={!!touched.email} />
                  <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Used for system notifications and support contact.</p>
                </div>

                <FileUploadField
                  id="form-logo-upload"
                  label="Platform Logo"
                  file={formFiles.logoFile}
                  previewUrl={resolvePreview(formLogoPreview, form.logoUrl)}
                  err={formErrors.logoUrl}
                  touched={!!touched.logoUrl}
                  onFileChange={(file) => handleFormFile('logoUrl', file)}
                  variant="logo"
                />

                <FileUploadField
                  id="form-banner-upload"
                  label="Platform Banner"
                  file={formFiles.bannerFile}
                  previewUrl={resolvePreview(formBannerPreview, form.bannerUrl)}
                  err={formErrors.bannerUrl}
                  touched={!!touched.bannerUrl}
                  onFileChange={(file) => handleFormFile('bannerUrl', file)}
                  variant="banner"
                />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <Label required>Description</Label>
                    <span style={{ fontSize: 11, color: form.description.length > 450 ? '#E11D48' : '#9CA3AF' }}>{form.description.length}/500</span>
                  </div>
                  <textarea value={form.description} onChange={e => { if (e.target.value.length <= 500) handleFormField('description', e.target.value); }} onBlur={() => setTouched(p => ({ ...p, description: true }))} rows={4} style={{ ...inputStyle(formErrors.description, !!touched.description), resize: 'vertical', lineHeight: 1.7 }} />
                  <FieldStatus err={formErrors.description} touched={!!touched.description} />
                  <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Appears on the platform landing page and public directory listings.</p>
                </div>
              </div>
            </div>

            {/* S4: System Metadata */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>System Metadata</h2>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', background: '#DCFCE7', color: '#16A34A', borderRadius: 20, border: '1px solid #86EFAC' }}>Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <MetaRow label="Platform Setting ID" value={metaData.id} mono />
                <MetaRow label="Created At" value={metaData.createdAt} />
                <MetaRow label="Created By" value={metaData.createdBy} />
                <MetaRow label="Configuration Status" value={metaData.status} />
              </div>
            </div>

            {/* S6: Actions Panel */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: Save, label: 'Save Changes', onClick: handleSave, primary: true },
                  { icon: RotateCcw, label: 'Reset Form', onClick: () => { setForm(savedForm); setFormFiles(savedFormFiles); setFormLogoPreview(''); setFormBannerPreview(''); setTouched({}); }, primary: false },
                  { icon: Globe, label: 'Preview Public Page', onClick: () => { }, primary: false },
                  { icon: FileText, label: 'View Audit Log', onClick: () => { }, primary: false },
                ].map(a => (
                  <button key={a.label} onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: `1px solid ${a.primary ? '#E11D48' : '#E5E7EB'}`, borderRadius: 9, background: a.primary ? '#E11D48' : '#FAFAFA', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: a.primary ? '#fff' : '#374151' }}>
                    <a.icon size={14} style={{ color: a.primary ? '#fff' : '#6B7280' }} /> {a.label}
                  </button>
                ))}
              </div>
              {/* Danger zone */}
              <div style={{ padding: '14px 16px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 2 }}>Danger Zone</p>
                  <p style={{ fontSize: 12, color: '#B91C1C' }}>This will discard unsaved changes and restore the last saved configuration.</p>
                </div>
                <button onClick={() => setShowResetModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  <Trash2 size={13} /> Reset Platform Settings
                </button>
              </div>
            </div>

            {/* API Reference */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Code2 size={15} style={{ color: '#6B7280' }} />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>API Reference</h2>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 7px', background: '#F3F4F6', color: '#6B7280', borderRadius: 20 }}>Developer</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                {apiRoutes.map(r => (
                  <div key={r.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: `${methodColor[r.method]}18`, color: methodColor[r.method], borderRadius: 5, fontFamily: 'monospace', minWidth: 44, textAlign: 'center' }}>{r.method}</span>
                    <span style={{ fontSize: 12.5, fontFamily: 'ui-monospace, monospace', color: '#374151', flex: 1 }}>{r.path}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.desc}</span>
                  </div>
                ))}
              </div>

              {/* DB Schema */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Database size={13} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>platform_settings</span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {dbFields.map(f => (
                    <span key={f} style={{ fontSize: 11.5, padding: '2px 8px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 5, color: '#6D28D9', fontFamily: 'monospace' }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT STICKY */}
          <div style={{ position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Brand Preview */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Brand Preview</p>
                <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>Live</span>
              </div>
              {/* Header mini preview */}
              <div style={{ padding: '0', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, background: '#E11D48', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={12} color="#fff" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{form.name || 'Platform Name'}</span>
                </div>
                {/* Banner mini */}
                <div style={{ height: 60, background: 'linear-gradient(135deg, #1F2937, #374151)', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{form.name || 'Platform Name'}</p>
                    <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Learn. Grow. Achieve.</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{form.description ? (form.description.length > 120 ? form.description.slice(0, 120) + '...' : form.description) : <span style={{ color: '#D1D5DB' }}>Description will appear here...</span>}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <Mail size={11} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: 11.5, color: '#6B7280' }}>{form.email || 'contact@platform.com'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ height: 28, background: '#E11D48', borderRadius: 6, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Get Started</span>
                  </div>
                  <div style={{ height: 28, background: '#F3F4F6', borderRadius: 6, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>Explore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Status */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Configuration Status</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {configChecklist.map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: item.val ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${item.val ? '#BBF7D0' : '#FDE68A'}`, borderRadius: 7 }}>
                    {item.val
                      ? <CheckCircle2 size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                      : <AlertCircle size={13} style={{ color: '#D97706', flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, color: item.val ? '#15803D' : '#92400E', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Overall</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: configChecklist.filter(c => c.val).length === configChecklist.length ? '#16A34A' : '#D97706' }}>
                  {configChecklist.filter(c => c.val).length}/{configChecklist.length} complete
                </span>
              </div>
            </div>

            {/* Empty state hint */}
            {step === 'setup-required' && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <AlertTriangle size={22} style={{ color: '#D97706', marginBottom: 8 }} />
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Platform settings not configured</p>
                <p style={{ fontSize: 11.5, color: '#A16207', marginBottom: 10 }}>Admin must complete the required setup before using the system.</p>
                <button style={{ padding: '6px 14px', background: '#D97706', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff' }}>Start Setup</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', width: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={22} style={{ color: '#E11D48' }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Reset form changes?</h3>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 22 }}>
              This will discard unsaved edits and restore the last saved platform settings from the database.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: '11px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
              <button onClick={handleReset} style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Trash2 size={13} /> Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 400 }}>
          <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{toastMsg}</span>
          <button onClick={() => setShowToast(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8 }}><X size={13} style={{ color: '#9CA3AF' }} /></button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
