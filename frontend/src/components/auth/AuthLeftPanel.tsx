import { ArrowLeft, Award, BookOpen, Star, Users } from 'lucide-react';
import { type AuthScreen } from '../../types/auth/auth';

const LEFT_COPY: Record<AuthScreen, { title: string; sub: string }> = {
  signin: { title: 'Continue your\nlearning journey', sub: 'Pick up right where you left off.' },
  signup: { title: 'Start building\nyour future today', sub: 'Join 50,000+ learners worldwide.' },
  forgot: { title: "We've got\nyou covered", sub: 'Get back to learning in seconds.' },
  verify: { title: 'Almost\nthere!', sub: 'One step away from your dashboard.' },
};

export function AuthLeftPanel({ screen }: { screen: AuthScreen }) {
  const copy = LEFT_COPY[screen];

  return (
    <div
      className="w-[460px] flex-shrink-0 relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(150deg, #0F172A 0%, #1E1B4B 55%, #0F1629 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute -bottom-44 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.22]" style={{ background: 'radial-gradient(circle, #E11D48, transparent 68%)' }} />
      <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full opacity-[0.1]" style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)' }} />

      <div className="relative z-10 p-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E11D48] flex items-center justify-center shadow-lg shadow-[#E11D48]/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: 700, fontSize: 17 }}>LearningPath</span>
        </div>

        <button
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/5 shadow-sm cursor-pointer"
          style={{ fontSize: 12, fontWeight: 600 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8">
        <h2 className="text-white mb-3" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1.1, whiteSpace: 'pre-line' }}>
          {copy.title}
        </h2>
        <p className="text-white/50 mb-10" style={{ fontSize: 15, lineHeight: 1.55 }}>{copy.sub}</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { val: '50K+', label: 'Learners', icon: <Users className="w-4 h-4" /> },
            { val: '1,200+', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
            { val: '95%', label: 'Completion', icon: <Award className="w-4 h-4" /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-white/30 mb-2">{stat.icon}</div>
              <p className="text-white" style={{ fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{stat.val}</p>
              <p className="text-white/40 mt-1" style={{ fontSize: 11, fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 m-8 mt-0 rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <Star key={item} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
          ))}
        </div>
        <p className="text-white/70 mb-4" style={{ fontSize: 13, lineHeight: 1.65 }}>
          "LearningPath transformed how I approach learning. The structured roadmaps kept me on track and I landed my dream role within 4 months."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #E11D48, #7C3AED)', fontWeight: 700, fontSize: 11 }}>
            AK
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 600, fontSize: 13 }}>Anika Kim</p>
            <p className="text-white/40" style={{ fontSize: 11 }}>Frontend Engineer at Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
