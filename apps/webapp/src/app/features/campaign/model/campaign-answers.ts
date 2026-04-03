import {SurveyQuestionAnswered} from "../../survey/model/survey-question-answered";

export interface CampaignAnswers {
    id: string;
    user: string;
    answers: Record<string, SurveyQuestionAnswered>;
}
