import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight, Medal, Award, Crown } from 'lucide-react';
import { useAuthStore } from '../../../../stores/auth/auth.stores';
import { getOverallLeaderboardData } from '../../../../services/leaderboard/leaderboard.service';
import type { LeaderboardEntry } from '../../../../types/leaderboard/leaderboard.types';

export default function MiniLeaderboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await getOverallLeaderboardData(user.userId);
        setLeaderboard(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load mini leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-700 fill-amber-600" />;
    return <span className="text-xs font-bold text-[#6B7280]">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-amber-50 border-amber-200';
    if (rank === 2) return 'bg-slate-50 border-slate-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-[#F9FAFB] border-[#F3F4F6]';
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Leaderboard</h3>
            <p className="text-[11px] text-[#6B7280]">Top 3 Performers</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/learner/leaderboard')}
          className="text-xs text-[#E11D48] hover:text-[#BE123C] font-semibold flex items-center gap-0.5 transition-colors"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <div className="w-5 h-5 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#9CA3AF]">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#9CA3AF]">No leaderboard data available</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((item) => (
            <div
              key={item.userId}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                item.isCurrentUser
                  ? 'bg-[#FFF8F9] border-[#FECDD3] ring-1 ring-[#F43F5E]/30'
                  : getRankBg(item.rank)
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 flex justify-center shrink-0">{getRankBadge(item.rank)}</div>
                <div className="w-7 h-7 rounded-full bg-[#E11D48]/10 text-[#E11D48] font-bold text-xs flex items-center justify-center shrink-0">
                  {item.initials}
                </div>
                <span
                  className={`text-xs truncate max-w-[120px] ${
                    item.isCurrentUser ? 'font-bold text-[#BE123C]' : 'font-medium text-[#374151]'
                  }`}
                  title={item.fullName}
                >
                  {item.fullName} {item.isCurrentUser && '(You)'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#111827]">{item.total.toLocaleString()}</span>
                <span className="text-[10px] text-[#9CA3AF] ml-0.5">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
