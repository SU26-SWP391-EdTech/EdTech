import { Card } from './Card';
import type { Module } from '../../../types/course/course-detail.types';
import { LessonRow } from './LessonRow';

interface CourseCurriculumProps {
  curriculum: Module[];
  totalLessons: number;
  durationLabel: string;
  enrolled: boolean;
  courseId: number;
}

export function CourseCurriculum({ curriculum, totalLessons, durationLabel, courseId }: CourseCurriculumProps) {
  const allLessons = curriculum.flatMap((m) => m.lessons);

  return (
    <Card
      title="Course Curriculum"
      subtitle={`${totalLessons} lessons - ${durationLabel}`}
    >
      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white divide-y divide-[#E5E7EB]">
        {allLessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} />
        ))}
      </div>
    </Card>
  );
}
