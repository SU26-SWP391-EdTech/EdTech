import api from "../../lib/axios";

export interface LearnerProfile {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    learningGoal?: string;
    level?: string;
    bio?: string;
    createdAt: string;
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
export async function editLearnerProfile(id: number, formData: FormData): Promise<any> {
    const response = await api.patch(`/learners/edit-profile/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}
