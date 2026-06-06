import { useEffect, useState } from 'react';
import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import type { Course } from '../../services/course/course.service';

// TODO: Sau khi tao service that, import ham goi API vao day.
// Vi du:
// import { getCourses } from '../../services/course/course.service';

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      setError('');

      try {
        // TODO: Thay doan nay bang API that tu backend.
        // const data = await getCourses();
        // setCourses(data);
        setCourses([]);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Course Management</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Load real course data from backend and render it here.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C]"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-[#6B7280]">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading courses...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[#BE123C]">{error}</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Check API endpoint, token, or backend response shape.
              </p>
            </div>
          )}

          {!isLoading && !error && courses.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6]">
                <BookOpen className="h-6 w-6 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-semibold text-[#111827]">No courses loaded yet</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Add the real API call in <span className="font-medium">loadCourses</span>, then map the response into state.
              </p>
            </div>
          )}

          {!isLoading && !error && courses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-semibold uppercase text-[#6B7280]">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.courseId} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{course.title}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{course.description}</td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{course.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
