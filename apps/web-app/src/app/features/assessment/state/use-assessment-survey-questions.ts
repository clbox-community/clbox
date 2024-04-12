import { AssessmentSurveyHook } from '../model/assessment-survey-hook';
import { SurveyContext } from '@clbox/assessment-survey';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserAssessment } from '../model/user-assessment';
import { QuestionWithCategory } from './question-with-category';
import { questionsWithCategories } from './questions-with-categories';

function isQuestionToShow(assessment, question): boolean {
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => assessment.response?.[id.replaceAll('.', '_')]
        }
    };
    return !question.question.validWhen || question.question.validWhen(context);
}

function nextQuestion(assessment: UserAssessment, assessed: string) {

    for (let idx = 0; idx < questionsWithCategories.length; ++idx) {
        const candidate = questionsWithCategories[idx];
        const valid = isQuestionToShow(assessment, candidate);
        const answered = assessment.response?.[candidate.question.id] !== undefined;
        const hasQuestionTextForAssessed = (assessment.assessed === assessed ? candidate.question.text1st : candidate.question.text3rd) !== undefined;

        if (valid && !answered && hasQuestionTextForAssessed) {
            return candidate;
        }
    }
    return null;
}

export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: {
                                                 [key: string]: unknown
                                             }) => void,
                                             assessed: string
): AssessmentSurveyHook => {
    const [question, setQuestion] = useState<QuestionWithCategory>(undefined);
    const [questionTime, setQuestionTime] = useState<number>(new Date().getTime());

    useEffect(
        () => {
            if (assessment) {
                setQuestion(nextQuestion(assessment, assessed));
                setQuestionTime(new Date().getTime());
            }
        },
        [assessment, assessed]
    );

    const timeLeft = useMemo(
        () => {
            if (assessment && question && questionsWithCategories.indexOf(question) > 5) {
                const times = Object.keys(assessment.questionTime);
                const sum = times
                    .map(key => assessment.questionTime[key])
                    .reduce((prev, current) => prev + current, 0);
                return (sum / times.length) * (questionsWithCategories.length - 1 - questionsWithCategories.indexOf(question));
            }
        },
        [assessment, question]
    );

    const submit = useCallback(
        async (answerValue: unknown, comment: string, feedback: string) => {
            const time = (new Date().getTime() - questionTime) / 1000;
            const update = {
                [`askedQuestion.${question.question.id}`]: true,
                [`response.${question.question.id}`]: answerValue,
                [`questionTime.${question.question.id}`]: time
            };
            if (comment) {
                update[`comment.${question.question.id}`] = comment;
                console.log(comment);
            }
            if (feedback) {
                update[`questionFeedback.${question.question.id}`] = feedback;
            }
            updateAssessment(update);
        },
        [updateAssessment, question, questionTime]
    );

    const reset = useCallback(
        async () => updateAssessment({
            response: {},
            questionFeedback: {},
            questionTime: {},
            askedQuestion: {}
        }),
        [updateAssessment]
    );

    return {
        category: question?.category,
        question: question === null ? null : question?.question,
        finished: assessment && question === null,
        submitYes: async (comment: string, feedback: string) => submit(true, comment, feedback),
        submitNo: async (comment: string, feedback: string) => submit(false, comment, feedback),
        reset: reset,
        progress: assessment && {
            count: questionsWithCategories.filter(q => isQuestionToShow(assessment, q)).length,
            currentIdx: questionsWithCategories.indexOf(question),
            percents: (questionsWithCategories.indexOf(question) / questionsWithCategories.length) * 100,
            timeLeft
        }
    };
};
