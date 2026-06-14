import { useLearnerProfile } from '../../components/LearnerProfile/useLearnerProfile';
import { EditProfileModal } from '../../components/LearnerProfile/EditProfileModal';
import { ProfileHeader } from '../../components/LearnerProfile/ProfileHeader';
import { ProfileStats } from '../../components/LearnerProfile/ProfileStats';
import { CourseHistoryTable } from '../../components/LearnerProfile/CourseHistoryTable';

const COMPLETED_PATHS = [
  {
    title: 'Frontend Developer Path', pct: 100, date: 'Mar 20, 2026',
    skills: ['React', 'TypeScript', 'CSS', 'Webpack'], color: '#E11D48', bg: 'from-[#E11D48] to-[#7C3AED]',
  },
  {
    title: 'Data Analytics Foundation', pct: 100, date: 'May 15, 2026',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics'], color: '#6366F1', bg: 'from-[#6366F1] to-[#0EA5E9]',
  },
  {
    title: 'Java Backend Roadmap', pct: 72, date: 'In progress',
    skills: ['Java', 'Spring Boot', 'Docker', 'REST APIs'], color: '#F59E0B', bg: 'from-[#F59E0B] to-[#EF4444]',
  },
];

export function LearnerProfile() {
  const {
    showEdit,
    setShowEdit,
    loading,
    profile,
    handleSaveProfile
  } = useLearnerProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48] mb-3"></div>
        <p className="text-sm text-[#6B7280]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {showEdit && (
        <EditProfileModal
          onClose={() => setShowEdit(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-8 py-8">

        {/* ── PROFILE HEADER ── */}
        <ProfileHeader profile={profile} onEditClick={() => setShowEdit(true)} />

        {/* ── STAT CARDS ── */}
        <ProfileStats />

        {/* ── MAIN 2-COLUMN GRID ── */}
        <div className="flex gap-5 mb-6">
          {/* LEFT: About */}
          <div className="w-[268px] flex-shrink-0 space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>About Me</p>
              <p className="text-[#6B7280] text-xs" style={{ lineHeight: 1.7 }}>
                {profile.bio || 'No biography provided yet. Edit your profile to add a bio!'}
              </p>
            </div>
          </div>

          {/* RIGHT: Completed Learning Paths */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-4" style={{ fontWeight: 600 }}>Learning Paths</p>
              <div className="space-y-3">
                {COMPLETED_PATHS.map(p => (
                  <div key={p.title} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    {/* Mini banner */}
                    <div className={`h-10 bg-gradient-to-r ${p.bg} relative`}>
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>{p.title}</p>
                        {p.pct === 100
                          ? <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] text-[11px] rounded-full" style={{ fontWeight: 500 }}>Completed</span>
                          : <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] text-[11px] rounded-full" style={{ fontWeight: 500 }}>In Progress</span>
                        }
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? '#10B981' : p.color }} />
                        </div>
                        <span className="text-[11px] text-[#6B7280]" style={{ fontWeight: 500 }}>{p.pct}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {p.skills.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-[10px] rounded-full">{s}</span>
                          ))}
                          {p.skills.length > 3 && <span className="text-[#9CA3AF] text-[10px]">+{p.skills.length - 3}</span>}
                        </div>
                        <p className="text-[#9CA3AF] text-[11px]">{p.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── COURSE HISTORY TABLE ── */}
        <CourseHistoryTable />
      </div>
    </div>
  );
}