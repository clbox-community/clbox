import {Question, Category} from "@clbox/assessment-survey";

export interface AssessmentSurveyHook {
    category: Category;
    question: Question;
    finished: boolean;
    submitYes: (feedback: string) => Promise<void>;
    submitNo: (feedback: string) => Promise<void>;
    reset: () => Promise<void>;
    progress: number;
}
