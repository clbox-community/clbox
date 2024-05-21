import { AssessmentSurveyHook } from '../model/assessment-survey-hook';
import { SurveyContext } from '@clbox/assessment-survey';
import { useCallback, useMemo } from 'react';
import { UserAssessment } from '../model/user-assessment';
import { useAssessmentQuestions } from './use-assessment-questions';
import { QuestionWithCategory } from './question-with-category';

function isQuestionToShow(assessment: UserAssessment, question: QuestionWithCategory): boolean {
    const questionForm = assessment.assessed === assessment.assessor ? 'text1st' : 'text3rd';
    const n = (id: string) => id.replaceAll('.', '_');
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => assessment.response?.[n(id)],
            value: (id: string) => assessment.responseValue?.[n(id)]
        }
    };

    const hasQuestionText = () => question.question[questionForm] !== undefined;
    const isValid = () => !question.question.validWhen || question.question.validWhen(context);

    return hasQuestionText() && isValid();
}


function findNextUnansweredQuestion(questions: QuestionWithCategory[], assessment: UserAssessment) {
    return questions.find(
        questionToCheck =>
            assessment.response[questionToCheck.question.id] === undefined && isQuestionToShow(assessment, questionToCheck)
    );
}

export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: Partial<UserAssessment>) => Promise<void>,
                                             finishAssessment: () => Promise<void>,
                                             demo = false
): AssessmentSurveyHook => {
    const questions = useAssessmentQuestions(demo);
    const question: QuestionWithCategory | undefined = useMemo(
        () => {
            if (assessment && questions) {
                return questions.find(q => q.question.id === assessment?.currentQuestion) ?? findNextUnansweredQuestion(questions, assessment);
            }
        },
        [questions, assessment]
    );
    const hasForwardQuestion = useMemo(
        () => {
            if (assessment && question) {
                const ffQuestion = findNextUnansweredQuestion(questions, assessment);
                return ffQuestion && questions.findIndex(q => q.question.id === ffQuestion.question.id) > questions.findIndex(q => q.question.id === question.question.id);
            }
        },
        [assessment, questions, question]
    );

    /// Chcemy resetować questionTime po każdej zmianie assessment lub question
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const questionTime = useMemo(() => new Date().getTime(), [assessment, question]);

    const back = useCallback(
        async () => {
            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
            const prevQuestion = questions
                .filter((_, idx) => idx < currentQuestionIdx)
                .reverse()
                .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck));
            await updateAssessment({
                currentQuestion: prevQuestion?.question.id ?? questions[0].question.id
            });
        },
        [questions, updateAssessment, assessment]
    );

    const forward = useCallback(
        async () => {
            const nextQuestion = findNextUnansweredQuestion(questions, assessment);
            if (nextQuestion) {
                await updateAssessment({
                    currentQuestion: nextQuestion.question.id
                });
            }
        },
        [updateAssessment, assessment, questions]
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

            const isAnswerDifferentThanBefore = updatedAssessment.responseValue[question.question.id] !== undefined && updatedAssessment.responseValue[question.question.id] !== answerValue;
            if (isAnswerDifferentThanBefore) {
                questions
                    .filter(q => updatedAssessment.askedQuestion[q.question.id])
                    .forEach(questionToCheck => {
                        const isValidNow = isQuestionToShow(updatedAssessment, questionToCheck);
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

            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === updatedAssessment.currentQuestion), 0);
            const nextQuestion = questions
                .filter((_, idx) => idx > currentQuestionIdx)
                .find((questionToCheck, questionToCheckIdx) => isQuestionToShow(updatedAssessment, questionToCheck));
            updatedAssessment.currentQuestion = nextQuestion?.question.id ?? 'finished';

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
            currentQuestion: ''
        }),
        [updateAssessment]
    );

    const timeLeft = useMemo(
        () => {
            if (assessment && question) {
                const availableQuestions = questions.filter(q => isQuestionToShow(assessment, question));
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
            isBackAvailable: questions.findIndex(q => q.question.id === question?.question.id) > 0,
            back,
            isForwardAvailable: hasForwardQuestion,
            forward
        },
        progress: assessment && {
            count: questions.length,
            currentIdx: questions.indexOf(question),
            percents: (questions.indexOf(question) / questions.length) * 100,
            timeLeft
        }
    };
};
