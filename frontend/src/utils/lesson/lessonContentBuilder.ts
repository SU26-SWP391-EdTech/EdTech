import type { Objective, QuizQuestion, Resource } from '../../types/lesson/create-lesson.types';

export function buildLessonContent(options: {
    hasReading: boolean;
    content: string;
    objectives: Objective[];
    resources: Resource[];
    quizQuestions: QuizQuestion[];
}): string {
    const lines: string[] = [];

    if (options.hasReading && options.content.trim()) {
        lines.push(options.content.trim());
    }

    if (options.objectives.length) {
        lines.push(`Objectives:\n${options.objectives.map((objective, index) => `${index + 1}. ${objective.text}`).join('\n')}`);
    }

    if (options.resources.length) {
        lines.push(`Resources:\n${options.resources.map((resource) => `- ${resource.name} (${resource.type})`).join('\n')}`);
    }

    if (options.quizQuestions.length) {
        lines.push(`Quiz Questions:\n${options.quizQuestions.map((question, index) => `${index + 1}. ${question.text}`).join('\n')}`);
    }

    return lines.join('\n\n');
}
