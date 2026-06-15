import React from 'react';
import { Monitor, Database, Palette, Megaphone, Briefcase } from 'lucide-react';

export type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

export interface RoadmapNode {
  id: number;
  title: string;
  duration: string;
  state: NodeState;
  description: string;
}

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  courses: number;
  duration: string;
  enrollments: number;
  completionRate: number;
  avgProgress: number;
  thumbBg: string;
  thumbIcon: React.ReactNode;
  accentColor: string;
  rating: number;
  nodes: RoadmapNode[];
  thumbnailUrl?: string;
}

export const mapBackendToFrontend = (bp: any): LearningPath => {
  const coursesList = bp.learningPathCourses || [];
  // Sort courses by position
  const sortedCourses = [...coursesList].sort((a: any, b: any) => a.position - b.position);
  
  const nodes: RoadmapNode[] = sortedCourses.map((lpc: any, idx: number) => ({
    id: lpc.course?.courseId || 0,
    title: lpc.course?.title || 'Unknown Course',
    duration: lpc.course?.duration ? `${lpc.course.duration}h` : '8h',
    state: idx === 0 ? 'current' : 'upcoming',
    description: lpc.course?.description || `Learn the concepts of ${lpc.course?.title || 'this course'}`
  }));

  const totalDurationHours = sortedCourses.reduce((sum: number, lpc: any) => sum + (lpc.course?.duration || 8), 0);

  // Dynamic icon and background assignment based on title keywords
  let thumbBg = 'linear-gradient(135deg,#1E40AF,#3B82F6)'; // Blue default
  let thumbIcon = <Monitor className="w-6 h-6 text-white/90" />;
  let accentColor = '#2563EB';

  const titleLower = bp.title.toLowerCase();
  if (titleLower.includes('front') || titleLower.includes('web') || titleLower.includes('ui') || titleLower.includes('react')) {
    thumbBg = 'linear-gradient(135deg, #0EA5E9, #2563EB)';
    thumbIcon = <Monitor className="w-6 h-6 text-white/90" />;
    accentColor = '#0EA5E9';
  } else if (titleLower.includes('back') || titleLower.includes('node') || titleLower.includes('api') || titleLower.includes('database') || titleLower.includes('sql')) {
    thumbBg = 'linear-gradient(135deg, #0F766E, #14B8A6)';
    thumbIcon = <Database className="w-6 h-6 text-white/90" />;
    accentColor = '#0F766E';
  } else if (titleLower.includes('design') || titleLower.includes('figma') || titleLower.includes('graphic')) {
    thumbBg = 'linear-gradient(135deg, #D946EF, #8B5CF6)';
    thumbIcon = <Palette className="w-6 h-6 text-white/90" />;
    accentColor = '#D946EF';
  } else if (titleLower.includes('market') || titleLower.includes('seo') || titleLower.includes('sale')) {
    thumbBg = 'linear-gradient(135deg, #F59E0B, #EF4444)';
    thumbIcon = <Megaphone className="w-6 h-6 text-white/90" />;
    accentColor = '#F59E0B';
  } else if (titleLower.includes('business') || titleLower.includes('manage') || titleLower.includes('lead')) {
    thumbBg = 'linear-gradient(135deg, #059669, #10B981)';
    thumbIcon = <Briefcase className="w-6 h-6 text-white/90" />;
    accentColor = '#059669';
  }

  return {
    id: bp.learningPathId,
    title: bp.title,
    description: bp.description || '',
    courses: sortedCourses.length,
    duration: `${totalDurationHours}h`,
    enrollments: 0,
    completionRate: 0,
    avgProgress: 0,
    thumbBg,
    thumbIcon,
    accentColor,
    rating: 0,
    thumbnailUrl: bp.bannerUrl || undefined,
    nodes
  };
};
