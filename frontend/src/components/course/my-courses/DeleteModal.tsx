const DeleteModal = () => {
    return (
        {deleteId !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 380, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: 44, height: 44, background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <Trash2 size={18} style={{ color: '#E11D48' }} />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Delete course?</h3>
                        <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 20 }}>
                            This will permanently delete the course and all its lessons.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
                            <button onClick={() => { setCourses(p => p.filter(c => c.courseId !== deleteId)); setDeleteId(null); }} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
    )
}

export default DeleteModal;