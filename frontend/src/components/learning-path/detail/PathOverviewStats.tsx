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
    </div>
  );
}
