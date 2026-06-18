import type { ProviderAbout } from '../../../types/user/provider-profile.types';

const AboutProvider = ({ editing, expertise, setExpertise, experienceYears, setExperienceYears, canEdit }: ProviderAbout) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Professional Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Expertise</label>
                    {editing && canEdit ? (
                        <input 
                            value={expertise} 
                            onChange={e => setExpertise(e.target.value)} 
                            placeholder="e.g. Software Engineering, Data Science"
                            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} 
                        />
                    ) : (
                        <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7 }}>{expertise || 'No expertise specified'}</p>
                    )}
                </div>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Years of Experience</label>
                    {editing && canEdit ? (
                        <input 
                            type="number" 
                            value={experienceYears} 
                            onChange={e => setExperienceYears(e.target.value)} 
                            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} 
                        />
                    ) : (
                        <p style={{ fontSize: 13.5, color: '#374151' }}>{experienceYears || '0'} years</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutProvider;
