import api from "../../lib/axios";

export interface LearnerProfile {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    learningGoal?: string;
    level?: string;
    bio?: string;
    createdAt: string;
    currentStreak?: number;
    longestStreak?: number;
    streakLife?: number;
    activeDates?: string[];
}

//get
export async function getLearnerProfile(id: number): Promise<LearnerProfile> {
    const response = await api.get(`/learners/${id}`);
    return response.data;
}

//patch
export async function updateLearnerProfile(id: number, data: { learningGoal?: string; level?: string; bio?: string }) {
    const response = await api.patch(`/learners/update-profile/${id}`, data);
    return response.data;
}

//patch upload media file
export async function editLearnerProfile(id: number, data: FormData | { fullName: string; bio?: string; learningGoal?: string }): Promise<any> {
    const isFormData = data instanceof FormData;
    const response = await api.patch(`/learners/edit-profile/${id}`, data, {
        headers: isFormData ? {
            'Content-Type': 'multipart/form-data',
        } : undefined,
    });
    return response.data;
}
