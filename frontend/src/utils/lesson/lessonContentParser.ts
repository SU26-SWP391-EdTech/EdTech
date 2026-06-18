import type { Objective, QuizQuestion, Resource } from '../../types/lesson/create-lesson.types';

function getSection(content: string, label: string): string | null {
    const match = content.match(new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n\\n|\\n[A-Za-z\\s]+:|$)`));
    return match?.[1] || null;
}

export function parseObjectivesFromContent(content: string): Objective[] {
    const section = getSection(content, 'Objectives');
    if (!section) return [];

    return section.split('\n').filter(Boolean).map((line, index) => ({
        id: `o${index}_${Date.now()}`,
        text: line.replace(/^\d+\.\s*/, ''),
    }));
}

export function parseResourcesFromContent(content: string): Resource[] {
    const section = getSection(content, 'Resources');
    if (!section) return [];

    return section.split('\n').filter(Boolean).map((line, index) => {
        const cleaned = line.replace(/^-\s*/, '');
        const typeMatch = cleaned.match(/\(([^)]+)\)$/);

        return {
            id: `r${index}_${Date.now()}`,
            name: typeMatch ? cleaned.replace(/\s*\([^)]+\)$/, '') : cleaned,
            type: typeMatch ? typeMatch[1] : 'PDF',
            size: '-',
            visibility: 'enrolled',
        };
    });
}

export function parseQuizQuestionsFromContent(content: string): QuizQuestion[] {
    const section = getSection(content, 'Quiz Questions');
    if (!section) return [];

    return section.split('\n').filter(Boolean).map((line, index) => ({
        id: `q${index}_${Date.now()}`,
        text: line.replace(/^\d+\.\s*/, ''),
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
        correct: 0,
    }));
}
