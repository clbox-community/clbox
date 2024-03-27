import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {SurveyPage} from "../model/survey-page";
import {SurveyQuestionData} from '../model/survey-question-data';
import {answerFactory} from "./answer/answer-factory";
import {SurveyPageAnswerType} from "./survey-page-answer-type";

const StyledCard = styled(Card)`
`;

const Header = styled.div`
    margin-bottom: 24px;
`;

const Answers = styled.div`
`;

const CommentSection = styled.div`
    margin-top: 16px;
`;

const CommentMessage = styled.div`
    font-style: italic;
    font-size: 0.9em;
`;

const SkipSection = styled.div`
`;

const ActionsBar = styled.div`
    display: flex;
    margin-top: 16px;
    align-items: center;
`;

const HeaderCategory = styled.div`
    font-style: italic;
    font-size: 0.9em;
    margin-bottom: 4px;
`;

const HeaderQuestion = styled.div`
`;

const SubheaderQuestion = styled.div`
    font-size: 0.8em;
    font-style: italic;
`;

const FlexFill = styled.div`
    flex: 1;
`;

const WideTextField = styled(TextField)`
    width: 100%;
`;

export interface SurveyPageAnswer<D = unknown> {
    stats: {
        time: number;
        answerChanges: number;
    };
    type: SurveyPageAnswerType;
    value?: D;
    comment?: string;
}

export interface SurveyPageProps {
    question: SurveyPage<SurveyQuestionData>;
    withBack: boolean;
    onAnswer: (answer: SurveyPageAnswer) => void;
    onBack: () => void;
    defaultValue?: SurveyPageAnswer;
    lastPage?: boolean;
}

export const SurveyQuestionPage = ({
                                       question,
                                       onAnswer,
                                       withBack,
                                       onBack,
                                       defaultValue,
                                       lastPage
                                   }: SurveyPageProps) => {
    const [value, setValue] = useState<unknown>(defaultValue?.value);
    const [commentMessage, setCommentMessage] = useState<string | undefined>(undefined);
    const [commentVisible, setCommentVisible] = useState<boolean>(defaultValue?.type !== SurveyPageAnswerType.Skip && !!defaultValue?.comment);
    const [skipVisible, setSkipVisible] = useState<boolean>(defaultValue?.type === SurveyPageAnswerType.Skip);
    const commentFieldRef = useRef<HTMLTextAreaElement>();
    const skipFieldRef = useRef<HTMLTextAreaElement>();
    const [answerComponent, setAnswerComponent] = useState(undefined);

    useEffect(() => {
        setAnswerComponent(answerFactory(question.data, defaultValue?.value, (changedValue: number) => {
            setAnswerChanges(prev => prev + 1);
            setValue(changedValue);
            const valueToTrigger = question.clarificationRequired?.valueToTrigger ?? 0;
            if (question.clarificationRequired && changedValue <= valueToTrigger) {
                setCommentVisible(true);
                if (question.clarificationRequired.message) {
                    setCommentMessage(question.clarificationRequired.message)
                }
            } else if (question.clarificationRequired && changedValue > valueToTrigger && question.clarificationRequired.message) {
                setCommentMessage(undefined);
            }
        }));
    }, [question]);

    const onSkip = useCallback(() => {
        setSkipVisible(prev => !prev);
    }, []);

    // telemetry
    const [startTime] = useState(new Date().getTime());
    const [answerChanges, setAnswerChanges] = useState(0);

    return <StyledCard>
        <CardContent>
            <Header>
                <HeaderCategory>{question.text.category}</HeaderCategory>
                <HeaderQuestion>{question.text.main}</HeaderQuestion>
                <SubheaderQuestion>{question.text.additional}</SubheaderQuestion>
            </Header>
            <Answers>
                {answerComponent}
            </Answers>
            <ActionsBar>
                {withBack && <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => onBack()}
                >
                    Wróć
                </Button>}
                {question.withSkip && <>
                    <Button onClick={onSkip}>Pomiń pytanie</Button>
                    {!skipVisible && <Tooltip
                        title='Wybierz żeby pominąć pytanie, które jest dla Ciebie niezrozumiałe, nieprecyzyjne lub po prostu brakuje Ci wiedzy i kontekstu żeby na nie odpowiedzieć'
                        arrow>
                        <HelpOutlineIcon color="disabled" sx={{cursor: 'pointer'}}/>
                    </Tooltip>}
                </>}
                <FlexFill/>
                {!skipVisible && <>
                    {question.withComment && <Button
                        onClick={() => setCommentVisible(!commentVisible)} sx={{marginRight: '16px'}}
                    >
                        {commentVisible ? 'Ukryj komentarz' : 'Dodaj komentarz'}
                    </Button>}
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={question.required && !value}
                        onClick={() => onAnswer({
                            stats: {
                                time: new Date().getTime() - startTime + (defaultValue?.stats.time ?? 0),
                                answerChanges: answerChanges + (defaultValue?.stats.answerChanges ?? 0)
                            },
                            type: SurveyPageAnswerType.Submit,
                            value: value,
                            comment: commentVisible ? commentFieldRef.current.value : undefined
                        })}
                    >
                        {lastPage === true ? 'Zapisz' : 'Dalej'}
                    </Button>
                </>}
            </ActionsBar>
            {commentVisible && !skipVisible && <CommentSection>
                {commentMessage && <CommentMessage>{commentMessage}</CommentMessage>}
                <WideTextField
                    inputRef={commentFieldRef}
                    label="Komentarz"
                    multiline
                    rows={4}
                    defaultValue={defaultValue?.type === SurveyPageAnswerType.Submit ? defaultValue?.comment : undefined}
                />
            </CommentSection>}
            {skipVisible && <SkipSection>
                <Typography variant='body2' sx={{marginBottom: '4px', fontStyle: 'italic'}}>
                    <span>Jeżeli pytanie jest dla Ciebie niezrozumiałe, nieprecyzyjne lub po prostu brakuje Ci wiedzy i
                        kontekstu żeby na nie odpowiedzieć możesz je pominąć.</span>
                </Typography>
                <Typography variant='body2' sx={{marginBottom: '4px', fontStyle: 'italic'}}>
                    <span>W polu poniżej daj nam znać co jest przyczyną pominięcia pytania i jak moglibyśmy się poprawić na
                        przyszłość.</span>
                </Typography>
                <Typography variant='body2' sx={{marginBottom: '8px', fontStyle: 'italic'}}>
                    <span>Dzięki za pomoc! :)</span>
                </Typography>
                <WideTextField
                    inputRef={skipFieldRef}
                    label="Uwagi do pytania"
                    multiline
                    rows={4}
                    defaultValue={defaultValue?.type === SurveyPageAnswerType.Skip ? defaultValue?.comment : undefined}
                />
                <ActionsBar>
                    <FlexFill/>
                    <Button variant="contained"
                            color="primary"
                            onClick={() => onAnswer({
                                stats: {
                                    time: new Date().getTime() - startTime + (defaultValue?.stats.time ?? 0),
                                    answerChanges: answerChanges + (defaultValue?.stats.answerChanges ?? 0)
                                },
                                type: SurveyPageAnswerType.Skip,
                                value: value,
                                comment: skipVisible ? skipFieldRef.current.value : undefined
                            })}
                    >
                        Zgłoś uwagi i pomiń pytanie
                    </Button>
                </ActionsBar>
            </SkipSection>}
        </CardContent>
    </StyledCard>;
};
