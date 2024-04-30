import { Category, Question } from '@clbox/assessment-survey';

export interface AssessmentSurveyHook {
    category: Category;
    question: Question;
    finished: boolean;
    submitAnswer: (value: number, comment: string, feedback: string) => Promise<void>;
    reset: () => Promise<void>;
    navigation: {
        back: () => Promise<void>;
        isBackAvailable: boolean;
        forward: () => Promise<void>;
        isForwardAvailable: boolean;
    };
    progress: {
        count: number;
        currentIdx: number;
        percents: number;
        timeLeft?: number;
    };
}
