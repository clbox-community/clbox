import { SurveyPage } from './survey-page';
import { SurveyQuestionData } from './survey-question-data';

export interface Survey {
    title: string;
    forUser: string;
    created: string;
    createdTimestamp: number;
    responsePrivacy: 'signed' | 'anonymous';
    campaign: string;
    flow: 'wizard' | 'onepage';
    withBackNavigation: boolean;
    pages: SurveyPage<SurveyQuestionData>[];
    finishPage?: any;
}
