import { Card } from './Card';

interface CourseOverviewProps {
  description: string;
}

export function CourseOverview({ description }: CourseOverviewProps) {
  return (
    <Card title="Course Overview">
      <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>About this course</p>
      <p className="text-sm text-[#374151] leading-relaxed">
        {description || 'No description has been provided for this course yet.'}
      </p>
    </Card>
  );
}
