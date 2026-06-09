import { Download, Award, ExternalLink, Bookmark } from 'lucide-react';
import { StatusPill } from './StatusPill';
import type { CourseHistoryItem } from './types';

const COURSE_HISTORY: CourseHistoryItem[] = [
  { name: 'React Fundamentals', provider: 'FPT University', status: 'In Progress', pct: 68, date: '—' },
  { name: 'UI/UX Design Basics', provider: 'Coursera', status: 'Completed', pct: 100, date: 'Apr 2, 2026' },
  { name: 'Data Analytics Foundation', provider: 'FPT University', status: 'Completed', pct: 100, date: 'May 15, 2026' },
  { name: 'Java Spring Boot', provider: 'Udemy', status: 'In Progress', pct: 45, date: '—' },
  { name: 'SQL Mastery', provider: 'DataCamp', status: 'Not Started', pct: 0, date: '—' },
];

export function CourseHistoryTable() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
        <div>
          <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Course History</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">All enrolled and completed courses</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
          <Download className="w-3.5 h-3.5" />Export
        </button>
      </div>
      {/* Headers */}
      <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
        {['Course', 'Provider', 'Status', 'Progress', 'Completed', 'Actions'].map(h => (
          <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
        ))}
      </div>
      {COURSE_HISTORY.map((c) => (
        <div key={c.name}
          className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
          style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
          <div>
            <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
          </div>
          <p className="text-[#6B7280] text-sm">{c.provider}</p>
          <div><StatusPill status={c.status} /></div>
          <div className="flex items-center gap-2 pr-4">
            <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${c.pct}%`,
                backgroundColor: c.pct === 100 ? '#10B981' : c.pct > 0 ? '#E11D48' : '#E5E7EB'
              }} />
            </div>
            <span className="text-[11px] text-[#6B7280] w-8 flex-shrink-0" style={{ fontWeight: 500 }}>{c.pct}%</span>
          </div>
          <p className="text-[#6B7280] text-sm">{c.date}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {c.status === 'Completed' && (
              <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Certificate">
                <Award className="w-3.5 h-3.5 text-[#E11D48]" />
              </button>
            )}
            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Course">
              <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Bookmark">
              <Bookmark className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
