export const ASSESSMENT_TIME_LIMIT_MINUTES = 45;

/**
 * Format a number of seconds into mm:ss format.
 * E.g., 2700 seconds -> "45:00"
 */
export function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculates percentage accuracy.
 */
export function calculateAccuracy(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

export function formatAssessmentDuration(duration: string, durationSeconds?: number): string {
    if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)) {
        const totalSeconds = Math.max(0, Math.floor(durationSeconds));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes === 0) return `${seconds} sec`;
        if (seconds === 0) return `${minutes} min`;
        return `${minutes} min ${seconds} sec`;
    }
    return duration
        .replace(/\s*ph(?:\u00fa|\u00c3\u00ba)t\s*/gi, ' min ')
        .replace(/\s*gi(?:\u00e2|\u00c3\u00a2)y\s*/gi, ' sec ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^0 min (?=\d+ sec$)/, '');
}

export function formatAssessmentDate(value: string): string {
    const legacyDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/);
    const normalizedValue = legacyDate
        ? legacyDate[3] + '-' + legacyDate[2].padStart(2, '0') + '-' + legacyDate[1].padStart(2, '0') + legacyDate[4]
        : value;
    const date = new Date(normalizedValue);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-US');
}
