/** Role names stored in DB (`roles.role_name`). Must match exactly. */
export const RoleName = {
  ADMIN: 'Admin',
  EDUCATIONAL_ORGANIZATION: 'Educational Organization',
  COURSE_PROVIDER: 'Course Provider',
  LEARNER: 'LEARNER',
} as const;

export type RoleNameValue = (typeof RoleName)[keyof typeof RoleName];

/** All known roles (for seeding / listing). */
export const ALL_ROLE_NAMES: RoleNameValue[] = Object.values(RoleName);

/** Roles users may pick when self-registering (if exposed via API). */
export const SELF_REGISTER_ROLE_NAMES: RoleNameValue[] = [
  RoleName.LEARNER,
  RoleName.COURSE_PROVIDER,
];
