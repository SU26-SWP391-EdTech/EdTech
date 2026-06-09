import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Users,
    Compass,
    BarChart2,
    CheckSquare,
    Globe,
} from 'lucide-react';

export const LEARNER_NAV = [
    { id: 'my-learning', label: 'My Learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'paths', label: 'Learning Paths', icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

export const ADMIN_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" />, count: 3, countColor: '#0EA5E9' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
];

export const PROVIDER_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-3.5 h-3.5" />, count: 12 },
    { id: 'students', label: 'Students', icon: <Users className="w-3.5 h-3.5" /> },
];

export const ACADEMIC_MANAGER_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'pending-courses', label: 'Pending Courses', icon: <CheckSquare className="w-3.5 h-3.5" />, count: 8 },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'learning-paths', label: 'Learning Paths', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'providers', label: 'Course Providers', icon: <Users className="w-3.5 h-3.5" /> },
];

export const GUEST_NAV = [
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'paths', label: 'Learning Paths', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'about', label: 'About', icon: <Globe className="w-3.5 h-3.5" /> },
];