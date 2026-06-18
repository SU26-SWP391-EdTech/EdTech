import api from '../../lib/axios';

export interface DashboardStats {
  totalUsers: number;
  totalUsersChange: string;
  totalUsersUp: boolean;
  activePaths: number;
  activePathsChange: string;
  activePathsUp: boolean;
  completedCourses: number;
  completedCoursesChange: string;
  completedCoursesUp: boolean;
  sparkUsers: { v: number }[];
  sparkPaths: { v: number }[];
  sparkCourses: { v: number }[];
}

export interface ActivityDataPoint {
  month: string;
  users: number;
  enrollments: number;
  completions: number;
}

export interface WeeklyEnrollmentPoint {
  day: string;
  value: number;
}

export interface TopLearningPath {
  name: string;
  progress: number;
  learners: number;
  color: string;
}

export interface RecentActivityItem {
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  color: string;
}

export interface TableUserItem {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatar: string;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  activityData: ActivityDataPoint[];
  weeklyEnrollments: WeeklyEnrollmentPoint[];
  learningPaths: TopLearningPath[];
  recentActivity: RecentActivityItem[];
  tableUsers: TableUserItem[];
}

export async function getAdminDashboardStats(): Promise<DashboardData> {
  const response = await api.get('/user/admin/dashboard');
  return response.data;
}

export interface AnalyticsStats {
  totalUsers: number;
  totalUsersChange: string;
  totalEnrollments: number;
  totalEnrollmentsChange: string;
  approvedCourses: number;
  approvedCoursesChange: string;
  completionsThisMonth: number;
  completionsChange: string;
}

export interface TopCourseItem {
  courseId: number;
  title: string;
  enrollmentCount: number;
  completionRate: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  activityData: ActivityDataPoint[];
  topCourses: TopCourseItem[];
}

export async function getAdminAnalyticsStats(): Promise<AnalyticsData> {
  const response = await api.get('/user/admin/analytics');
  return response.data;
}
