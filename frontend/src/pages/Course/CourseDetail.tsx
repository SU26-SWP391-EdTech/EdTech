import toast from 'react-hot-toast';
import { useCourseDetail } from '../../components/CourseDetail/useCourseDetail';
import { CourseHero } from '../../components/CourseDetail/CourseHero';
import { CourseOverview } from '../../components/CourseDetail/CourseOverview';
import { CourseOutcomes } from '../../components/CourseDetail/CourseOutcomes';
import { CourseCurriculum } from '../../components/CourseDetail/CourseCurriculum';
import { CourseProviderCard } from '../../components/CourseDetail/CourseProviderCard';
import { RelatedCourses } from '../../components/CourseDetail/RelatedCourses';
import { CourseSidebar } from '../../components/CourseDetail/CourseSidebar';

export function CourseDetail() {
  const {
    matchedCourse,
    role,
    enrolled,
    progressVal,
    completedLessons,
    totalLessons,
    dynamicCurriculum,
    categoryLabel,
    difficultyLabel,
    instructorName,
    instructorAvatar,
    skills,
    outcomes,
    prerequisites,
    audience,
    handleEnroll,
    navigate,
  } = useCourseDetail();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <CourseHero
        course={matchedCourse}
        role={role}
        enrolled={enrolled}
        progressVal={progressVal}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        handleEnroll={handleEnroll}
        categoryLabel={categoryLabel}
        difficultyLabel={difficultyLabel}
        instructorName={instructorName}
        instructorAvatar={instructorAvatar}
      />

      {/* Main Grid */}
      <div className="max-w-[1376px] mx-auto px-8 py-8 grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <CourseOverview
            description={matchedCourse.description}
            audience={audience}
            prerequisites={prerequisites}
          />

          <CourseOutcomes outcomes={outcomes} />

          <CourseCurriculum
            curriculum={dynamicCurriculum}
            totalLessons={totalLessons}
            duration={matchedCourse.duration}
            enrolled={enrolled}
          />

          <CourseProviderCard
            instructorName={instructorName}
            instructorAvatar={instructorAvatar}
            onViewProfile={() => {
              if (role === 'guest') {
                toast.error('Please sign in to view provider profile.');
                navigate('/login');
              } else {
                toast.success(`Navigating to ${instructorName}'s profile...`);
              }
            }}
          />

          <RelatedCourses
            onViewCourse={(title) => {
              toast.success(`Viewing details for ${title}`);
            }}
          />
        </div>

        <CourseSidebar
          enrolled={enrolled}
          progressVal={progressVal}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          role={role}
          handleEnroll={handleEnroll}
          duration={matchedCourse.duration}
          curriculumLength={dynamicCurriculum.length}
          skills={skills}
        />
      </div>
    </div>
  );
}
