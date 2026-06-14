import type { LearnerAbout } from '../../../types/learner/learner-profile.types';



const AboutLearner = ({ editing, bio, setBio, goal, setGoal }: LearnerAbout) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>About</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Bio</label>
                    {editing ? <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', resize: 'vertical', background: '#FAFAFA', boxSizing: 'border-box' as const, fontFamily: 'inherit', lineHeight: 1.6 }} />
                        : <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7 }}>{bio || 'No bio yet'}</p>}
                </div>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Learning Goal</label>
                    {editing ? <input value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} />
                        : <p style={{ fontSize: 13.5, color: '#374151' }}>{goal || 'No learning goal yet'}</p>}
                </div>
            </div>
        </div>
    )
}

export default AboutLearner;