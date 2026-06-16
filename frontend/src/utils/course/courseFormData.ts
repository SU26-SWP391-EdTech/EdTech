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
    const { draft, status } = options;
    const formData = new FormData();
    formData.append('title', draft.title || '');
    formData.append('description', draft.description || '');
    formData.append('status', status);
    formData.append('language', draft.language || 'English');

    const durationHours = Number(draft.durationHours || 0);
    const durationMinutes = Number(draft.durationMinutes || 0);
    formData.append('duration', String((durationHours * 60) + durationMinutes));

    if (draft.projectUrl) {
        formData.append('projectUrl', draft.projectUrl);
    }

    let fileToUpload = options.thumbnailFile;
    if (!fileToUpload && draft.thumbnailPreview?.startsWith('data:image')) {
        fileToUpload = await dataUrlToFile(draft.thumbnailPreview, 'thumbnail.png');
    }

    if (fileToUpload) {
        formData.append('thumbnailUrl', fileToUpload);
    }

    return formData;
}
