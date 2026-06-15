import React from 'react';

export type CourseStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Course {
    courseId: number;
    title: string;
    description: string;
    language: string;
    duration: number | null;
    totalLessons: number;
    enrollmentCount: number;
    status: CourseStatus;
    createdAt: string;
    updatedAt: string;
}

export interface StatusConfigItem {
    bg: string;
    color: string;
    border: string;
    icon: React.ReactNode;
    label: string;
    desc: string;
}
