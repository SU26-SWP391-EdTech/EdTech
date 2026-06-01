import type { Role, RoleMeta } from '../../../types/role/roleNav.types';

export const ROLE_META: Record<Role, RoleMeta> = {
    learner: {
        label: 'Learner',
        color: '#E11D48',
        bg: '#FFF1F3',
        desc: 'Student browsing and completing courses',
    },

    admin: {
        label: 'System Admin',
        color: '#7C3AED',
        bg: '#EDE9FE',
        desc: 'Platform administrator with full access',
    },

    provider: {
        label: 'Course Provider',
        color: '#0EA5E9',
        bg: '#E0F2FE',
        desc: 'Instructor or content creator',
    },

    'academic-manager': {
        label: 'Academic Manager',
        color: '#D97706',
        bg: '#FEF3C7',
        desc: 'Approves courses and manages learning paths',
    },

    guest: {
        label: 'Guest / Public',
        color: '#6B7280',
        bg: '#F3F4F6',
        desc: 'Unauthenticated visitor exploring the platform',
    },
};