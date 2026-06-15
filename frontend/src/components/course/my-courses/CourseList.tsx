const CourseList = () => {
    return (
        {
            filtered.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '60px', textAlign: 'center' }}>
                    <BookOpen size={32} style={{ color: '#E5E7EB', marginBottom: 12 }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No courses found</p>
                    <p style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 16 }}>Create your first course to get started.</p>
                    <button style={{ padding: '9px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        Create Course
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(c => {
                        const cfg = STATUS_CFG[c.status];
                        return (
                            <div key={c.courseId} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
                                {/* Thumbnail */}
                                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#1F2937,#374151)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <BookOpen size={22} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{c.title}</p>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <BookOpen size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 12, color: '#6B7280' }}>{c.totalLessons} lessons</span>
                                        </div>
                                        {c.duration && (
                                            <span style={{ fontSize: 12, color: '#6B7280' }}>{c.duration}h</span>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Globe size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 12, color: '#6B7280' }}>{c.language}</span>
                                        </div>
                                        {c.status === 'APPROVED' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Users size={12} style={{ color: '#9CA3AF' }} />
                                                <span style={{ fontSize: 12, color: '#6B7280' }}>{c.enrollmentCount.toLocaleString()} enrolled</span>
                                            </div>
                                        )}
                                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>Updated {c.updatedAt}</span>
                                    </div>
                                    {c.status === 'REJECTED' && (
                                        <p style={{ fontSize: 12, color: '#E11D48', marginTop: 6, fontWeight: 500 }}>
                                            ✗ Rejected — revise and resubmit to change status back to Draft
                                        </p>
                                    )}
                                    {c.status === 'PENDING' && (
                                        <p style={{ fontSize: 12, color: '#D97706', marginTop: 6, fontWeight: 500 }}>
                                            ⏳ Under review by Academic Manager — no edits allowed
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#374151' }}>
                                        <Eye size={13} /> View
                                    </button>
                                    {/* Edit only for DRAFT or REJECTED */}
                                    {(c.status === 'DRAFT' || c.status === 'REJECTED') && (
                                        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#374151' }}>
                                            <Edit2 size={13} /> Edit
                                        </button>
                                    )}
                                    {/* Submit only for DRAFT */}
                                    {c.status === 'DRAFT' && (
                                        <button
                                            onClick={() => setCourses(prev => prev.map(x => x.courseId === c.courseId ? { ...x, status: 'PENDING' } : x))}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff' }}
                                        >
                                            Submit for Review
                                        </button>
                                    )}
                                    {/* Delete only for DRAFT or REJECTED */}
                                    {canDelete(c.status) && (
                                        <button onClick={() => setDeleteId(c.courseId)} style={{ width: 32, height: 32, border: '1px solid #FCA5A5', borderRadius: 8, background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Trash2 size={13} style={{ color: '#E11D48' }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
        }
    )
}

export default CourseList;