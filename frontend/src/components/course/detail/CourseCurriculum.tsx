import { Card } from './Card';
import type { Module } from '../../types/course/course-detail.types';
import { LessonRow } from './LessonRow';

interface CourseCurriculumProps {
  curriculum: Module[];
  totalLessons: number;
  duration: number;
  enrolled: boolean;
  courseId: number;
}

export function CourseCurriculum({ curriculum, totalLessons, duration, enrolled, courseId }: CourseCurriculumProps) {
  const allLessons = curriculum.flatMap((m) => m.lessons);

  return (
    <Card
      title="Course Curriculum"
      subtitle={`${totalLessons} lessons · ${duration} hours`}
    >
      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white divide-y divide-[#E5E7EB]">
        {allLessons.map((l) => (
          <LessonRow key={l.id} lesson={l} courseId={courseId} />
        ))}
      </div>
    </Card>
  );
}
