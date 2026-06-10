import { useState, useEffect, useMemo } from 'react';
import {
  getLearningPaths,
  createLearningPath,
  updateLearningPath,
  addCourseToLearningPath,
  removeCourseFromLearningPath,
  getCoursesInLearningPath
} from '../../../services/learning-path/learning-path.service';
import { searchCourses } from '../../../services/course/course.service';
import type { Course } from '../../../services/course/course.service';
import { mapBackendToFrontend } from '../utils/learningPathHelpers';
import type { LearningPath } from '../utils/learningPathHelpers';

export function useLearningPath() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [viewingPath, setViewingPath] = useState<LearningPath | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [deletingPathId, setDeletingPathId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const fetchPathsAndCourses = async () => {
    setLoading(true);
    try {
      const [pathsData, coursesResponse] = await Promise.all([
        getLearningPaths(),
        searchCourses()
      ]);
      const mapped = (pathsData || []).map(mapBackendToFrontend);
      setPaths(mapped);

      const courses = coursesResponse?.data?.items || [];
      setAllCourses(courses);

      if (mapped.length > 0) {
        if (selectedId === null || !mapped.some(p => p.id === selectedId)) {
          setSelectedId(mapped[0].id);
        }
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Error loading learning paths and courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPathsAndCourses();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return paths.filter(p => {
      return !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [search, paths]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, totalPages || 1);

  const paginatedPaths = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, activePage]);

  const selectedPath = paths.find(p => p.id === selectedId) ?? paths[0];

  const stats = useMemo(() => {
    const totalCourses = paths.reduce((s, p) => s + p.courses, 0);
    const totalDurationMins = paths.reduce((s, p) => {
      const hours = parseInt(p.duration, 10) || 0;
      return s + (hours * 60);
    }, 0);
    const avgDurationHours = paths.length > 0
      ? Math.round((totalDurationMins / 60) / paths.length)
      : 0;
    const avgCourses = paths.length > 0
      ? Math.round((totalCourses / paths.length) * 10) / 10
      : 0;

    return {
      total: paths.length,
      totalCourses,
      avgDuration: `${avgDurationHours}h`,
      avgCourses,
    };
  }, [paths]);

  const handleSavePath = async (savedData: { title: string; description: string; courses: Course[]; thumbnailUrl?: string }) => {
    setLoading(true);
    try {
      const bannerUrl = savedData.thumbnailUrl;

      if (editingPath) {
        // 1. Update basic info
        await updateLearningPath(editingPath.id, {
          title: savedData.title,
          description: savedData.description,
          bannerUrl: bannerUrl || undefined,
        });

        // 2. Fetch current courses in path
        const currentCourses = await getCoursesInLearningPath(editingPath.id);

        // 3. Remove all current courses from backend path
        for (const course of currentCourses) {
          await removeCourseFromLearningPath(editingPath.id, course.courseId);
        }

        // 4. Add the selected courses sequentially to preserve ordering
        for (let i = 0; i < savedData.courses.length; i++) {
          const course = savedData.courses[i];
          await addCourseToLearningPath(editingPath.id, {
            courseId: course.courseId,
            position: i + 1
          });
        }
      } else {
        // 1. Create the path
        const newPath = await createLearningPath({
          title: savedData.title,
          description: savedData.description,
          bannerUrl: bannerUrl || undefined,
          level: 'beginner'
        });

        // 2. Add courses sequentially to preserve ordering
        for (let i = 0; i < savedData.courses.length; i++) {
          const course = savedData.courses[i];
          await addCourseToLearningPath(newPath.learningPathId, {
            courseId: course.courseId,
            position: i + 1
          });
        }
      }

      await fetchPathsAndCourses();

      setShowModal(false);
      setEditingPath(null);
      setViewingPath(null);
    } catch (err) {
      console.error("Failed to save learning path:", err);
      alert("An error occurred while saving the learning path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingPathId !== null) {
      setPaths(prev => prev.filter(p => p.id !== deletingPathId));
      if (selectedId === deletingPathId) {
        const remaining = paths.filter(p => p.id !== deletingPathId);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
        } else {
          setSelectedId(null);
        }
      }
    }
    setDeletingPathId(null);
  };

  return {
    search,
    setSearch,
    selectedId,
    setSelectedId,
    showModal,
    setShowModal,
    editingPath,
    setEditingPath,
    viewingPath,
    setViewingPath,
    deletingPathId,
    setDeletingPathId,
    loading,
    allCourses,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    totalPages,
    activePage,
    paginatedPaths,
    selectedPath,
    stats,
    handleSavePath,
    handleConfirmDelete,
    fetchPathsAndCourses
  };
}
