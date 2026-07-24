import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/auth/auth.stores";
import {
  getMyEnrollments,
  enrollCourse,
  type Enrollment,
} from "../../services/enrollment/enrollment.service";
import {
  followLearningPath,
  getFollowedLearningPathIds,
  getLearningPaths,
  unfollowLearningPath,
  type LearningPath,
} from "../../services/learning-path/learning-path.service";
import { COURSE_GRADIENTS } from "../../constants/explore.constants";
import { useExploreCourseSearch } from "./useExploreCourseSearch";

function getApiErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message || fallback
  );
}

function matchesLearningPathSearch(path: LearningPath, searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;

  return (
    path.title.toLowerCase().includes(query) ||
    (path.description || "").toLowerCase().includes(query) ||
    (path.learningPathCourses || []).some(
      (item) =>
        item.course?.title?.toLowerCase().includes(query) ||
        (item.course?.description || "").toLowerCase().includes(query),
    )
  );
}

/**
 * Custom hook quản lý chức năng Khám phá (Explore) gồm cả Khóa học (Courses) và Lộ trình học tập (Learning Paths).
 * Hỗ trợ chuyển đổi giữa các Tab danh mục, tìm kiếm đa dạng, lọc theo ngôn ngữ, đăng ký khóa học,
 * theo dõi/bỏ theo dõi lộ trình học tập, tự động xác định trạng thái học tập của user hiện tại.
 */
export function useExplore() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const courseSearch = useExploreCourseSearch();

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [followedPathIds, setFollowedPathIds] = useState<number[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const loadUserExploreData = useCallback(async () => {
    const isLearner = user?.roleName?.toLowerCase() === "learner";
    if (!user || !isLearner) {
      setEnrollments([]);
      setFollowedPathIds([]);
      return;
    }

    const [enrollmentItems, followedIds] = await Promise.all([
      getMyEnrollments(),
      getFollowedLearningPathIds(),
    ]);
    setEnrollments(enrollmentItems);
    setFollowedPathIds(followedIds);
  }, [user]);

  const loadExploreData = useCallback(async () => {
    setIsLoadingPaths(true);
    try {
      const [paths] = await Promise.all([
        getLearningPaths(),
        loadUserExploreData(),
      ]);
      setLearningPaths(paths);
    } catch (error) {
      console.error("Failed to load explore data:", error);
      toast.error("Failed to load explore data.");
    } finally {
      setIsLoadingPaths(false);
    }
  }, [loadUserExploreData]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadExploreData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadExploreData]);

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((item) => item.course?.courseId)),
    [enrollments],
  );

  const filteredCourses = useMemo(() => {
    const isLearner = user?.roleName?.toLowerCase() === "learner";
    if (!isLearner) return courseSearch.courses;
    return courseSearch.courses.filter(
      (course) => !enrolledCourseIds.has(course.courseId),
    );
  }, [courseSearch.courses, enrolledCourseIds, user]);

  const filteredPaths = useMemo(
    () =>
      learningPaths.filter((path) =>
        matchesLearningPathSearch(path, courseSearch.searchTerm),
      ),
    [learningPaths, courseSearch.searchTerm],
  );

  const enrolledPathIds = useMemo(
    () =>
      learningPaths
        .filter((path) =>
          (path.learningPathCourses || []).some((item) =>
            enrolledCourseIds.has(item.courseId),
          ),
        )
        .map((path) => path.learningPathId),
    [learningPaths, enrolledCourseIds],
  );

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      toast.error("Please sign in to enroll in courses.");
      navigate("/login");
      return;
    }
    if (user.roleName?.toLowerCase() !== "learner") {
      toast.error(`As a ${user.roleName}, you cannot enroll in courses.`);
      return;
    }

    try {
      setEnrollingId(courseId);
      await enrollCourse(courseId);
      await loadUserExploreData();
      toast.success("Successfully enrolled in course!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to enroll."));
    } finally {
      setEnrollingId(null);
    }
  };

  const handleFollow = async (learningPathId: number) => {
    if (!user) {
      toast.error("Please sign in to follow learning paths.");
      navigate("/login");
      return;
    }
    if (user.roleName?.toLowerCase() !== "learner") {
      toast.error(`As a ${user.roleName}, you cannot follow learning paths.`);
      return;
    }

    try {
      await followLearningPath(learningPathId);
      setFollowedPathIds(await getFollowedLearningPathIds());
      toast.success("Followed learning path successfully!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to follow."));
    }
  };

  const handleUnfollow = async (learningPathId: number) => {
    try {
      await unfollowLearningPath(learningPathId);
      setFollowedPathIds(await getFollowedLearningPathIds());
      toast.success("Unfollowed learning path successfully!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to unfollow."));
    }
  };

  return {
    ...courseSearch,
    isLoading: isLoadingPaths || courseSearch.isLoadingCourses,
    enrollingId,
    filteredCourses,
    filteredPaths,
    enrollments,
    enrolledPathIds,
    followedPathIds,
    isEnrolled: (courseId: number) => enrolledCourseIds.has(courseId),
    handleEnroll,
    handleFollow,
    handleUnfollow,
    getCourseGradient: (index: number) =>
      COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
    user,
  };
}
