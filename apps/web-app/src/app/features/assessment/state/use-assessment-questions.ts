import { questionsWithCategories } from './questions-with-categories';

export const useAssessmentQuestions = (demo = false) => {
    if (demo) {
        return questionsWithCategories.slice(0, 10);
    }
    return questionsWithCategories;
}
