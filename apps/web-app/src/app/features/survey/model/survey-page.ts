export enum SurveyPageType {
    question = 'question',
    text = 'text'
}

export interface SurveyPage<T = unknown> {
    id: string;
    withSkip: boolean;
    withComment: boolean;
    required: boolean;
    text: {
        main: string;
        additional: string;
        category: string;
    };
    type: SurveyPageType,
    data: T;
    clarificationRequired? :{
        valueToTrigger: number;
        message?: string;
        required?: boolean // default: false
    }
}
