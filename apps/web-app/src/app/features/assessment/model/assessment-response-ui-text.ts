import { ResponseAssessmentResult } from './assessment-response-result';
import { Question, QuestionType, Seniority } from '@clbox/assessment-survey';
import { assessmentResponseAssessResult } from './assessment-response-assess-result';

function asHumanText(result: ResponseAssessmentResult): string {
    const textMap: Record<ResponseAssessmentResult, string> = {
        [ResponseAssessmentResult.ExpectedResponse]: 'Idealna odpowiedź',
        [ResponseAssessmentResult.NotExpectedRequired]: 'Niepoprawna odpowiedź wymagana na stanowisku',
        [ResponseAssessmentResult.NotAsked]: 'Brak odpowiedzi',
        [ResponseAssessmentResult.NotExpectedNotRequired]: 'Niepoprawna odpowiedź jednak dopuszczalna na stanowisku'
    };

    return textMap[result];
}

function answerValueBasedOnQuestionType(question: Question, value: unknown): string {
    if (value === undefined) {
        return '-';
    } else if (question.type === QuestionType.Scale) {
        return '' + value;
    } else if (question.type === QuestionType.Correctness) {
        switch (value as number) {
            case 4: return 'tak';
            case 3: return 'raczej tak';
            case 2: return 'raczej nie';
            case 1: return 'nie';
            default: return `??? (${value})`;
        }
    } else if (question.type === QuestionType.Frequency) {
        switch (value as number) {
            case 4: return 'zawsze';
            case 3: return 'często';
            case 2: return 'rzadko';
            case 1: return 'nigdy';
            default: return `??? (${value})`;
        }
    } else {
        return '' + value;
    }
}

export function summaryAnswerBasedOnQuestion(question: Question, value: number) {
    return answerValueBasedOnQuestionType(question, value);
}

export function labelBasedOnQuestion(userSeniority: Seniority, question: Question, value: number) {
    const answer = answerValueBasedOnQuestionType(question, value);
    const reason = asHumanText(assessmentResponseAssessResult(userSeniority, question, value));

    return `Odpowiedź: ${answer} (${value})
Ocena: ${reason}
Spodziewane odpowiedzi: ${question.expectedResponses[Seniority.seniorPlus].map(a => answerValueBasedOnQuestionType(question, a)).join(', ')}
Dopuszczalne odpowiedzi: ${question.expectedResponses[userSeniority].map(a => answerValueBasedOnQuestionType(question, a)).join(', ')}`;
}
