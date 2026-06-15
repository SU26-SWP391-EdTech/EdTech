import type { LearnerLearningPaths } from '../../../types/user/learner-profile.types';
import { Route } from 'lucide-react';

const LearningPaths = ({ learningPaths, enrollments }: LearnerLearningPaths) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Enrolled Learning Paths</p>
            </div>
            <div>
                {learningPaths.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
                        Bạn chưa đăng ký tham gia lộ trình học tập nào.
                    </div>
                ) : (
                    <div>
                        {learningPaths.map((path, i) => {
                            const pathCourses = path.learningPathCourses || [];
                            const totalCourses = pathCourses.length;
                            
                            // Tính số khóa học đã hoàn thành trong Path này
                            const completedInPath = pathCourses.filter(pc => 
                                enrollments.some(e => 
                                    e.course?.courseId === pc.courseId && 
                                    (e.status === 'completed' || e.progress === 100)
                                )
                            ).length;

                            // Tính số khóa học đang học (đã enroll nhưng chưa completed)
                            const enrolledInPath = pathCourses.filter(pc => 
                                enrollments.some(e => 
                                    e.course?.courseId === pc.courseId
                                )
                            ).length;

                            const progressPercent = totalCourses > 0 
                                ? Math.round((completedInPath / totalCourses) * 100) 
                                : 0;

                            const levelColor = path.level === 'beginner' 
                                ? { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }
                                : path.level === 'intermediate'
                                ? { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
                                : { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };

                            return (
                                <div key={path.learningPathId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: i < learningPaths.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Route size={18} style={{ color: '#E11D48' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }}>{path.title}</p>
                                            <span style={{ 
                                                fontSize: 10, 
                                                fontWeight: 600, 
                                                padding: '1px 6px', 
                                                background: levelColor.bg, 
                                                color: levelColor.text, 
                                                borderRadius: 12, 
                                                border: `1px solid ${levelColor.border}`,
                                                textTransform: 'capitalize'
                                            }}>
                                                {path.level}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 120, height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                                                <div style={{ width: `${progressPercent}%`, height: '100%', background: '#E11D48', borderRadius: 4 }} />
                                            </div>
                                            <span style={{ fontSize: 11.5, color: '#6B7280' }}>
                                                {completedInPath}/{totalCourses} Courses Completed ({progressPercent}%)
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        fontSize: 11, 
                                        fontWeight: 500, 
                                        color: '#4B5563', 
                                        background: '#F3F4F6', 
                                        padding: '2px 8px', 
                                        borderRadius: 6 
                                    }}>
                                        {enrolledInPath} Enrolled
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPaths;
