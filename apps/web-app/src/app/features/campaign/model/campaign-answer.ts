export interface CampaignAnswer {
    comment: string;
    dateUtc: string;
    timestampUtc: number;
    question: any;
    stats: {
        answerChanges: number;
        time: number;
    }
    surveyId: string;
    type: 'Submit'
}
