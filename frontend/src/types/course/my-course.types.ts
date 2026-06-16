import React from 'react';
import type { CourseStatusFilter } from '../../hooks/course/useMyCourse';

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
    thumbnailUrl: string; 
}

export interface StatusConfigItem {
    bg: string;
    color: string;
    border: string;
    icon: React.ReactNode;
    label: string;
    desc: string;
}

export interface HeaderProps {
    onCreateCourse: () => void;
}

export interface FiltersProps {
    search: string;
    setSearch: (val: string) => void;
    statusFilter: CourseStatusFilter;
    setStatusFilter: (val: CourseStatusFilter) => void;
    counts: {
        ALL: number;
        DRAFT: number;
        PENDING: number;
        APPROVED: number;
        REJECTED: number;
    };
}

export interface StatusGuideProps {
    counts: {
        DRAFT: number;
        PENDING: number;
        APPROVED: number;
        REJECTED: number;
    };
}

export interface DeleteModalProps {
    deleteId: number | null;
    setDeleteId: (id: number | null) => void;
    onConfirmDelete: (id: number) => void;
}

export interface CourseListProps {
    filtered: Course[];
    canDelete: (status: string) => boolean;
    setDeleteId: (id: number | null) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onSubmit: (id: number) => void;
    onCreateCourse: () => void;
}