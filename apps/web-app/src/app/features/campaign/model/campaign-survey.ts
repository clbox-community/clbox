import {SurveyPage} from '../../survey/model/survey-page';

export interface CampaignSurvey {
    pages: SurveyPage[];
    title: string;
    withBackNavigation: boolean;
    flow: string;
}
