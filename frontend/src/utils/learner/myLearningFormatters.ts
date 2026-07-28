export function normalizeProgress(progress?: number | null): number {
    if (!progress) return 0;
    return progress <= 1 ? Math.round(progress * 100) : Math.round(progress);
}

export function formatLearningDate(value?: string | null): string {
    if (!value) return 'Never';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
