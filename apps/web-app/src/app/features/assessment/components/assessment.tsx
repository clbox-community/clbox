import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../state/app-state';
import CardContent from '@mui/material/CardContent';
import DownloadingIcon from '@mui/icons-material/Downloading';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import Card from '@mui/material/Card';
import { OneColumnLayoutWide } from '../../layout/one-column-layout-wide';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CardActions from '@mui/material/CardActions';
import React, { useEffect, useRef, useState } from 'react';
import Collapse from '@mui/material/Collapse';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { userInText } from './user-In-text';
import { useAssessmentSurveyQuestions } from '../state/use-assessment-survey-questions';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useUserAssessment } from '../state/use-user-assessment';

const LoadingAssessment = () => <Card>
    <CardContent style={{ textAlign: 'center' }}>
        <div><DownloadingIcon style={{ fontSize: '60px' }} color="info" /></div>
        <div>Pobieranie danych ankiety...</div>
    </CardContent>
</Card>;

const LoadingQuestion = () => <Card>
    <CardContent style={{ textAlign: 'center' }}>
        <div><DownloadingIcon style={{ fontSize: '60px' }} color="info" /></div>
        <div>Generowanie pytań...</div>
    </CardContent>
</Card>;


const NotFound = ({ id }: { id: string }) => <Card>
    <CardContent style={{ textAlign: 'center' }}>
        <div><NotInterestedIcon style={{ fontSize: '60px' }} color="warning" /></div>
        <div>Nie znaleziono ankiety o identyfikatorze {id}.</div>
    </CardContent>
</Card>;

const Finished = () => <Card>
    <CardContent style={{ textAlign: 'center' }}>
        <div><SentimentSatisfiedAltIcon style={{ fontSize: '60px' }} color="success" /></div>
        <div>Ankieta została zapisana, dziękujemy z udzielenie odpowiedzi.</div>
    </CardContent>
</Card>;

const WideTextField = styled(TextField)`
    width: 100%;
`;

/**
 * Pytania często nie kończą się ".". Warto te pytania poprawić, a do tego czasu wyświetlać je z kropką po stronie ui.
 * @param text
 */
function normalizeText(text: string): string {
    if (text.endsWith('.') || text.endsWith('?')) {
        return text;
    } else {
        return text + '.';
    }
}

const QuestionSurvey = ({ assessment, category, question, submitYes, submitNo, reset, progress, userId }: {
    assessment,
    category,
    question,
    submitYes,
    submitNo,
    reset,
    progress,
    userId
}) => {
    const [feedbackExpanded, setFeedbackExpanded] = useState<boolean>(false);
    const feedbackFieldRef = useRef<HTMLTextAreaElement>();
    const commentFieldRef = useRef<HTMLTextAreaElement>();

    useEffect(
        () => {
            if (feedbackFieldRef.current) {
                feedbackFieldRef.current.value = '';
            }
            setFeedbackExpanded(false);
        },
        [question]
    );
    useEffect(
        () => {
            if (commentFieldRef.current) {
                commentFieldRef.current.value = '';
            }
        },
        [question]
    );

    return <Card>
        <CardHeader
            title={`Ocena okresowa dla ${assessment.user.name}`}
            subheader={<div>
                <div><LinearProgress variant="determinate" value={progress.percents} /></div>
                <div style={{fontStyle: 'italic', fontSize: '.9em', marginTop: '4px'}}>Pytanie {progress.currentIdx + 1} z {progress.count}. {progress.timeLeft && <>Pozostało ~{Math.floor(progress.timeLeft / 60)} min.</>} Ankietę może przerwać w dowolnym momencie i wrócić do niej później.</div>
            </div>}
        >
        </CardHeader>
        <CardHeader
            title={category.name}
            titleTypographyProps={{
                fontSize: '1.2em'
            }}
            subheader={`${category.description ?? ''} (pytanie ${question.id.replace('_', '.')})`}
            subheaderTypographyProps={{
                fontSize: '0.9em'
            }}
        />
        <CardContent>
            <div style={{ minHeight: '150px' }}>
                <div>{normalizeText(userInText(assessment.assessed === userId && question.text1st ? question.text1st[assessment.user.textForm ?? 'm'] : question.text3rd[assessment.user.textForm ?? 'm'], assessment.user.name))}</div>
                {question.comment && <div style={{ fontStyle: 'italic', color: 'gray' }}>{question.comment}</div>}
            </div>
        </CardContent>
        <CardContent>
            <span style={{fontStyle: 'italic', color: 'gray'}}>Możesz dodać komentarz, który zostanie zapisany po wybraniu jednej z odpowiedzi.</span>
            <WideTextField inputRef={commentFieldRef} multiline rows={4} />
        </CardContent>
        <CardActions>
            <Button variant="outlined" size="small" onClick={() => submitNo(commentFieldRef.current?.value, feedbackFieldRef.current?.value)} style={{ width: '200px' }}>
                <div>
                    <div>nigdy</div>
                    <div>w ogóle się nie zgadzam</div>
                </div>
            </Button>
            <Button variant="outlined" size="small" onClick={() => submitNo(commentFieldRef.current?.value, feedbackFieldRef.current?.value)} style={{ width: '200px' }}>
                <div>
                    <div>rzadko</div>
                    <div>raczej nie</div>
                </div>
            </Button>
            <Button variant="outlined" size="small" onClick={() => submitYes(commentFieldRef.current?.value, feedbackFieldRef.current?.value)} style={{ width: '200px' }}>
                <div>
                    <div>często</div>
                    <div>raczej tak</div>
                </div>
            </Button>
            <Button variant="outlined" size="small" onClick={() => submitYes(commentFieldRef.current?.value, feedbackFieldRef.current?.value)} style={{ width: '200px' }}>
                <div>
                    <div>zawsze</div>
                    <div>stanowczo się zgadzam</div>
                </div>
            </Button>
            <Button size="small" color="secondary" style={{ marginLeft: 'auto' }} onClick={() => setFeedbackExpanded(!feedbackExpanded)}><HelpOutlineIcon /></Button>
        </CardActions>
        <Collapse in={feedbackExpanded} timeout="auto" unmountOnExit>
            <CardContent>
                <div style={{ fontStyle: 'italic' }}>
                    Pytanie jest dla Ciebie niejasne? Nie wiesz, jaką odpowiedź wybrać?
                </div>
                <div style={{ fontStyle: 'italic' }}>
                    Zgłoś feedback w oknie poniżej, opisz jak je zrozumiałeś i co założyłeś wybierając jedną z odpowiedzi. Twój komentarz będzie się zawsze pojawiał przy odpowiedzi i zostanie
                    wykorzystany do przygotowania podsumowania oraz jako wkład do dalszego rozwoju ankiety oceny.
                </div>
                <div>
                    <WideTextField inputRef={feedbackFieldRef} multiline rows={4} />
                </div>
            </CardContent>
            {/*<CardActions style={{ justifyContent: 'flex-end' }}>*/}
            {/*    <span style={{ fontSize: '0.8em', fontStyle: 'italic', color: 'darkred', marginRight: '8px' }}>Resetowanie jest dostępne tylko w czasie beta testów</span>*/}
            {/*    <Button variant="outlined" size="small" onClick={reset}>reset</Button>*/}
            {/*</CardActions>*/}
        </Collapse>
    </Card>;
};

const AssessmentView = ({ teamId, userId }: ViewProps) => {
    const { assessmentId, userAssessmentId, userAssessmentRefId } = useParams<{ assessmentId: string, userAssessmentId: string, userAssessmentRefId: string }>();
    const navigate = useNavigate();

    const [assessment, updateAssessment, finishAssessment] = useUserAssessment(teamId, userId, assessmentId, userAssessmentId, userAssessmentRefId);
    const {
        category,
        question,
        submitYes,
        submitNo,
        reset,
        progress
    } = useAssessmentSurveyQuestions(assessment, updateAssessment, userId);

    useEffect(
        () => {
            if (assessment && question === null) {
                if (assessment) {
                    finishAssessment();
                }
                navigate({
                    pathname: '..',
                    search: 'finished'
                });
            }
        },
        [assessment, question, navigate, finishAssessment]
    );

    if (assessment === undefined) {
        return <OneColumnLayoutWide>
            <LoadingAssessment></LoadingAssessment>
        </OneColumnLayoutWide>;
    } else if (assessment === null) {
        return <OneColumnLayoutWide>
            <NotFound id={`${assessmentId}/${userAssessmentId}`}></NotFound>
        </OneColumnLayoutWide>;
    } else if (assessment.finished || (assessment && question === null)) {
        return <OneColumnLayoutWide>
            <Finished></Finished>
        </OneColumnLayoutWide>;
    } else if (!category || !question) {
        return <OneColumnLayoutWide>
            <LoadingQuestion></LoadingQuestion>
        </OneColumnLayoutWide>;
    } else {
        return <OneColumnLayoutWide>
            <QuestionSurvey assessment={assessment}
                            category={category}
                            question={question}
                            submitYes={submitYes}
                            submitNo={submitNo}
                            reset={reset}
                            progress={progress}
                            userId={userId}
            />
        </OneColumnLayoutWide>;
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id,
        userId: state.authentication?.email
    }),
    {}
);

export const Assessment = connector(AssessmentView);
