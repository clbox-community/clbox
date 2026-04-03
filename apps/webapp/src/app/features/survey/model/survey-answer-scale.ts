export interface SurveyAnswerScale {
    min: {
        value: number;
        text?: string;
        tooltip?: string;
    };
    max: {
        value: number;
        text?: string;
        tooltip?: string;
    };
    labels?: Record<number, {
        text: string,
        tooltip?: string
    }>;
    default?: number;
}
