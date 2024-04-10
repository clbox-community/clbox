import { Category, Question } from '@clbox/assessment-survey';

export interface AssessmentSurveyHook {
    category: Category;
    question: Question;
    finished: boolean;
    submitYes: (comment: string, feedback: string) => Promise<void>;
    submitNo: (comment: string, feedback: string) => Promise<void>;
    reset: () => Promise<void>;
    progress: {
        count: number;
        currentIdx: number;
        percents: number;
        timeLeft?: number;
    };
}
