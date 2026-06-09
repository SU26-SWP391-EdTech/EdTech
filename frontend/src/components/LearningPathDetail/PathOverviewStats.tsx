import { Code, Zap, Monitor, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CircularProgress from './CircularProgress';

interface PathOverviewStatsProps {
  overallProgress: number;
  remainingHours: number;
  remainingLessons: number;
  completedCourses: number;
  totalCourses: number;
}

const WEEKLY = [
  { day: 'Mon', h: 1.5 }, { day: 'Tue', h: 2.5 }, { day: 'Wed', h: 0 },
  { day: 'Thu', h: 3 }, { day: 'Fri', h: 1 }, { day: 'Sat', h: 0.5 }, { day: 'Sun', h: 0 },
];

const BADGES = [
  { label: 'Foundations', desc: 'Completed basic design/code', icon: <Code className="w-4 h-4" />, earned: true, color: '#E11D48' },
  { label: 'Code Ninja', desc: 'Advanced JS/React done', icon: <Zap className="w-4 h-4" />, earned: true, color: '#D97706' },
  { label: 'Explorer', desc: 'Active study in paths', icon: <Monitor className="w-4 h-4" />, earned: false, color: '#2563EB' },
  { label: 'Full-Stack Dev', desc: 'Complete the path', icon: <Trophy className="w-4 h-4" />, earned: false, color: '#7C3AED' },
];

export default function PathOverviewStats({
  overallProgress,
  remainingHours,
  remainingLessons,
  completedCourses,
  totalCourses
}: PathOverviewStatsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Path stats */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <h3 className="text-[#111827] mb-4" style={{ fontSize: '15px', fontWeight: 700 }}>Your Progress Overview</h3>
        <div className="flex items-center gap-5 mb-4">
          <div className="shrink-0">
            <CircularProgress value={overallProgress} size={90} />
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">Roadmap Stats</p>
            <p className="text-lg text-[#111827] font-bold mt-0.5">{overallProgress}% Done</p>
            <p className="text-xs text-[#6B7280] mt-1">
              <span className="font-semibold text-[#E11D48]">{remainingLessons}</span> lessons left ({remainingHours}h)
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">{completedCourses} of {totalCourses} courses completed</p>
          </div>
        </div>

        {/* Weekly activity */}
        <div className="border-t border-[#F3F4F6] pt-4">
          <p className="text-xs text-[#9CA3AF] mb-3">Weekly Study Hours</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="h" fill="#E11D48" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Badges overview */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <h3 className="text-[#111827] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>Path Credentials</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">Earn professional status indicators as you pass milestones</p>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b, i) => (
            <div key={i} className={`p-3 border rounded-xl flex flex-col justify-between h-24 transition-all ${b.earned ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-white border-[#F3F4F6] opacity-50'}`}>
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: b.color }}>
                  {b.icon}
                </div>
                {b.earned && <span className="text-[9px] text-[#16A34A] font-bold uppercase tracking-wider">Earned</span>}
              </div>
              <div>
                <p className="text-xs font-bold text-[#111827] mt-2 line-clamp-1">{b.label}</p>
                <p className="text-[10px] text-[#9CA3AF] line-clamp-1 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
