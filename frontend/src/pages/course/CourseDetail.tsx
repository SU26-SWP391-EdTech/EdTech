import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCourseDetail } from '../../hooks/course/useCourseDetail';
import { CourseHero } from '../../components/course/detail/CourseHero';
import { CourseOverview } from '../../components/course/detail/CourseOverview';
import { CourseOutcomes } from '../../components/course/detail/CourseOutcomes';
import { CourseCurriculum } from '../../components/course/detail/CourseCurriculum';
import { CourseProviderCard } from '../../components/course/detail/CourseProviderCard';
import { RelatedCourses } from '../../components/course/detail/RelatedCourses';

export function CourseDetail() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
    isLoading,
    handleApproveCourse,
    handleRejectCourse,
  } = useCourseDetail();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading course details...</p>
        </div>
      </div>
    );
  }

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
        onApprove={() => handleApproveCourse(matchedCourse.courseId)}
        onReject={() => setShowRejectModal(true)}
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg text-[#111827] mb-2" style={{ fontWeight: 600 }}>Reject Course</h3>
            <p className="text-sm text-[#6B7280] mb-4">Please provide a reason for rejecting this course. This feedback will be sent to the provider.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-all mb-4"
              placeholder="Enter rejection reason here..."
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC]"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error('Rejection reason is required.');
                    return;
                  }
                  handleRejectCourse(matchedCourse.courseId, rejectReason.trim());
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm hover:bg-[#DC2626]"
                style={{ fontWeight: 500 }}
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
