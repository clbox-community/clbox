export interface Category {
    id: string;
    name: string;
    description?: string;
    comment?: string;
    todo?: string;
    questions: Question[];
}

interface QuestionText {
    f: string,
    m: string
}

export interface Question {
    id: string;
    seniority: Seniority;
    expectedResponses: DesiredResponseBySeniority;
    type: QuestionType;
    text3rd?: QuestionText;
    text1st?: QuestionText;
    todo?: string;
    comment?: string;
    motivation?: string;
    validWhen?: (survey: SurveyContext) => boolean;
    eligibleForAssessor?: (survey: SurveyContext) => boolean;
    questionData?: unknown;
}

export enum Seniority {
    junior = 'junior',
    regular = 'regular',
    senior = 'senior',
    seniorPlus = 'seniorPlus'
}

export enum UserRole {
    Developer = 'dev',
    ProductOwner = 'po',
    QA = 'qa'
}

export enum QuestionType {
    Frequency, // jak często coś się dzieje: nigdy, rzadko, często, zawsze
    Correctness, // jak bardzo prawdziwe jest stwierdzenie: zdecydowanie nie, raczej nie, raczej tak, zdecydowanie tak
    Scale = 2
}


export function hasBoolAnswerBasedOnQuestion(question: Question) {
    return question.type === QuestionType.Correctness || question.type === QuestionType.Frequency;
}

export function boolAnswerBasedOnQuestion(question: Question, value: number) {
    if (hasBoolAnswerBasedOnQuestion(question)) {
        return value > 2;
    }
    throw new Error(`Question type does not support boolean result [question=${question.id}, type=${question.type}]`);
}

export function guessResponseValues(data: any) {
    if (data.responseValue) {
        return data.responseValue;
    } else if ((data as any).response) {
        return Object.keys((data as any).response)
            .reduce((obj, key) => ({
                ...obj,
                [key]: data[key] ? 3 : 1
            }), {});
    } else {
        return {};
    }
}

export function answerCheck(id: string, valid: (value?: boolean) => boolean): (survey: SurveyContext) => boolean {
    return survey => valid(survey.answers.get(id));
}

export function and(checks: ((survey: SurveyContext) => boolean)[]): (survey: SurveyContext) => boolean {
    return survey => checks.every(check => check(survey));
}

export function answerEq(id: string, expected: boolean): (survey: SurveyContext) => boolean {
    return answerCheck(id, val => val === expected);
}

export type DesiredResponseBySeniority = {
    [key in keyof typeof Seniority]: unknown[]
}

export interface SurveyContextUser {
    projects: string[];
}

export interface SurveyContextAssessor {
    roles: UserRole[];
}

export interface SurveyContextAnswers {
    get(id: string): boolean | undefined;

    value(id: string): number;
}

export interface SurveyContext {
    answers: SurveyContextAnswers;
    user: SurveyContextUser;
    assessor: SurveyContextAssessor;
}

export function bySeniority<T>(junior: T[], regular: T[], senior: T[], seniorPlus?: T[]): DesiredResponseBySeniority {
    return {
        junior,
        regular,
        senior,
        seniorPlus: seniorPlus ?? senior
    };
}
