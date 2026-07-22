import type { CourseDraft } from '../../types/course/create-course.types';

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
}

export async function buildCourseFormData(options: {
    draft: CourseDraft;
    status: 'draft' | 'pending';
    thumbnailFile: File | null;
}): Promise<FormData> {
    const { draft } = options;
    const formData = new FormData();
    formData.append('title', draft.title || '');
    formData.append('description', draft.description || '');
    formData.append('language', draft.language || 'English');
    formData.append('status', options.status);

    const lessonMinutes = (draft.lessons || []).reduce((sum, l) => {
        return sum + (parseInt(l.duration) || 0);
    }, 0);
    const enteredMinutes =
        (Number(draft.durationHours) || 0) * 60 +
        (Number(draft.durationMinutes) || 0);
    const totalMinutes = enteredMinutes > 0 ? enteredMinutes : lessonMinutes;
    formData.append('duration', String(totalMinutes));

    if (draft.projectUrl) {
        formData.append('projectUrl', draft.projectUrl);
    }

    formData.append('tags', JSON.stringify(draft.tags || []));

    let fileToUpload = options.thumbnailFile;
    if (!fileToUpload && draft.thumbnailPreview?.startsWith('data:image')) {
        fileToUpload = await dataUrlToFile(draft.thumbnailPreview, 'thumbnail.png');
    }

    if (fileToUpload) {
        formData.append('thumbnailUrl', fileToUpload);
    }

    return formData;
}
