import { type RoleName, ROLE_CFG } from './UserRoleBadge';

interface UserRoleGridProps {
  value: RoleName;
  onChange: (role: RoleName) => void;
}

export function UserRoleGrid({ value, onChange }: UserRoleGridProps) {
  const roles: RoleName[] = ['Admin', 'Academic Manager', 'Course Provider', 'Learner'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {roles.map(r => {
        const c = ROLE_CFG[r];
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              border: `1.5px solid ${value === r ? c.color : '#E5E7EB'}`,
              borderRadius: 9,
              background: value === r ? c.bg : '#FAFAFA',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ color: c.color }}>{c.icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: value === r ? c.color : '#374151' }}>
              {r}
            </span>
          </button>
        );
      })}
    </div>
  );
}
