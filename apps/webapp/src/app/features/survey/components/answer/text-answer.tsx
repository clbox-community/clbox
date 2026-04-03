import TextField from '@mui/material/TextField';
import React from "react";
import styled from 'styled-components';
import {SurveyQuestionData} from "../../model/survey-question-data";

const WideTextField = styled(TextField)`
    width: 100%;
`;

interface TextAnswerProps {
    answers: SurveyQuestionData;
    selected: (answer: string) => void;
    defaultValue: string | undefined
}

export const TextAnswer = ({selected, defaultValue}: TextAnswerProps) => {
    return <WideTextField
        multiline
        onChange={change => selected(change.target.value)}
        rows={6}
        defaultValue={defaultValue}
    />;
};
