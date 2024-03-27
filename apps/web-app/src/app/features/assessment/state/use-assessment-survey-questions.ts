import {AssessmentSurveyHook} from "../model/assessment-survey-hook";
import {SurveyContext} from "@clbox/assessment-survey";
import {useCallback, useEffect, useState} from "react";
import {UserAssessment} from "../model/user-assessment";
import {QuestionWithCategory} from "./question-with-category";
import {questionsWithCategories} from "./questions-with-categories";

function nextQuestion(assessment: UserAssessment, assessee: string) {
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => assessment.response?.[id.replace('.', '_')]
        }
    };
    for (let idx = 0; idx < questionsWithCategories.length; ++idx) {
        const candidate = questionsWithCategories[idx];

        const valid = !candidate.question.validWhen || candidate.question.validWhen(context);
        const answered = assessment.response?.[candidate.question.id] !== undefined;
        const hasQuestionTextForAssessee = (assessment.assessed === assessee ? candidate.question.text1st : candidate.question.text3rd) !== undefined;

        if (valid && !answered && hasQuestionTextForAssessee) {
            return candidate;
        }
    }
    return null;
}

export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: {
                                                 [key: string]: unknown
                                             }) => void,
                                             finishAssessment: (finishDate: number) => void,
                                             assessee: string
): AssessmentSurveyHook => {
    const [question, setQuestion] = useState<QuestionWithCategory>(undefined);
    const [questionTime, setQuestionTime] = useState<number>(new Date().getTime());

    useEffect(
        () => {
            if (assessment) {
                setQuestion(nextQuestion(assessment, assessee));
                setQuestionTime(new Date().getTime());
            }
        },
        [assessment, assessee]
    );

    useEffect(
        () => {
            if (question === null) {
                finishAssessment(new Date().getTime());
            }
        },
        [question, finishAssessment]
    );

    const submit = useCallback(
        async (answerValue: unknown, feedback: string) => {
            const time = (new Date().getTime() - questionTime) / 1000;
            const update = {
                [`askedQuestion.${question.question.id}`]: true,
                [`response.${question.question.id}`]: answerValue,
                [`questionTime.${question.question.id}`]: time,
            };
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
            askedQuestion: {},
        }),
        [updateAssessment]
    )

    return {
        category: question?.category,
        question: question?.question,
        finished: assessment && question === null,
        submitYes: async (feedback: string) => submit(true, feedback),
        submitNo: async (feedback: string) => submit(false, feedback),
        reset: reset,
        progress: (questionsWithCategories.indexOf(question) / questionsWithCategories.length) * 100
    };
}
