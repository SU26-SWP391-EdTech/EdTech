import { useCourseDetail } from '../../components/CourseDetail/useCourseDetail';
import { CourseHero } from '../../components/CourseDetail/CourseHero';
import { CourseOverview } from '../../components/CourseDetail/CourseOverview';
import { CourseOutcomes } from '../../components/CourseDetail/CourseOutcomes';
import { CourseCurriculum } from '../../components/CourseDetail/CourseCurriculum';
import { CourseProviderCard } from '../../components/CourseDetail/CourseProviderCard';
import { RelatedCourses } from '../../components/CourseDetail/RelatedCourses';

export function CourseDetail() {
  const {
    matchedCourse,
    providerProfile,
    providerCoursesCount,
    providerLearnerCount,
    relatedCourses,
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
    outcomes,
    prerequisites,
    audience,
    handleEnroll,
    handleContinueCourse,
    getCourseDetailPath,
    getProviderProfilePath,
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
        onContinueCourse={handleContinueCourse}
      />

      {/* Main Grid */}
      <div className="max-w-[1376px] mx-auto px-8 py-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6">
          <CourseOverview
            description={matchedCourse.description || ''}
            audience={audience}
            prerequisites={prerequisites}
          />

          <CourseOutcomes outcomes={outcomes} />

          <CourseCurriculum
            curriculum={dynamicCurriculum}
            totalLessons={totalLessons}
            duration={matchedCourse.duration || 0}
            enrolled={enrolled}
            courseId={matchedCourse.courseId}
          />

          <CourseProviderCard
            instructorName={instructorName}
            instructorAvatar={instructorAvatar}
            expertise={providerProfile?.expertise}
            bio={providerProfile?.bio}
            rating={providerProfile?.rating}
            courseCount={providerCoursesCount}
            learnerCount={providerLearnerCount}
            onViewProfile={() => {
              navigate(getProviderProfilePath(matchedCourse.user?.userId));
            }}
          />

          <RelatedCourses
            courses={relatedCourses}
            onViewCourse={(courseId) => navigate(getCourseDetailPath(courseId))}
          />
        </div>

      </div>
    </div>
  );
}