import {SurveyAnswerType} from "./survey-answer-type";

export interface SurveyQuestionData<ParamsType = unknown> {
    type: SurveyAnswerType;
    params: ParamsType;
}
