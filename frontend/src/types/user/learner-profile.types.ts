import type { Enrollment } from "../../services/enrollment/enrollment.service";
import type { LearnerProfile } from "../../services/learner/learner.services";
import type { UserResponse } from "../../services/user/user.service";
import type { LearningPath } from "../../services/learning-path/learning-path.service";

//ProfileMini
export interface LearnerProfileMini {
    profile: LearnerProfile | null;
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

//Enrollments
export interface LearnerEnrollments {
    enrollments: Enrollment[];
}

//LearningPaths
export interface LearnerLearningPaths {
    learningPaths: LearningPath[];
    enrollments: Enrollment[];
}

//About
export interface LearnerAbout {
    profile: LearnerProfile | null;
    editing: boolean;
    bio: string;
    setBio: (val: string) => void;
    goal: string;
    setGoal: (val: string) => void; 
    canEdit: boolean;
}

//Stats
export interface LearnerStats {
    enrolledCount: number;
    completedCount: number;
    avgProgress: number;
}

//Toast
export interface LearnerToast {
    toast: boolean;
    setToast: (val: boolean) => void;
}