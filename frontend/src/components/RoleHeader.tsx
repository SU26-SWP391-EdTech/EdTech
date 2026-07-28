import type { Role } from '../types/role/roleNav.types';

import { LearnerHeader } from './header/roleNav/LearnerHeader';
import { AdminHeader } from './header/roleNav/AdminHeader';
import { ProviderHeader } from './header/roleNav/ProviderHeader';
import { AcademicManagerHeader } from './header/roleNav/AcademicManagerHeader';
import { GuestHeader } from './header/roleNav/GuestHeader';

interface RoleHeaderProps {
    role: Role;
}

export function RoleHeader({ role }: RoleHeaderProps) {
    switch (role) {
        case 'learner':
            return <LearnerHeader />;

        case 'admin':
            return <AdminHeader />;

        case 'provider':
            return <ProviderHeader />;

        case 'academic-manager':
            return <AcademicManagerHeader />;

        case 'guest':
            return <GuestHeader />;

        default:
            return <GuestHeader />;
    }
}