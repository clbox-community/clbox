import React from "react";
import {SurveyAnswerScale} from '../../model/survey-answer-scale';
import {SurveyAnswerType} from "../../model/survey-answer-type";
import {SurveyQuestionData} from "../../model/survey-question-data";
import {ScaleAnswer} from "./scale-answer";
import {TextAnswer} from './text-answer';

export const answerFactory = (answers: SurveyQuestionData, defaultValue: unknown | undefined, selected: (answer: unknown) => void) => {
    switch (answers.type) {
        case SurveyAnswerType.scale:
            return <ScaleAnswer answers={answers as SurveyQuestionData<SurveyAnswerScale>} selected={selected}
                                defaultValue={defaultValue as number}/>;
        case SurveyAnswerType.text:
            return <TextAnswer answers={answers} selected={selected} defaultValue={defaultValue as string}/>;
        default:
            throw new Error(`Unknown answer type: ${answers.type}`);
    }
}
