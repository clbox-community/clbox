import { AssessmentSurveyHook } from '../model/assessment-survey-hook';
import { SurveyContext, SurveyUser } from '@clbox/assessment-survey';
import { useCallback, useMemo } from 'react';
import { UserAssessment } from '../model/user-assessment';
import { useAssessmentQuestions } from './use-assessment-questions';
import { QuestionWithCategory } from './question-with-category';

function isQuestionToShow(user: SurveyUser, responses: { [key: string]: boolean }, question: QuestionWithCategory): boolean {
    const context: SurveyContext = {
        user: user,
        answers: {
            get: (id: string) => responses[id.replaceAll('.', '_')]
        }
    };
    return !question.question.validWhen || question.question.validWhen(context);
}


export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: Partial<UserAssessment>) => Promise<void>,
                                             finishAssessment: () => Promise<void>,
                                             assessed: string
): AssessmentSurveyHook => {
    const questions = useAssessmentQuestions();
    const question = useMemo(
        () => questions.find(q => q.question.id === assessment?.currentQuestion) ?? questions[0],
        [questions, assessment?.currentQuestion]
    );

    /// Chcemy resetować questionTime po każdej zmianie assessment lub question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const questionTime = useMemo(() => new Date().getTime(), [assessment, question]);

    // todo #bringback filter out questions without valid form (3rd, 1st) for current user

    const back = useCallback(
        async () => {
            const currentQuestionIdx = questions.findIndex(q => q.question.id === assessment.currentQuestion) ?? 0;
            const prevQuestion = questions
                .filter((_, idx) => idx < currentQuestionIdx)
                .reverse()
                .find((questionToCheck) => isQuestionToShow(assessment.user, assessment?.response ?? {}, questionToCheck));
            await updateAssessment({
                currentQuestion: prevQuestion?.question.id ?? questions[0].question.id
            });
        },
        [questions, updateAssessment, assessment?.currentQuestion, assessment?.user, assessment?.response]
    );

    const submitAnswer = useCallback(
        async (answerValue: number, comment: string, feedback: string) => {
            const time = (new Date().getTime() - questionTime) / 1000;

            const updatedAssessment: UserAssessment = JSON.parse(JSON.stringify(assessment));
            updatedAssessment.askedQuestion[question.question.id] = true;
            updatedAssessment.response[question.question.id] = answerValue > 2;
            updatedAssessment.responseValue[question.question.id] = answerValue;
            updatedAssessment.questionTime[question.question.id] = time;
            if (comment) {
                updatedAssessment.comment[question.question.id] = comment;
            }
            if (feedback) {
                updatedAssessment.questionFeedback[question.question.id] = feedback;
            }

            const isAnswerDifferentThanBefore = assessment.responseValue[question.question.id] !== undefined && assessment.responseValue[question.question.id] !== answerValue;
            if (isAnswerDifferentThanBefore) {
                questions
                    .filter(q => assessment.askedQuestion[q.question.id])
                    .forEach(questionToCheck => {
                        const isValidNow = isQuestionToShow(assessment.user, updatedAssessment.response, questionToCheck);
                        if (!isValidNow) {
                            delete updatedAssessment.askedQuestion[questionToCheck.question.id];
                            delete updatedAssessment.response[questionToCheck.question.id];
                            delete updatedAssessment.responseValue[questionToCheck.question.id];
                            delete updatedAssessment.questionTime[questionToCheck.question.id];
                            delete updatedAssessment.comment[questionToCheck.question.id];
                            delete updatedAssessment.questionFeedback[questionToCheck.question.id];
                        }
                    });
            }

            const currentQuestionIdx = questions.findIndex(q => q.question.id === assessment.currentQuestion) ?? 0;
            const nextQuestion = questions
                .filter((_, idx) => idx > currentQuestionIdx)
                .find((questionToCheck, questionToCheckIdx) => isQuestionToShow(assessment.user, updatedAssessment.response, questionToCheck));
            updatedAssessment.currentQuestion = nextQuestion.question.id ?? '';

            await updateAssessment(updatedAssessment);
            if (!nextQuestion) {
                await finishAssessment();
            }
        },
        [questionTime, assessment, question?.question.id, questions, updateAssessment, finishAssessment]
    );

    const reset = useCallback(
        async () => updateAssessment({
            response: {},
            responseValue: {},
            comment: {},
            questionFeedback: {},
            questionTime: {},
            askedQuestion: {},
            currentQuestion: questions[0].question.id
        }),
        [questions, updateAssessment]
    );

    const timeLeft = useMemo(
        () => {
            if (assessment && question) {
                const availableQuestions = questions.filter(q => isQuestionToShow(assessment.user, assessment.response, question));
                if (availableQuestions.indexOf(question) > 5) {
                    const times = Object.keys(assessment.questionTime);
                    const sum = times
                        .map(key => assessment.questionTime[key])
                        .reduce((prev, current) => prev + current, 0);
                    return (sum / times.length) * (availableQuestions.length - 1 - availableQuestions.indexOf(question));
                }
            }
        },
        [assessment, question, questions]
    );

    return {
        category: question?.category,
        question: question?.question,
        finished: assessment && question === null,
        submitAnswer: async (value: number, comment: string, feedback: string) => submitAnswer(value, comment, feedback),
        reset: reset,
        navigation: assessment && {
            isBackAvailable: questions.indexOf(question) > 0,
            back,
            isForwardAvailable: question ? assessment.response[question.question.id] !== undefined : false,
            forward: async () => {
            }
        },
        progress: assessment && {
            count: questions.length,
            currentIdx: questions.indexOf(question),
            percents: (questions.indexOf(question) / questions.length) * 100,
            timeLeft
        }
    };
};
