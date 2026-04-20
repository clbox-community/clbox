import { boolAnswerBasedOnQuestion, hasBoolAnswerBasedOnQuestion, SurveyContext, UserRole } from '@clbox/assessment-survey';
import { useCallback, useMemo } from 'react';
import { useAssessmentQuestions } from './use-assessment-questions';
import { QuestionWithCategory } from './question-with-category';
import { AssessmentUserRole, UserAssessment, UserAssessmentVerification } from 'assessment-model';
import { AssessmentSurveyHook } from '../model/assessment-survey-hook';
import { UserProfile } from 'user-profile-model';

function asContextRole(role: AssessmentUserRole): UserRole {
    switch (role) {
        case AssessmentUserRole.Developer:
            return UserRole.Developer;
        case AssessmentUserRole.ProductOwner:
            return UserRole.ProductOwner;
        case AssessmentUserRole.QA:
            return UserRole.QA;
    }
    return undefined;
}

function isQuestionToShow(assessment: UserAssessment, question: QuestionWithCategory, accessorProfile: UserProfile): boolean {
    const questionForm = assessment.assessed === assessment.assessor ? 'text1st' : 'text3rd';
    const n = (id: string) => id.replaceAll('.', '_');
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => hasBoolAnswerBasedOnQuestion(question.question) ? boolAnswerBasedOnQuestion(question.question, assessment.responseValue?.[n(id)]) : undefined,
            value: (id: string) => assessment.responseValue?.[n(id)]
        },
        assessor: {
            roles: accessorProfile?.roles?.filter(r => r !== AssessmentUserRole.None).map(asContextRole) ?? []
        }
    };

    const hasQuestionText = () => question.question[questionForm] !== undefined;
    const valid = () => !question.question.validWhen || question.question.validWhen(context);
    const eligibleForAssessor = context.assessor.roles?.length > 0 ? () => !question.question.eligibleForAssessor || question.question.eligibleForAssessor(context) : () => true;
    if (!context.assessor.roles || context.assessor.roles?.length === 0) {
        console.warn(`Assessor without roles. All questions will be mark as eligible to display.`);
    }

    return hasQuestionText() && valid() && eligibleForAssessor();
}


function findNextUnansweredQuestion(questions: QuestionWithCategory[], assessment: UserAssessment, accessorProfile: UserProfile) {
    return questions.find(
        questionToCheck =>
            assessment.responseValue[questionToCheck.question.id] === undefined && isQuestionToShow(assessment, questionToCheck, accessorProfile)
    );
}

export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: Partial<UserAssessment>) => Promise<void>,
                                             finishAssessment: () => Promise<void>,
                                             accessorProfile: UserProfile,
                                             demo = false
): AssessmentSurveyHook => {
    const allQuestions = useAssessmentQuestions(demo);
    const questions = useMemo(
        () => {
            if (assessment) {
                const markedToAsk = (questionId: string) => (assessment.verifiedCategories[questionId]?.status ?? UserAssessmentVerification.Ask) === UserAssessmentVerification.Ask;
                return allQuestions.filter(q => markedToAsk(q.question.id));
            } else {
                return [];
            }
        },
        [assessment, allQuestions]
    );

    const question: QuestionWithCategory | undefined = useMemo(
        () => {
            if (assessment && questions && accessorProfile) {
                return questions.find(q => q.question.id === assessment?.currentQuestion) ?? findNextUnansweredQuestion(questions, assessment, accessorProfile);
            }
        },
        [questions, assessment, accessorProfile]
    );
    const hasForwardQuestion = useMemo(
        () => {
            if (assessment && question && accessorProfile) {
                const nextQuestion = () => {
                    const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
                    return questions
                        .filter((_, idx) => idx > currentQuestionIdx)
                        .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck, accessorProfile));
                };
                return assessment.responseValue[question.question.id] !== undefined && nextQuestion() != null;
            }
        },
        [assessment, questions, question, accessorProfile]
    );
    const hasFastForwardQuestion = useMemo(
        () => {
            if (assessment && question && accessorProfile) {
                const ffQuestion = findNextUnansweredQuestion(questions, assessment, accessorProfile);
                // return ffQuestion && questions.findIndex(q => q.question.id === ffQuestion.question.id) > questions.findIndex(q => q.question.id === question.question.id);
                return !!ffQuestion;
            }
        },
        [assessment, questions, question, accessorProfile]
    );

    /// Chcemy resetować questionTime po każdej zmianie assessment lub question
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const questionTime = useMemo(() => new Date().getTime(), [assessment, question]);

    const navWithoutAnswer = useCallback(async (questionId: string, update: { comment?: string, feedback?: string }) => {
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
    }, [assessment, updateAssessment]);

    const back = useCallback(
        async (change: { comment?: string, feedback?: string }) => {
            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
            const prevQuestion = questions
                .filter((_, idx) => idx < currentQuestionIdx)
                .reverse()
                .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck, accessorProfile));
            if (prevQuestion?.question.id) {
                await navWithoutAnswer(prevQuestion?.question.id, change);
            }
        },
        [questions, navWithoutAnswer, assessment, accessorProfile]
    );

    const forward = useCallback(
        async (update: { comment?: string, feedback?: string }) => {
            const currentQuestionIdx = Math.max(questions.findIndex(q => q.question.id === assessment.currentQuestion), 0);
            const nextQuestion = questions
                .filter((_, idx) => idx > currentQuestionIdx)
                .find((questionToCheck) => isQuestionToShow(assessment, questionToCheck, accessorProfile));
            if (nextQuestion?.question.id) {
                await navWithoutAnswer(nextQuestion?.question.id, update);
            }
        },
        [questions, navWithoutAnswer, assessment, accessorProfile]
    );

    const fastForward = useCallback(
        async () => {
            const nextQuestion = findNextUnansweredQuestion(questions, assessment, accessorProfile);
            if (nextQuestion) {
                await updateAssessment({
                    currentQuestion: nextQuestion.question.id
                });
            }
        },
        [updateAssessment, assessment, questions, accessorProfile]
    );

    const submitAnswer = useCallback(
        async (answerValue: number, comment: string, feedback: string) => {
            const time = (new Date().getTime() - questionTime) / 1000;

            const updatedAssessment: UserAssessment = JSON.parse(JSON.stringify(assessment));
            updatedAssessment.askedQuestion[question.question.id] = true;
            updatedAssessment.responseValue[question.question.id] = answerValue;
            updatedAssessment.questionTime[question.question.id] = time;
            updatedAssessment.currentQuestion = question.question.id;
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
                        const isValidNow = isQuestionToShow(updatedAssessment, questionToCheck, accessorProfile);
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
                .find((questionToCheck) => isQuestionToShow(updatedAssessment, questionToCheck, accessorProfile));
            updatedAssessment.currentQuestion = nextQuestion?.question.id ?? 'finished';

            await updateAssessment(updatedAssessment);
            if (!nextQuestion) {
                await finishAssessment();
            }
        },
        [questionTime, assessment, question?.question.id, questions, updateAssessment, finishAssessment, accessorProfile]
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
