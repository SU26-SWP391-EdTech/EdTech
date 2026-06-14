import { CheckCircle2, Circle } from 'lucide-react';
import { Card } from './Card';

interface CourseOverviewProps {
  description: string;
  audience: string[];
  prerequisites: string[];
}

export function CourseOverview({ description, audience, prerequisites }: CourseOverviewProps) {
  return (
    <Card title="Course Overview">
      <div className="space-y-5">
        <div>
          <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>About this course</p>
          <p className="text-sm text-[#374151] leading-relaxed">
            {description} This comprehensive guide walks you through essential core topics, structures, patterns, and features. Build solid confidence by engaging in practical coding labs and a customized capstone review to complete your learning targets.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 pt-5 border-t border-[#F1F5F9]">
          <div>
            <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Who this course is for</p>
            <ul className="space-y-1.5">
              {audience.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-[#374151]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Prerequisites</p>
            <ul className="space-y-1.5">
              {prerequisites.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-[#374151]">
                  <Circle className="w-3 h-3 text-[#9CA3AF] flex-shrink-0 mt-1" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
