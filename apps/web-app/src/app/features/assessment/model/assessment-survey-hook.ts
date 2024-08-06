import { Category, Question } from '@clbox/assessment-survey';

export interface AssessmentSurveyHookProgress {
    count: number;
    currentIdx: number;
    percents: number;
}

export type AssessmentSurveyHookNavigationNavigation = (change: { comment?: string, feedback?: string }) => Promise<void>;

export interface AssessmentSurveyHookNavigation {
    back: AssessmentSurveyHookNavigationNavigation;
    isBackAvailable: boolean;
    forward: AssessmentSurveyHookNavigationNavigation;
    isForwardAvailable: boolean;
    fastForward: () => Promise<void>;
    isFastForwardAvailable: boolean;
}

export type AssessmentSurveyHookSubmitAnswer = (value: number, comment: string, feedback: string) => Promise<void>;

export interface AssessmentSurveyHook {
    category: Category;
    question: Question;
    finished: boolean;
    submitAnswer: AssessmentSurveyHookSubmitAnswer;
    reset: () => Promise<void>;
    navigation: AssessmentSurveyHookNavigation;
    progress: AssessmentSurveyHookProgress;
}
