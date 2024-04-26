import { Survey } from '../model/survey';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { SurveyQuestionData } from '../model/survey-question-data';
import { SurveyAnswerScale } from '../model/survey-answer-scale';
import { ScaleAnswer } from './answer/scale-answer';
import { SurveyAnswerType } from '../model/survey-answer-type';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const QuestionRow = styled.div`
    display: flex;
`;

const QuestionTextCell = styled.div`
    flex-basis: 50%;
`;

const QuestionAnswerCell = styled.div`
    flex: 1;
`;

const Layout = styled.div`
    width: 1200px;
    margin: 0 auto 64px auto;
`;

function defaultValues(survey: Survey): {[key: string]: number} {
    return survey.pages.reduce((result, page) => {
        return {
            ...result,
            [page.id]: (page.data as SurveyQuestionData<SurveyAnswerScale>).params.default ?? 0
        };
    }, {});
}

export const SurveyOnePage: FC<ViewProps> = ({ survey, submit }) => {
    const [form, setForm] = useState<{ [key: string]: number }>(defaultValues(survey));
    return <Layout>
        <div style={{ marginBottom: '32px' }}>
            <Typography variant={'h5'}>{survey.title}</Typography>
        </div>
        <div>
            {survey.pages.map(page => <QuestionRow key={page.id}>
                <QuestionTextCell>
                    <div style={{ fontWeight: 300, fontSize: '.9em' }}>{page.text.category}</div>
                    <div>{page.text.main}</div>
                    <div>{page.text.additional}</div>
                </QuestionTextCell>
                {page.type === 'question' && page.data.type === SurveyAnswerType.scale && <QuestionAnswerCell>
                    <ScaleAnswer answers={page.data as SurveyQuestionData<SurveyAnswerScale>}
                                 selected={val => setForm(form => ({
                                     ...form,
                                     [page.id]: val
                                 }))}
                                 defaultValue={(page.data as SurveyQuestionData<SurveyAnswerScale>).params.default} />
                </QuestionAnswerCell>}
            </QuestionRow>)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button variant={'contained'} onClick={() => submit(form)}>Wyślij</Button>
        </div>
    </Layout>;
};

interface ViewProps {
    survey: Survey;
    submit: (answers: { [key: string]: number }) => void;
}
