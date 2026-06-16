import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
    ModalType,
    Resource,
} from '../../../types/lesson/create-lesson.types';

type UseLessonResourceModalParams = {
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModal: Dispatch<SetStateAction<ModalType>>;
};

export function useLessonResourceModal({
    setResources,
    setModal,
}: UseLessonResourceModalParams) {
    const [rName, setRName] = useState('');
    const [rType, setRType] = useState('PDF');
    const [rVisibility, setRVisibility] = useState<'public' | 'enrolled'>(
        'enrolled'
    );

    function handleAddResource() {
        if (!rName.trim()) return;

        setResources(prev => [
            ...prev,
            {
                id: `r${Date.now()}`,
                name: rName.trim(),
                type: rType,
                size: '—',
                visibility: rVisibility,
            },
        ]);

        setRName('');
        setRType('PDF');
        setRVisibility('enrolled');
        setModal(null);
    }

    return {
        rName,
        setRName,

        rType,
        setRType,

        rVisibility,
        setRVisibility,

        handleAddResource,
    };
}