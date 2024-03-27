import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import React from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import styled from 'styled-components';
import {SurveyPage} from '../model/survey-page';
import {SurveyTextData} from '../model/survey-text-data';

const StyledCard = styled(Card)`
`;

const ActionsBar = styled.div`
    display: flex;
    margin-top: 16px;
    align-items: center;
`;

const FlexFill = styled.div`
    flex: 1;
`;

interface SurveyTextPageProps {
    page?: SurveyPage<SurveyTextData>;
    withBack?: boolean;
    onAnswer?: () => void;
    onBack?: () => void;
    lastPage?: boolean;
}

export const SurveyTextPage = ({page, onAnswer, onBack, withBack, lastPage}: SurveyTextPageProps) => {
    return <StyledCard>
        <CardContent>
            <ReactMarkdown children={page.data.text} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}/>
            <ActionsBar>
                {withBack && <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => onBack()}
                >
                    Wróć
                </Button>}
                <FlexFill/>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onAnswer()}
                >
                    {lastPage ? 'Zapisz' : 'Dalej'}
                </Button>
            </ActionsBar>
        </CardContent>
    </StyledCard>;
}
