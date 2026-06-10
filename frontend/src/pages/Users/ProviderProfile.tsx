import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Award, BookOpen, Mail, Star, Users } from 'lucide-react';
import { MOCK_COURSES, MOCK_PROVIDER_PROFILES } from '../../db/data';
import { useAuthStore } from '../../stores/auth.stores';

export function ProviderProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const providerId = Number(id);

  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  const provider = MOCK_PROVIDER_PROFILES.find(item => item.userId === providerId);
  const providerCourses = useMemo(
    () => MOCK_COURSES.filter(course => course.user?.userId === providerId),
    [providerId],
  );

  const getExplorePath = () => {
    if (role === 'learner') return '/learner/explore';
    if (role === 'course provider') return '/provider/explore';
    return '/explore';
  };

  const getCourseDetailPath = (courseId: number) => {
    if (role === 'learner') return `/learner/courses/detail?id=${courseId}`;
    if (role === 'course provider') return `/provider/courses/detail?id=${courseId}`;
    if (role === 'academic manager') return `/academic/courses/detail?id=${courseId}`;
    return `/courses/detail?id=${courseId}`;
  };

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-8 py-16">
        <div className="max-w-3xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-[#111827] mb-2">Provider not found</h1>
          <p className="text-sm text-[#6B7280] mb-5">This course provider profile does not exist in the mock data.</p>
          <button
            onClick={() => navigate(getExplorePath())}
            className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm font-medium hover:bg-[#BE123C] transition-colors"
          >
            Browse courses
          </button>
        </div>
      </div>
    );
  }

  const initials = provider.fullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const totalLearners = providerCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1180px] mx-auto px-8 py-8">
        <section className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="h-36 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0EA5E9]" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-12 mb-5">
              <div className="w-24 h-24 rounded-2xl bg-[#0EA5E9] border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-extrabold">
                {provider.avatar ? (
                  <img src={provider.avatar} alt={provider.fullName} className="w-full h-full object-cover rounded-2xl" />
                ) : initials}
              </div>
              <button
                onClick={() => navigate(getExplorePath())}
                className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Explore courses
              </button>
            </div>

            <div className="flex items-start justify-between gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[28px] leading-tight font-extrabold text-[#111827]">{provider.fullName}</h1>
                  <span className="px-3 py-1 rounded-lg bg-[#E0F2FE] text-[#0369A1] text-[11px] font-bold uppercase">
                    Course Provider
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-5 text-sm text-[#475569] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {provider.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    {provider.experienceYears} years experience
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    {provider.rating} instructor rating
                  </span>
                </div>
                <p className="text-sm text-[#374151] max-w-3xl leading-7">{provider.bio}</p>
                <p className="mt-4 text-sm text-[#111827] font-semibold">{provider.expertise}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <BookOpen className="w-5 h-5 text-[#0EA5E9] mb-3" />
            <p className="text-2xl font-extrabold text-[#111827]">{providerCourses.length}</p>
            <p className="text-xs text-[#6B7280]">Published courses</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <Users className="w-5 h-5 text-[#10B981] mb-3" />
            <p className="text-2xl font-extrabold text-[#111827]">{totalLearners.toLocaleString()}</p>
            <p className="text-xs text-[#6B7280]">Total learners</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B] mb-3" />
            <p className="text-2xl font-extrabold text-[#111827]">{provider.rating}</p>
            <p className="text-xs text-[#6B7280]">Average rating</p>
          </div>
        </div>

        <section className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#F3F4F6]">
            <h2 className="text-sm font-bold text-[#111827]">Courses by {provider.fullName}</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Courses are sourced from the current mock dataset.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 p-6">
            {providerCourses.map((course) => (
              <button
                key={course.courseId}
                onClick={() => navigate(getCourseDetailPath(course.courseId))}
                className="text-left border border-[#E5E7EB] rounded-xl p-4 hover:border-[#E11D48]/30 hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold text-[#111827] line-clamp-2 mb-2">{course.title}</p>
                <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>{course.duration}h</span>
                  <span>{course.totalLessons} lessons</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
