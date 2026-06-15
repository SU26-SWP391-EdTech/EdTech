import { BookOpen, Users, Globe, CheckCircle2, FileText, AlertCircle, XCircle } from 'lucide-react';
import type { ProviderCoursesProps } from '../../../types/provider/provider-profile.types';

type CourseStatus = 'draft' | 'pending' | 'approved' | 'rejected';

const STATUS_MAP: Record<CourseStatus, { bg: string; color: string; label: string; icon: any }> = {
  approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Approved', icon: CheckCircle2 },
  pending: { bg: '#FFF7ED', color: '#D97706', label: 'Pending', icon: AlertCircle },
  draft: { bg: '#F3F4F6', color: '#6B7280', label: 'Draft', icon: FileText },
  rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected', icon: XCircle },
};

const PublishedCourses = ({ courses }: ProviderCoursesProps) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Courses Created</p>
                <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>{courses.length} total · {courses.filter(c => c.status === 'approved').length} approved</p>
            </div>
            {courses.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
                    No courses created yet.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                {['Course', 'Status', 'Lessons', 'Enrolled', 'Language', 'Created'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c, i) => {
                                const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.draft;
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <tr key={c.courseId} style={{ borderBottom: i < courses.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                        <td style={{ padding: '14px 16px', fontSize: 13.5, fontWeight: 500, color: '#111827' }}>{c.title}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: 4, 
                                                fontSize: 12, 
                                                fontWeight: 600, 
                                                padding: '3px 9px', 
                                                borderRadius: 20, 
                                                background: statusInfo.bg, 
                                                color: statusInfo.color 
                                            }}>
                                                <StatusIcon size={12} />
                                                <span>{statusInfo.label}</span>
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <BookOpen size={13} style={{ color: '#9CA3AF' }} />
                                                <span style={{ fontSize: 13, color: '#374151' }}>{c.totalLessons}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Users size={13} style={{ color: '#9CA3AF' }} />
                                                <span style={{ fontSize: 13, color: '#374151' }}>{(c.enrollmentCount || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Globe size={13} style={{ color: '#9CA3AF' }} />
                                                <span style={{ fontSize: 13, color: '#374151' }}>{c.language || 'English'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 12.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PublishedCourses;
