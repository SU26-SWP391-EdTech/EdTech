import { useState } from 'react';
import {
    Search, Bell, GraduationCap, ChevronRight, Plus, Edit2, Trash2,
    BookOpen, Users, CheckCircle2, XCircle, AlertCircle, Circle, Globe, Eye, X
} from 'lucide-react';
import Header from '../../components/course/my-courses/Header';

// Course Provider view — can only see and manage THEIR OWN courses
// Course entity: { courseId, title, description, thumbnailUrl, projectUrl,
//   language, duration, totalLessons (default 0), enrollmentCount (default 0),
//   status (DRAFT|PENDING|APPROVED|REJECTED), createdAt, user (= current provider) }
// Provider can: create, edit, delete courses in DRAFT
// Provider CANNOT: approve/reject (that's Academic Manager)

type CourseStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface Course {
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


export function MyCoursesPage() {
    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 48px' }}>

                {/* Header */}
                <Header/>

                {/* Status guide */}
                

                {/* Filters */}


                {/* Course list */}
                
            </div>

            {/* Delete modal */}
            
        </div>
    );
}
