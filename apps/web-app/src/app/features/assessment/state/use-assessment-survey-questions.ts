import { boolAnswerBasedOnQuestion, hasBoolAnswerBasedOnQuestion, SurveyContext } from '@clbox/assessment-survey';
import { useCallback, useMemo } from 'react';
import { useAssessmentQuestions } from './use-assessment-questions';
import { QuestionWithCategory } from './question-with-category';
import { UserAssessment } from 'assessment-model';
import { AssessmentSurveyHook } from '../model/assessment-survey-hook';

function isQuestionToShow(assessment: UserAssessment, question: QuestionWithCategory): boolean {
    const questionForm = assessment.assessed === assessment.assessor ? 'text1st' : 'text3rd';
    const n = (id: string) => id.replaceAll('.', '_');
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => hasBoolAnswerBasedOnQuestion(question.question) ? boolAnswerBasedOnQuestion(question.question, assessment.responseValue?.[n(id)]) : undefined,
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
            assessment.responseValue[questionToCheck.question.id] === undefined && isQuestionToShow(assessment, questionToCheck)
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
                const nextQuestion = () => {
                    const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
                    return questions
                        .filter((_, idx) => idx > currentQuestionIdx)
                        .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck));
                }
                return assessment.responseValue[question.question.id] !== undefined && nextQuestion() != null;
            }
        },
        [assessment, questions, question]
    )
    const hasFastForwardQuestion = useMemo(
        () => {
            if (assessment && question) {
                const ffQuestion = findNextUnansweredQuestion(questions, assessment);
                // return ffQuestion && questions.findIndex(q => q.question.id === ffQuestion.question.id) > questions.findIndex(q => q.question.id === question.question.id);
                return !!ffQuestion;
            }
        },
        [assessment, questions, question]
    );

    /// Chcemy resetować questionTime po każdej zmianie assessment lub question
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const questionTime = useMemo(() => new Date().getTime(), [assessment, question]);

    const navWithoutAnswer = useCallback(async (questionId: string, update: {comment?: string, feedback?: string}) => {
        const updatedAssessment: Partial<UserAssessment> = {
            currentQuestion: questionId
        };
        if (update.comment !== undefined) {
            updatedAssessment.comment = {
                ...assessment.comment,
                [assessment.currentQuestion]: update.comment
            };
        }
        if (update.feedback !== undefined) {
            updatedAssessment.questionFeedback = {
                ...assessment.questionFeedback,
                [assessment.currentQuestion]: update.feedback
            };
        }
        await updateAssessment(updatedAssessment);
    }, [assessment, updateAssessment])

    const back = useCallback(
        async (change: {comment?: string, feedback?: string}) => {
            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
            const prevQuestion = questions
                .filter((_, idx) => idx < currentQuestionIdx)
                .reverse()
                .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck));
            if (prevQuestion?.question.id) {
                await navWithoutAnswer(prevQuestion?.question.id, change);
            }
        },
        [questions, navWithoutAnswer, assessment]
    );

    const forward = useCallback(
        async (update: {comment?: string, feedback?: string}) => {
            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
            const nextQuestion = questions
                .filter((_, idx) => idx > currentQuestionIdx)
                .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck));
            if (nextQuestion?.question.id) {
                await navWithoutAnswer(nextQuestion?.question.id, update);
            }
        },
        [questions, navWithoutAnswer, assessment]
    );

    const fastForward = useCallback(
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
                .find((questionToCheck) => isQuestionToShow(updatedAssessment, questionToCheck));
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
            responseValue: {},
            comment: {},
            questionFeedback: {},
            questionTime: {},
            askedQuestion: {},
            currentQuestion: ''
        }),
        [updateAssessment]
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
            forward,
            isFastForwardAvailable: hasFastForwardQuestion,
            fastForward: fastForward
        },
        progress: assessment && {
            count: questions.length,
            currentIdx: questions.indexOf(question),
            percents: (questions.indexOf(question) / questions.length) * 100
        }
    };
};
