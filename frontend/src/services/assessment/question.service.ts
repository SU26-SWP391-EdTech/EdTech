import api from '../../lib/axios';

import type { QuestionType } from '../../types/lesson/create-lesson.types';

export interface CreateQuestionPayload {
    content: string;
    type: QuestionType;
    points?: number;
    position: number;
}

export interface UpdateQuestionPayload {
    content?: string;
    type?: QuestionType;
    points?: number;
    position?: number;
}

export interface CreateQuestionOptionPayload {
    content: string;
    isCorrect: boolean;
    position: number;
}

export interface UpdateQuestionOptionPayload {
    content?: string;
    isCorrect?: boolean;
    position?: number;
}

export interface ReorderQuestionOptionsPayload {
    optionIds: number[];
}

export class QuestionService {
    // 1. Create a question
    public static async createQuestion(
        courseId: number,
        lessonId: number,
        assessmentId: number,
        payload: CreateQuestionPayload
    ): Promise<any> {
        const response = await api.post(
            `/question/courses/${courseId}/lesson/${lessonId}/assessment/${assessmentId}`,
            payload
        );
        return response.data;
    }

    // 2. Update a question
    public static async updateQuestion(
        courseId: number,
        lessonId: number,
        assessmentId: number,
        questionId: number,
        payload: UpdateQuestionPayload
    ): Promise<any> {
        const response = await api.patch(
            `/question/courses/${courseId}/lesson/${lessonId}/assessment/${assessmentId}/question/${questionId}`,
            payload
        );
        return response.data;
    }

    // 3. Delete a question
    public static async deleteQuestion(
        courseId: number,
        lessonId: number,
        assessmentId: number,
        questionId: number
    ): Promise<any> {
        const response = await api.delete(
            `/question/courses/${courseId}/lesson/${lessonId}/assessment/${assessmentId}/question/${questionId}`
        );
        return response.data;
    }

    // 4. Get question by ID
    public static async getQuestionById(id: number): Promise<any> {
        const response = await api.get(`/question/${id}`);
        return response.data;
    }

    // 5. Get all questions for a lesson
    public static async getAllQuestionsOfLesson(
        courseId: number,
        lessonId: number
    ): Promise<any[]> {
        const response = await api.get(`/question/courses/${courseId}/lesson/${lessonId}/questions`);
        return response.data;
    }

    // 6. Create an option for a question
    public static async createQuestionOption(
        questionId: number,
        payload: CreateQuestionOptionPayload
    ): Promise<any> {
        const response = await api.post(`/question/${questionId}/option`, payload);
        return response.data;
    }

    // 7. Reorder options for a question
    public static async reorderQuestionOptions(
        questionId: number,
        payload: ReorderQuestionOptionsPayload
    ): Promise<any> {
        const response = await api.patch(`/question/${questionId}/options/reorder`, payload);
        return response.data;
    }

    // 8. Update a question option
    public static async updateQuestionOption(
        optionId: number,
        payload: UpdateQuestionOptionPayload
    ): Promise<any> {
        const response = await api.patch(`/question/option/${optionId}`, payload);
        return response.data;
    }

    // 9. Delete a question option
    public static async deleteQuestionOption(optionId: number): Promise<void> {
        await api.delete(`/question/option/${optionId}`);
    }

    // 10. Get question option by ID
    public static async getQuestionOptionById(optionId: number): Promise<any> {
        const response = await api.get(`/question/option/${optionId}`);
        return response.data;
    }
}
