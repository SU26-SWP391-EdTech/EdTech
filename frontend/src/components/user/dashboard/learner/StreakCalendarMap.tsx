import { useMemo } from 'react';
import { Trophy, Heart } from 'lucide-react';
import StreakFlame from './StreakFlame';

interface StreakCalendarMapProps {
    activeDates: string[]; // ['YYYY-MM-DD', ...]
    currentStreak?: number;
    longestStreak?: number;
    streakLife?: number;
}

interface DayData {
    dateStr: string;
    dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
    month: number; // 0-11
    monthName: string;
    level: number; // 0 (none), 1 (active)
    isActive: boolean;
    label: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StreakCalendarMap({
    activeDates,
    currentStreak = 0,
    longestStreak = 0,
    streakLife = 1
}: StreakCalendarMapProps) {
    // Generate 52 weeks (364 days) of contribution data based strictly on real activeDates
    const { weeks, monthHeaders } = useMemo(() => {
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
        
        // Find the Saturday of the current week (end of grid)
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

        // Start 51 weeks before the Sunday of the current week (52 weeks total)
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - (52 * 7 - 1));

        // Map real activeDates occurrences
        const activeMap = new Map<string, number>();
        activeDates.forEach(date => {
            activeMap.set(date, (activeMap.get(date) || 0) + 1);
        });

        const allWeeks: DayData[][] = [];
        let currentWeek: DayData[] = [];

        const headers: { colIndex: number; name: string }[] = [];
        let lastMonth = -1;

        const cursor = new Date(startDate);
        let colIndex = 0;

        while (cursor <= endDate) {
            const year = cursor.getFullYear();
            const month = cursor.getMonth();
            const dayNum = cursor.getDate();
            const dayOfWeek = cursor.getDay();

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const activityCount = activeMap.get(dateStr) || 0;
            const isActive = activityCount > 0;
            
            // Assign level strictly based on real activity count
            let level = 0;
            if (activityCount >= 4) level = 4;
            else if (activityCount >= 3) level = 3;
            else if (activityCount >= 2) level = 2;
            else if (activityCount >= 1) level = 1;

            const dayData: DayData = {
                dateStr,
                dayOfWeek,
                month,
                monthName: MONTH_NAMES[month],
                level,
                isActive,
                label: `${MONTH_NAMES[month]} ${dayNum}, ${year}`
            };

            currentWeek.push(dayData);

            // If new month starts and we have enough space from previous header
            if (month !== lastMonth && dayOfWeek === 0) {
                headers.push({ colIndex, name: MONTH_NAMES[month] });
                lastMonth = month;
            }

            if (dayOfWeek === 6) {
                allWeeks.push(currentWeek);
                currentWeek = [];
                colIndex++;
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            allWeeks.push(currentWeek);
        }

        return { weeks: allWeeks, monthHeaders: headers };
    }, [activeDates]);

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-[#9BE9A8] hover:ring-1 hover:ring-[#40C463]';
            case 2: return 'bg-[#40C463] hover:ring-1 hover:ring-[#30A14E]';
            case 3: return 'bg-[#30A14E] hover:ring-1 hover:ring-[#216E39]';
            case 4: return 'bg-[#216E39] hover:ring-1 hover:ring-[#144723]';
            default: return 'bg-[#EBEDF0] hover:bg-gray-300';
        }
    };

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] select-none">
            {/* Header */}
            <div className="mb-4">
                <h4 className="text-base font-bold text-[#111827]">Learning Activity</h4>
                <p className="text-xs text-[#6B7280]">
                    {activeDates.length} {activeDates.length === 1 ? 'contribution' : 'contributions'} in the last year
                </p>
            </div>

            {/* Content Row: Left Heatmap Grid + Right Height-Matched Streak Card */}
            <div className="flex flex-col lg:flex-row items-start lg:items-stretch justify-between gap-6">
                {/* Left: Heatmap Grid Area */}
                <div className="flex-1 overflow-x-auto">
                    <div className="inline-block min-w-max">
                        {/* Month Headers */}
                        <div className="flex text-[11px] text-[#57606A] mb-1.5 pl-8 relative h-4">
                            {monthHeaders.map((header) => (
                                <span
                                    key={`${header.name}-${header.colIndex}`}
                                    className="absolute font-medium"
                                    style={{ left: `${header.colIndex * 16.5 + 32}px` }}
                                >
                                    {header.name}
                                </span>
                            ))}
                        </div>

                        {/* Heatmap Grid Main Area */}
                        <div className="flex gap-1.5">
                            {/* Day of week labels */}
                            <div className="flex flex-col justify-between text-[10px] text-[#57606A] pr-2 py-0.5 font-medium h-[115px]">
                                <span className="h-3 leading-3 opacity-0">Sun</span>
                                <span className="h-3 leading-3">Mon</span>
                                <span className="h-3 leading-3 opacity-0">Tue</span>
                                <span className="h-3 leading-3">Wed</span>
                                <span className="h-3 leading-3 opacity-0">Thu</span>
                                <span className="h-3 leading-3">Fri</span>
                                <span className="h-3 leading-3 opacity-0">Sat</span>
                            </div>

                            {/* 52 Columns of Weeks */}
                            <div className="flex gap-[3.5px]">
                                {weeks.map((week, wIdx) => (
                                    <div key={wIdx} className="flex flex-col gap-[3.5px]">
                                        {week.map((day) => (
                                            <div
                                                key={day.dateStr}
                                                className={`w-[13px] h-[13px] rounded-[2.5px] transition-colors cursor-pointer group relative ${getLevelColor(
                                                    day.level
                                                )}`}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#1F2937] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-30 shadow-lg pointer-events-none">
                                                    <span className="font-semibold">{day.label}</span>: {day.isActive ? 'Active learning day' : 'No activity'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Legend */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-[#57606A] pt-2 border-t border-[#F3F4F6]">
                            <span className="hover:underline cursor-pointer">Learn how we count contributions</span>
                            
                            <div className="flex items-center gap-1.5">
                                <span>Less</span>
                                <div className="flex items-center gap-[3px]">
                                    <div className="w-[11px] h-[11px] rounded-[2px] bg-[#EBEDF0]" title="No activity" />
                                    <div className="w-[11px] h-[11px] rounded-[2px] bg-[#9BE9A8]" title="Low activity" />
                                    <div className="w-[11px] h-[11px] rounded-[2px] bg-[#40C463]" title="Medium activity" />
                                    <div className="w-[11px] h-[11px] rounded-[2px] bg-[#30A14E]" title="High activity" />
                                    <div className="w-[11px] h-[11px] rounded-[2px] bg-[#216E39]" title="Highest activity" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Height-Matched Streak Flame Card (no extra vertical white space) */}
                <div className="w-full lg:w-72 bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5]/40 to-[#FFF1F2] border border-[#FED7AA] rounded-2xl p-4 shadow-xs flex flex-col justify-between items-center text-center shrink-0 relative overflow-hidden h-[162px]">
                    {/* Background glow */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center gap-3">
                        <StreakFlame streak={currentStreak} size="md" showText={false} />
                        <div className="text-left">
                            <p className="text-[10px] text-[#9A3412] uppercase font-bold tracking-wider">Learning Streak</p>
                            <p className="text-xl font-black text-[#C2410C]">
                                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} 🔥
                            </p>
                        </div>
                    </div>

                    {/* Sub Badges (Longest & Lives) */}
                    <div className="flex items-center gap-2 w-full pt-2.5 border-t border-[#FDBA74]/40 text-xs">
                        {/* Best Record */}
                        <div className="flex-1 bg-white/80 backdrop-blur-xs border border-[#FED7AA] py-1 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-bold text-[#475569] text-[11px] truncate">Best: {longestStreak}d</span>
                        </div>

                        {/* Lives */}
                        <div className="flex-1 bg-white/80 backdrop-blur-xs border border-[#FECDD3] py-1 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs text-[#E11D48]">
                            <Heart className="w-3.5 h-3.5 text-[#F43F5E] fill-[#F43F5E] shrink-0" />
                            <span className="font-bold text-[#E11D48] text-[11px]">{streakLife}/2 Lives</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
