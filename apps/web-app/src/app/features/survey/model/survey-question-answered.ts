import {SurveyAnswerType} from './survey-answer-type';

export enum SurveyQuestionAnswerType {
    Submit = 'Submit', Skip = 'Skip'
}


export interface SurveyQuestionAnswered<ValueType = unknown, ParamsType = unknown> {
    surveyId: string;
    timestampUtc: number;
    dateUtc: string;
    question: {
        id: string;
        text: {
            category: string;
            main: string;
            additional: string;
        };
        type: SurveyAnswerType;
        params: ParamsType;
    };
    stats: {
        time: number;
        answerChanges: number;
    };
    type: SurveyQuestionAnswerType;
    comment?: string;
    value?: ValueType;
}
