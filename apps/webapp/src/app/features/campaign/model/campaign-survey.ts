import {SurveyPage} from '../../survey/model/survey-page';
import { SurveyQuestionData } from '../../survey/model/survey-question-data';

export interface CampaignSurvey {
    pages: SurveyPage<SurveyQuestionData<any>>[];
    title: string;
    withBackNavigation: boolean;
    flow: string;
}
