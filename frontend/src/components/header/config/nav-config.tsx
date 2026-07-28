import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Users,
    Compass,
    BarChart2,
    CheckSquare,
    Globe,
    Trophy,
    Swords,
} from 'lucide-react';

export const LEARNER_NAV = [
    { id: 'my-learning', label: 'My Learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'pvp', label: 'PvP Arena', icon: <Swords className="w-3.5 h-3.5" /> },
];

export const ADMIN_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
];

export const PROVIDER_NAV = [
    { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
];

export const ACADEMIC_MANAGER_NAV = [
    { id: 'pending-courses', label: 'Pending Courses', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'learning-paths', label: 'Learning Paths', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
];

export const GUEST_NAV = [
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'about', label: 'About', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
];