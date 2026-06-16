import { useEffect, useMemo, useState } from 'react';

import { readCourseDraft } from '../../../utils/course/courseDraftStorage';

type UseLessonDraftFlowParams = {
    searchParams: URLSearchParams;
};

export function useLessonDraftFlow({
    searchParams,
}: UseLessonDraftFlowParams) {
    const [draftCourseTitle, setDraftCourseTitle] = useState<string | null>(null);

    const isCourseBuilder = useMemo(() => {
        return (
            searchParams.get('isCourseBuilder') === 'true' ||
            Boolean(searchParams.get('targetModuleId'))
        );
    }, [searchParams]);

    useEffect(() => {
        if (isCourseBuilder) {
            const draft = readCourseDraft();

            if (draft?.title) {
                setDraftCourseTitle(draft.title);
            }
        }
    }, [searchParams, isCourseBuilder]);

    return {
        isCourseBuilder,

        draftCourseTitle,
        setDraftCourseTitle,
    };
}

export type UseLessonDraftFlowReturn = ReturnType<typeof useLessonDraftFlow>;
