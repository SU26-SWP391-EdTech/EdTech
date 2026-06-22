import { useState, useEffect } from 'react';
import { Settings, Shield, Mail, BookOpen, AlertCircle, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlatformSettings, updatePlatformSettings } from '../../services/platform-setting/platform-setting.service';
import type { PlatformSetting } from '../../services/platform-setting/platform-setting.service';

export function PlatformSettings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<PlatformSetting | null>(null);

    // Form states
    const [platformName, setPlatformName] = useState('');
    const [platformEmail, setPlatformEmail] = useState('');
    const [description, setDescription] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await getPlatformSettings();
            setSettings(data);
            setPlatformName(data.platformName || '');
            setPlatformEmail(data.platformEmail || '');
            setDescription(data.description || '');
        } catch (err: any) {
            console.error('Failed to load platform settings:', err);
            // If settings not found (e.g., first time configuration), we display an empty form
            if (err.response?.status === 404) {
                toast.error('System settings not configured yet. Please configure the platform.');
            } else {
                toast.error(err.response?.data?.message || 'Failed to load platform settings');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!platformName.trim() || !platformEmail.trim()) {
            toast.error('Platform Name and Email are required.');
            return;
        }

        setSaving(true);
        try {
            const updated = await updatePlatformSettings({
                platformName,
                platformEmail,
                description: description || undefined,
            });
            setSettings(updated);
            toast.success('System configuration saved successfully!');
        } catch (err: any) {
            console.error('Failed to update settings:', err);
            toast.error(err.response?.data?.message || 'Failed to update system settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !settings) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48] mb-3"></div>
                <p className="text-sm text-[#6B7280]">Loading system configurations...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8">
            <div className="max-w-[960px] mx-auto px-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-[#7C3AED]" />
                            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Security & Platform Config</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">System Settings</h1>
                        <p className="text-sm text-[#6B7280] mt-1">Configure global variables, branding materials, and public contact information.</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Form: 8 columns */}
                    <form onSubmit={handleSave} className="col-span-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-3 mb-2">
                            <Settings className="w-4 h-4 text-[#7C3AED]" /> General Branding
                        </h2>

                        {/* Platform Name */}
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1.5">Platform Brand Name *</label>
                            <input
                                type="text"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                placeholder="e.g. EdTech Academy"
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all"
                            />
                        </div>

                        {/* Platform Email */}
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1.5">Support/Contact Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    type="email"
                                    value={platformEmail}
                                    onChange={(e) => setPlatformEmail(e.target.value)}
                                    placeholder="e.g. support@edtech.com"
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all"
                                />
                            </div>
                        </div>



                        {/* Platform Description */}
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1.5">System Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write a short pitch or description of the platform's vision..."
                                rows={4}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 resize-none transition-all"
                            />
                        </div>

                        {/* Footer action */}
                        <div className="border-t border-[#F3F4F6] pt-4 mt-2 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm hover:bg-[#6D28D9] font-medium transition-all shadow-sm shadow-[#7C3AED]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>

                    {/* Right Info: 4 columns */}
                    <div className="col-span-4 flex flex-col gap-4">
                        {/* Status Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-2">SYSTEM STATUS</p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 bg-[#16A34A] rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold text-[#16A34A]">Live & Synchronized</span>
                            </div>
                            <div className="text-xs text-[#6B7280] leading-relaxed flex flex-col gap-2">
                                <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                                    <span>Setup Status</span>
                                    <span className="font-medium text-[#111827]">{settings ? 'Configured' : 'Unconfigured'}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                                    <span>Database Entry ID</span>
                                    <span className="font-medium text-[#111827]">{settings?.settingId || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Sync</span>
                                    <span className="font-medium text-[#111827]">{settings ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
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
