type RoleCarrier = {
    roleName?: string | null;
    role?: {
        roleName?: string | null;
    } | null;
} | null | undefined;

const ROLE_LABELS: Record<string, string> = {
    learner: 'Learner',
    admin: 'Admin',
    'course provider': 'Course Provider',
    'academic manager': 'Academic Manager',
};

export function normalizeRoleName(roleName?: string | null) {
    return roleName?.trim().toLowerCase() || '';
}

export function getRoleLabel(roleName?: string | null, fallback = 'User') {
    const normalizedRole = normalizeRoleName(roleName);
    return ROLE_LABELS[normalizedRole] || roleName || fallback;
}

export function getUserRoleName(user: RoleCarrier) {
    return normalizeRoleName(user?.roleName || user?.role?.roleName);
}

export function getUserRoleLabel(user: RoleCarrier, fallback = 'User') {
    return getRoleLabel(user?.roleName || user?.role?.roleName, fallback);
}
