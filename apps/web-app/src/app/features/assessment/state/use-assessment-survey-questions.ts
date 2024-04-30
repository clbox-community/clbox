import { AssessmentSurveyHook } from '../model/assessment-survey-hook';
import { SurveyContext } from '@clbox/assessment-survey';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserAssessment } from '../model/user-assessment';
import { QuestionWithCategory } from './question-with-category';
import { useAssessmentQuestions } from './use-assessment-questions';

function isQuestionToShow(assessment, question): boolean {
    const context: SurveyContext = {
        user: assessment.user,
        answers: {
            get: (id: string) => assessment.response?.[id.replaceAll('.', '_')]
        }
    };
    return !question.question.validWhen || question.question.validWhen(context);
}

function legacyNextQuestion(assessment: UserAssessment, assessed: string) {
    // to tylko do weryfikacji, wiem co robi ten hook dokładnie i obecnie jest ok. gdy się zmieni się hook to wyleci ten kod zupełnie
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const allQuestions = useAssessmentQuestions();
    for (let idx = 0; idx < allQuestions.length; ++idx) {
        const candidate = allQuestions[idx];
        const valid = isQuestionToShow(assessment, candidate);
        const answered = assessment.response?.[candidate.question.id] !== undefined;
        const hasQuestionTextForAssessed = (assessment.assessed === assessed ? candidate.question.text1st : candidate.question.text3rd) !== undefined;

        if (valid && !answered && hasQuestionTextForAssessed) {
            return candidate;
        }
    }
    return null;
}

function nextQuestion(assessment: UserAssessment, assessed: string, questions: QuestionWithCategory[]) {
    const currentQuestionIdx = assessment.currentQuestion ? questions.findIndex(q => q.question.id === assessment.currentQuestion) : 0;
    console.log(currentQuestionIdx);
    for (let idx = currentQuestionIdx; ++idx; idx < questions.length) {
        const candidate = questions[idx];
        const answered = assessment.response?.[candidate.question.id] !== undefined;
        const hasQuestionTextForAssessed = (assessment.assessed === assessed ? candidate.question.text1st : candidate.question.text3rd) !== undefined;
        // if (!answered && hasQuestionTextForAssessed) {
        //     return candidate;
        // }
        if (hasQuestionTextForAssessed) {
            return candidate;
        }
    }
    return undefined;
    // return questions.find(candidate => {
    //     const answered = assessment.response?.[candidate.question.id] !== undefined;
    //     const hasQuestionTextForAssessed = (assessment.assessed === assessed ? candidate.question.text1st : candidate.question.text3rd) !== undefined;
    //     return !answered && hasQuestionTextForAssessed;
    // });
}

export const useAssessmentSurveyQuestions = (assessment: UserAssessment,
                                             updateAssessment: (assessment: Partial<UserAssessment>) => Promise<void>,
                                             finishAssessment: () => Promise<void>,
                                             assessed: string
): AssessmentSurveyHook => {
    // const [question, setQuestion] = useState<QuestionWithCategory>(undefined);
    // const [questionTime, setQuestionTime] = useState<number>(new Date().getTime());
    const assessmentQuestions = useAssessmentQuestions();
    const questions = useMemo(() => assessment ? assessmentQuestions.filter(q => isQuestionToShow(assessment, q)) : [], [assessmentQuestions, assessment]);
    const question = useMemo(
        () => assessment?.currentQuestion ? questions.find(q => q.question.id === assessment.currentQuestion) : questions[0],
        [questions, assessment]
    );
    const questionTime = useMemo(() => new Date().getTime(), [assessment, question]);

    // useEffect(
    //     () => {
    //         if (assessment) {
    //             const questionCandidate = nextQuestion(assessment, assessed, questions);
    //             const legacyNextQuestionCandidate = legacyNextQuestion(assessment, assessed);
    //             if (questionCandidate !== legacyNextQuestionCandidate) {
    //                 console.log({ nextQuestionCandidate: questionCandidate, legacyNextQuestionCandidate });
    //                 throw new Error('Mismatch in found new question algorithm!');
    //             }
    //
    //             setQuestion(questionCandidate);
    //             setQuestionTime(new Date().getTime());
    //         }
    //     },
    //     [assessment, assessed, questions]
    // );

    const submit = useCallback(
        async (answerValue: unknown, comment: string, feedback: string) => {
            const time = (new Date().getTime() - questionTime) / 1000;
            const update: Partial<UserAssessment> = {
                [`askedQuestion.${question.question.id}`]: true,
                [`response.${question.question.id}`]: answerValue,
                [`questionTime.${question.question.id}`]: time
            };
            if (comment) {
                update[`comment.${question.question.id}`] = comment;
            }
            if (feedback) {
                update[`questionFeedback.${question.question.id}`] = feedback;
            }
            const questionCandidate = nextQuestion(assessment, assessed, questions)?.question.id;
            update.currentQuestion = questionCandidate;
            await updateAssessment(update);

            if (!questionCandidate) {
                await finishAssessment();
            }
        },
        [updateAssessment, finishAssessment, assessment, assessed, questions, question, questionTime]
    );

    const back = useCallback(
        async () => {
            // TODO : idź wstecz po jednym aż do poprawnego bo mogły być jakieś przeskoczone!
            // todo const prevQuestion = tryToFindPrev(...)
            // if (prevQuestion) updateAssessment({currentQuestion: prevQuestion.question.id})
            console.log(questions.indexOf(question));
            if (questions.indexOf(question) > 0) {
                console.log(questions[questions.indexOf(question) - 1].question.id);
                await updateAssessment({
                    currentQuestion: questions[questions.indexOf(question) - 1].question.id
                });
            }
        },
        [updateAssessment, questions, question]
    )

    const reset = useCallback(
        async () => updateAssessment({
            response: {},
            questionFeedback: {},
            questionTime: {},
            askedQuestion: {}
        }),
        [updateAssessment]
    );

    const timeLeft = useMemo(
        () => {
            if (assessment && question && questions.indexOf(question) > 5) {
                const times = Object.keys(assessment.questionTime);
                const sum = times
                    .map(key => assessment.questionTime[key])
                    .reduce((prev, current) => prev + current, 0);
                return (sum / times.length) * (questions.length - 1 - questions.indexOf(question));
            }
        },
        [assessment, question, questions]
    );

    return {
        category: question?.category,
        question: question === null ? null : question?.question,
        finished: assessment && question === null,
        // TODO: musimy przechować konkretne wartości 1,2,3,4 żeby potrafić pokazać użytkownikowi co wybrał odpowiadająć na pytanie do którego powraca
        submitAnswer: async (value: number, comment: string, feedback: string) => submit(value > 2, comment, feedback),
        reset: reset,
        navigation: {
            isBackAvailable: questions.indexOf(question) > 0,
            back,
            isForwardAvailable: false,
            forward: async () => {
                console.log('forward');
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
