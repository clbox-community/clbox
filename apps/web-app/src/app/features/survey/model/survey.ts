import {SurveyPage} from './survey-page';

export interface Survey {
    title: string;
    forUser: string;
    created: string;
    createdTimestamp: number;
    responsePrivacy: 'signed' | 'anonymous';
    campaign: string;
    flow: 'wizard' | 'onepage';
    withBackNavigation: boolean;
    pages: SurveyPage[];
    finishPage?: any;
}
