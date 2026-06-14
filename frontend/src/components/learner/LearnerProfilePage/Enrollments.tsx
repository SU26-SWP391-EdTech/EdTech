import type { LearnerEnrollments } from '../../../types/learner/learner-profile.types';



const Enrollments = ({enrollments}: LearnerEnrollments) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Enrolled Courses</p>
            </div>
            <div>
                {enrollments.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
                        Bạn chưa đăng ký tham gia khóa học nào.
                    </div>
                ) : (
                    <div>
                        {enrollments.map((e, i) => (
                            <div key={e.course?.courseId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < enrollments.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13.5, fontWeight: 500, color: '#111827', marginBottom: 4 }}>{e.course?.title}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 120, height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                                            <div style={{ width: `${e.progress}%`, height: '100%', background: e.completedAt ? '#16A34A' : '#E11D48', borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: e.completedAt ? '#16A34A' : '#E11D48' }}>
                                            {Math.round(e.progress * 1)}%
                                        </span>
                                    </div>
                                </div>
                                {e.status === 'completed' ? (
                                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', background: '#DCFCE7', color: '#16A34A', borderRadius: 20, border: '1px solid #86EFAC' }}>Completed</span>
                                ) : (
                                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', background: '#FFF7ED', color: '#D97706', borderRadius: 20, border: '1px solid #FDE68A' }}>In Progress</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enrollments;