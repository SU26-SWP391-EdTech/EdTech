import { useNavigate } from 'react-router-dom';
import { Swords, ChevronRight } from 'lucide-react';

interface MiniPvpWidgetProps {
  profile?: any;
}

export default function MiniPvpWidget({ profile }: MiniPvpWidgetProps) {
  const navigate = useNavigate();

  // Calculate ELO & Tier from real user profile data
  const pvpPoints = profile?.pvpPoints ?? profile?.elo ?? 0;
  
  const getTier = (points: number) => {
    if (points >= 2000) return { name: 'Diamond', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200', icon: '💎' };
    if (points >= 1600) return { name: 'Master', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: '👑' };
    if (points >= 1300) return { name: 'Gold', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: '🥇' };
    if (points >= 1100) return { name: 'Silver', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: '🥈' };
    return { name: 'Bronze', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: '🥉' };
  };

  const tier = getTier(pvpPoints);

  return (
    <div className="bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
      {/* Background Glow Overlay */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#818CF8]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#E11D48]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">PvP Arena</h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-indigo-200">Real-time knowledge battles</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/learner/pvp')}
          className="text-xs text-indigo-200 hover:text-white font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          Arena <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats Box */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5 flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">PvP ELO Rating</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{pvpPoints.toLocaleString()}</span>
            <span className="text-xs text-amber-300 font-bold">PTS</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-1.5 ${tier.bg}`}>
          <span className="text-sm">{tier.icon}</span>
          <span className={`text-xs font-bold ${tier.color}`}>{tier.name}</span>
        </div>
      </div>
    </div>
  );
}
