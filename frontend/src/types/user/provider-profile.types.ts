import type { AcademicProfileResponse, UserResponse } from "../../services/user/user.service";
import type { BackendCourse } from "../../services/course/course.service";
import type { LearnerProfile } from "../../services/learner/learner.services";

export interface ProviderProfileMini {
    profile: AcademicProfileResponse | LearnerProfile | null;
    user: UserResponse | null;
    fullName: string;
    editing: boolean;
    setEditing: (val: boolean) => void;
    setFullName: (val: string) => void;
    save: () => void;
    isSaving?: boolean;
    cancel: () => void;
    avatarFile: File | null;
    setAvatarFile: (val: File | null) => void;
    canEdit: boolean;
}

export interface ProviderAbout {
    editing: boolean;
    expertise: string;
    setExpertise: (val: string) => void;
    experienceYears: string;
    setExperienceYears: (val: string) => void;
    canEdit: boolean;
}

export interface ProviderStatsProps {
    coursesCount: number;
    approvedCount: number;
    totalEnrollments: number;
}

export interface ProviderCoursesProps {
    courses: BackendCourse[];
}
