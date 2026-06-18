import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
    ModalType,
    QuizQuestion,
} from '../../../types/lesson/create-lesson.types';

type UseLessonQuizModalParams = {
    setQuizQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
    setModal: Dispatch<SetStateAction<ModalType>>;
    showFeedback: (message: string) => void;
};

export function useLessonQuizModal({
    setQuizQuestions,
    setModal,
    showFeedback,
}: UseLessonQuizModalParams) {
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState('Multiple Choice');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);
    const [shortAnswer, setShortAnswer] = useState('');

    function handleAddQuestion() {
        if (!qText.trim()) return;

        let options: string[] = [];
        let correctIdx = qCorrect;

        if (qType === 'Multiple Choice') {
            options = qOptions.filter(option => option.trim());

            if (options.length < 2) {
                showFeedback('Please add at least 2 answer options.');
                return;
            }
        } else if (qType === 'True / False') {
            options = ['True', 'False'];
        } else {
            options = [shortAnswer.trim()];
            correctIdx = 0;
        }

        setQuizQuestions(prev => [
            ...prev,
            {
                id: `q${Date.now()}`,
                text: qText.trim(),
                type: qType,
                options,
                correct: correctIdx,
            },
        ]);

        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
        setShortAnswer('');
        setModal(null);
    }

    return {
        qText,
        setQText,

        qType,
        setQType,

        qOptions,
        setQOptions,

        qCorrect,
        setQCorrect,

        shortAnswer,
        setShortAnswer,

        handleAddQuestion,
    };
}