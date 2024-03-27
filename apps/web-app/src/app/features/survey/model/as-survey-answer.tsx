import {SurveyPageAnswer} from '../components/survey-question-page';
import {Survey} from '../model/survey';
import {SurveyQuestionAnswered, SurveyQuestionAnswerType} from '../model/survey-question-answered';
import {SurveyPage} from './survey-page';
import {SurveyPageAnswerType} from "../components/survey-page-answer-type";
import {SurveyQuestionData} from "./survey-question-data";

export function asSurveyAnswer(surveyId: string, answer: SurveyPageAnswer, survey: Survey, question: SurveyPage<SurveyQuestionData>): SurveyQuestionAnswered {
    return {
        surveyId: surveyId,
        dateUtc: new Date().toISOString(),
        timestampUtc: new Date().getTime(),
        value: answer.value || '',
        comment: answer.comment || '',
        stats: {
            answerChanges: answer.stats.answerChanges,
            time: answer.stats.time,
        },
        question: {
            id: question.id,
            text: {
                main: question.text.main,
                additional: question.text.additional || '',
                category: question.text.category
            },
            type: question.data.type,
            params: question.data.params || {},
        },
        type: answer.type === SurveyPageAnswerType.Submit ? SurveyQuestionAnswerType.Submit : SurveyQuestionAnswerType.Skip,
    };
}
