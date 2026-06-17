import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid
} from 'recharts';
import {
    Users, BookOpen, GraduationCap, TrendingUp, TrendingDown,
    Bell, CheckCircle2, Clock, MoreHorizontal, ChevronRight,
    Home, Plus, Search, Filter, Download, Eye, Edit2, Trash2,
    ArrowUpRight, Zap, Star, AlertCircle, ChevronDown,
    BarChart2, Activity, Calendar, Bookmark, ExternalLink, Check, X
} from 'lucide-react';
import { getAdminDashboardStats } from '../../services/admin/admin.service';
import type { DashboardData } from '../../services/admin/admin.service';

const tasks = [
    { title: 'Review new course submissions', priority: 'High', due: 'Today', done: false },
    { title: 'Approve 3 pending organizations', priority: 'High', due: 'Today', done: false },
    { title: 'Update React path curriculum', priority: 'Medium', due: 'Tomorrow', done: true },
    { title: 'Export monthly analytics report', priority: 'Low', due: 'May 30', done: false },
    { title: 'Sync user roles with directory', priority: 'Medium', due: 'May 31', done: false },
];

const notifications = [
    { icon: <AlertCircle className="w-4 h-4 text-[#D97706]" />, text: '12 new user registrations pending review', time: '5m', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
    { icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />, text: 'Q2 analytics report generated successfully', time: '1h', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
    { icon: <Star className="w-4 h-4 text-[#E11D48]" />, text: 'Frontend Path reached 1,000 completions', time: '3h', bg: 'bg-[#FFF1F3]', border: 'border-[#FECDD3]' },
];

import { StatCard } from '../../components/admin/dashboard/StatCard';
import { SectionHeader } from '../../components/admin/dashboard/SectionHeader';
import { ChartTooltip } from '../../components/admin/dashboard/ChartTooltip';
import { AddTaskModal } from '../../components/admin/dashboard/AddTaskModal';

/* ─── Main component ─── */
export function Dashboard() {
    const [activeChart, setActiveChart] = useState<'area' | 'bar'>('area');
    const [taskList, setTaskList] = useState<typeof tasks>(() => {
        const saved = localStorage.getItem('admin_tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved tasks", e);
            }
        }
        return tasks;
    });
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);


    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('admin_tasks', JSON.stringify(taskList));
    }, [taskList]);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await getAdminDashboardStats();
                if (isMounted) {
                    setDashboardData(res);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Failed to load dashboard statistics:", err);
                if (isMounted) {
                    setError("Failed to load dashboard data. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleTask = (index: number) => {
        setTaskList(prev => prev.map((t, i) => i === index ? { ...t, done: !t.done } : t));
    };

    const handleOpenAddTask = () => {
        setShowAddTaskModal(true);
    };

    const handleAddTask = (taskData: { title: string; priority: 'High' | 'Medium' | 'Low'; due: string }) => {
        const newTask = {
            ...taskData,
            done: false
        };
        setTaskList(prev => [newTask, ...prev]);
        setShowAddTaskModal(false);
    };

    const handleDeleteTask = (index: number) => {
        setTaskList(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280]">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-center max-w-sm">
                    <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#111827] mb-1">Error Loading Dashboard</h3>
                    <p className="text-xs text-[#6B7280] mb-4">{error || "No data available"}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { stats, activityData, weeklyEnrollments, learningPaths, recentActivity, tableUsers } = dashboardData;

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            <div className="max-w-[1376px] mx-auto px-8 py-8">

                {/* ── Section 1: Page Header ── */}
                <div className="mb-7">

                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                                Platform Dashboard
                            </h1>
                            <p className="text-[#6B7280] text-sm">
                                Overview of platform activity, learner progress, and system health — updated in real time.
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── Section 2: Statistics Overview ── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard
                        icon={<Users className="w-4 h-4 text-[#6B7280]" />}
                        label="Total Users"
                        value={stats.totalUsers.toLocaleString()}
                        change={stats.totalUsersChange}
                        up={stats.totalUsersUp}
                        sub="vs. last month"
                        sparkData={stats.sparkUsers}
                    />
                    <StatCard
                        icon={<BookOpen className="w-4 h-4 text-[#6B7280]" />}
                        label="Active Learning Paths"
                        value={stats.activePaths.toString()}
                        change={stats.activePathsChange}
                        up={stats.activePathsUp}
                        sub="vs. last month"
                        sparkData={stats.sparkPaths}
                    />
                    <StatCard
                        icon={<GraduationCap className="w-4 h-4 text-[#6B7280]" />}
                        label="Completed Courses"
                        value={stats.completedCourses.toLocaleString()}
                        change={stats.completedCoursesChange}
                        up={stats.completedCoursesUp}
                        sub="this month"
                        sparkData={stats.sparkCourses}
                    />
                </div>

                {/* ── Section 3: Main Content Grid ── */}
                <div className="grid grid-cols-12 gap-4 mb-6">

                    {/* Left column (8 cols) */}
                    <div className="col-span-12 flex flex-col gap-4">

                        {/* Activity Analytics Chart */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Platform Activity</p>
                                    <p className="text-[#9CA3AF] text-xs mt-0.5">Users, enrollments & completions over 12 months</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex border border-[#E5E7EB] rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setActiveChart('area')}
                                            className={`px-3 py-1.5 text-xs transition-colors ${activeChart === 'area' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                                            style={{ fontWeight: 500 }}
                                        >Area</button>
                                        <button
                                            onClick={() => setActiveChart('bar')}
                                            className={`px-3 py-1.5 text-xs transition-colors ${activeChart === 'bar' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                                            style={{ fontWeight: 500 }}
                                        >Bar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-5 mb-4">
                                {[
                                    { label: 'Active Users', color: '#E11D48' },
                                    { label: 'Enrollments', color: '#7C3AED' },
                                    { label: 'Completions', color: '#16A34A' },
                                ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                                        <span className="text-xs text-[#6B7280]">{l.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ height: 180, width: '100%' }}>
                                <ResponsiveContainer width="100%" height={180}>
                                    {activeChart === 'area' ? (
                                        <AreaChart data={activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="dash-gUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.12} />
                                                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="dash-gEnroll" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.10} />
                                                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="dash-gComp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.12} />
                                                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="users" name="Active Users" stroke="#E11D48" strokeWidth={2} fill="url(#dash-gUsers)" dot={false} />
                                            <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#7C3AED" strokeWidth={2} fill="url(#dash-gEnroll)" dot={false} />
                                            <Area type="monotone" dataKey="completions" name="Completions" stroke="#16A34A" strokeWidth={2} fill="url(#dash-gComp)" dot={false} />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={8}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="users" name="Active Users" fill="#E11D48" radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="enrollments" name="Enrollments" fill="#7C3AED" radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="completions" name="Completions" fill="#16A34A" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bottom 2-col: Progress + Activity */}
                        <div className="grid grid-cols-1 gap-4">

                            {/* Learning Progress */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                                <div className="flex flex-col gap-3.5">
                                    {learningPaths.map((path) => (
                                        <div key={path.name}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-[#374151] truncate max-w-[160px]" style={{ fontWeight: 500 }}>{path.name}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-[#9CA3AF]">{path.learners.toLocaleString()}</span>
                                                    <span className="text-xs" style={{ color: path.color, fontWeight: 600 }}>{path.progress}%</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${path.progress}%`, backgroundColor: path.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Weekly bar mini */}
                                <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                                    <p className="text-xs text-[#9CA3AF] mb-2" style={{ fontWeight: 500 }}>WEEKLY ENROLLMENTS</p>
                                    <div style={{ height: 64, width: '100%' }}>
                                        <ResponsiveContainer width="100%" height={64}>
                                            <BarChart data={weeklyEnrollments} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={14}>
                                                <Bar dataKey="value" radius={[3, 3, 0, 0]}
                                                    fill="#E11D48"
                                                    opacity={0.85}
                                                />
                                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal thêm Task mới */}
            {showAddTaskModal && (
                <AddTaskModal
                    onClose={() => setShowAddTaskModal(false)}
                    onAdd={handleAddTask}
                />
            )}
        </div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, string> = {
        High: 'text-[#DC2626]',
        Medium: 'text-[#D97706]',
        Low: 'text-[#6B7280]',
    };
    return (
        <span className={`text-[10px] ${map[priority] ?? 'text-[#6B7280]'}`} style={{ fontWeight: 500 }}>{priority}</span>
    );
}

function TableStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        Active: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
        Invited: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
        Inactive: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${map[status] ?? map.Inactive}`} style={{ fontWeight: 500 }}>
            {status}
        </span>
    );
}
