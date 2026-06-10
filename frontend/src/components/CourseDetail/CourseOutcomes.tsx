import { CheckCircle2 } from 'lucide-react';
import { Card } from './Card';

interface CourseOutcomesProps {
  outcomes: string[];
}

export function CourseOutcomes({ outcomes }: CourseOutcomesProps) {
  return (
    <Card title="What You'll Learn">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {outcomes.map((o) => (
          <div key={o} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            </div>
            <span className="text-sm text-[#374151]">{o}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
