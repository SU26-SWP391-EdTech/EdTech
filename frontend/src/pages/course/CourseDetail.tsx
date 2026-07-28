import { useState } from 'react';
import { useCourseDetail } from '../../hooks/course/useCourseDetail';
import { CourseHero } from '../../components/course/detail/CourseHero';
import { CourseOverview } from '../../components/course/detail/CourseOverview';
import { CourseCurriculum } from '../../components/course/detail/CourseCurriculum';
import { CourseProviderCard } from '../../components/course/detail/CourseProviderCard';
import { ApproveCourseModal } from '../../components/course/management/ApproveCourseModal';
import { RejectCourseModal } from '../../components/course/management/RejectCourseModal';


export function CourseDetail() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const {
    matchedCourse,
    providerProfile,
    providerCoursesCount,
    role,
    enrolled,
    progressVal,
    completedLessons,
    totalLessons,
    dynamicCurriculum,
    instructorName,
    instructorAvatar,
    instructorAvatarUrl,
    courseDurationLabel,
    handleEnroll,
    handleContinueCourse,
    isLoading,
    handleApproveCourse,
    handleRejectCourse,
  } = useCourseDetail();

  const confirmApprove = async () => {
    if (isApproving) return;
    setIsApproving(true);
    try {
      await handleApproveCourse(matchedCourse.courseId);
      setShowApproveModal(false);
    } finally {
      setIsApproving(false);
    }
  };

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
        instructorName={instructorName}
        instructorAvatar={instructorAvatar}
        instructorAvatarUrl={instructorAvatarUrl}
        durationLabel={courseDurationLabel}
        onContinueCourse={handleContinueCourse}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
      />

      {/* Main Grid */}
      <div className="max-w-[1376px] mx-auto px-8 py-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6">
          {role === 'course provider' && matchedCourse.status === 'rejected' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="mb-1 font-semibold">Reason for rejection</p>
              <p>{matchedCourse.reviewReason || 'No rejection reason was provided for this earlier review.'}</p>
            </div>
          )}
          <CourseOverview
            description={matchedCourse.description || ''}
          />

          <CourseCurriculum
            curriculum={dynamicCurriculum}
            totalLessons={totalLessons}
            durationLabel={courseDurationLabel}
            enrolled={enrolled}
            courseId={matchedCourse.courseId}
          />

          <CourseProviderCard
            instructorName={instructorName}
            instructorAvatar={instructorAvatar}
            instructorAvatarUrl={instructorAvatarUrl}
            expertise={providerProfile?.expertise}
            bio={providerProfile?.bio}
            rating={providerProfile?.rating}
            courseCount={providerCoursesCount}
          />





        </div>
      </div>

      {showRejectModal && (
        <RejectCourseModal
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          selectedRejectCourseId={matchedCourse.courseId}
          setSelectedRejectCourseId={() => undefined}
          setShowRejectModal={setShowRejectModal}
          handleRejectCourse={handleRejectCourse}
        />
      )}      <ApproveCourseModal
        isOpen={showApproveModal}
        courseTitle={matchedCourse.title}
        providerName={matchedCourse.user?.fullName || 'Unknown provider'}
        lessonCount={totalLessons}
        isApproving={isApproving}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
      />
    </div>
  );
}
