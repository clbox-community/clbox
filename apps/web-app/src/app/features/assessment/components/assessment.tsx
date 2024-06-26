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
import React, { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import Collapse from '@mui/material/Collapse';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { useAssessmentSurveyQuestions } from '../state/use-assessment-survey-questions';
import { useParams } from 'react-router';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserAssessment } from '../state/use-user-assessment';
import { AssessmentSplash } from './assessment-splash';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { WithId } from '../model/with-id';
import { UserAssessment } from '../model/user-assessment';
import { Question, QuestionType } from '@clbox/assessment-survey';

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

const ScaleAnswers: FC<{question: Question, submitAnswer, prevResponse: number, commentRef: MutableRefObject<HTMLTextAreaElement>, feedbackRef: MutableRefObject<HTMLTextAreaElement>}> = ({question, submitAnswer, prevResponse, commentRef, feedbackRef}) => {
    const type = question.type ?? QuestionType.Frequency;
    return <>
        <Button variant="outlined" size="small" onClick={() => submitAnswer(1, commentRef.current?.value, feedbackRef.current?.value)}
                style={{ width: '200px', height: '50px', borderWidth: prevResponse === 1 ? 3 : undefined }}>
            <div>
                {type === QuestionType.Frequency && <div>nigdy</div>}
                {type === QuestionType.Correctness && <div>w ogóle się nie zgadzam</div>}
            </div>
        </Button>
        <Button variant="outlined" size="small" onClick={() => submitAnswer(2, commentRef.current?.value, feedbackRef.current?.value)}
                style={{ width: '200px', height: '50px', borderWidth: prevResponse === 2 ? 3 : undefined }}>
            <div>
                {type === QuestionType.Frequency && <div>rzadko</div>}
                {type === QuestionType.Correctness && <div>raczej nie</div>}
            </div>
        </Button>
        <Button variant="outlined" size="small" onClick={() => submitAnswer(3, commentRef.current?.value, feedbackRef.current?.value)}
                style={{ width: '200px', height: '50px', borderWidth: prevResponse === 3 ? 3 : undefined }}>
            <div>
                {type === QuestionType.Frequency && <div>często</div>}
                {type === QuestionType.Correctness && <div>raczej tak</div>}
            </div>
        </Button>
        <Button variant="outlined" size="small" onClick={() => submitAnswer(4, commentRef.current?.value, feedbackRef.current?.value)}
                style={{ width: '200px', height: '50px', borderWidth: prevResponse === 4 ? 3 : undefined }}>
            <div>
                {type === QuestionType.Frequency && <div>zawsze</div>}
                {type === QuestionType.Correctness && <div>stanowczo się zgadzam</div>}
            </div>
        </Button>
    </>;
}

const QuestionSurvey = ({ assessment, category, question, submitAnswer, reset, progress, userId, debug }: {
    assessment: WithId & UserAssessment,
    category,
    question,
    submitAnswer,
    reset,
    progress,
    userId,
    debug: boolean
}) => {
    const [feedbackExpanded, setFeedbackExpanded] = useState<boolean>(false);
    const feedbackFieldRef = useRef<HTMLTextAreaElement>();
    const commentFieldRef = useRef<HTMLTextAreaElement>();

    useEffect(
        () => {
            if (commentFieldRef.current) {
                commentFieldRef.current.value = assessment.comment?.[question.id] ?? '';
            }
            setFeedbackExpanded(false);
        },
        [question, assessment]
    );
    const prevResponse = (() => {
        if (assessment.responseValue[question.id]) {
            return assessment.responseValue[question.id];
        }
        if (assessment.response[question.id] === true) {
            return 3;
        }
        if (assessment.response[question.id] === false) {
            return 2;
        }
        return undefined;
    })();

    return <Card>
        {debug && <>
            <div style={{ margin: 16, padding: 8, border: '1px dashed darkred', fontSize: '0.8em' }}>
                {assessment && <>
                    <div>Bieżące pytanie: {assessment.currentQuestion.replaceAll('_0', '.')}</div>
                    <div>Pytania z odpowiedziami: {Object.keys(assessment.response).sort().map(i => i === assessment.currentQuestion ? `*${i}*` : i).map(i => i.replaceAll('_0', '.')).join(', ')}</div>
                </>}
            </div>
        </>}
        <CardHeader
            title={`Ocena okresowa dla ${assessment.user.name}`}
            subheader={<div>
                <div><LinearProgress variant="determinate" value={progress.percents} /></div>
                <div style={{ fontStyle: 'italic', fontSize: '.9em', marginTop: '4px' }}>
                    Pytanie {progress.currentIdx + 1} z {progress.count}. Ankietę może przerwać w dowolnym momencie i wrócić do niej później.
                    {/*{progress.timeLeft && <>Pozostało ~{Math.min(60, Math.floor(progress.timeLeft / 60))} min.</>}*/}
                </div>
            </div>}
        >
        </CardHeader>
        <CardHeader
            title={category.name}
            titleTypographyProps={{
                fontSize: '1.2em'
            }}
            subheader={`${category.description ?? ''} (pytanie ${question.id.replaceAll('_', '.')})`}
            subheaderTypographyProps={{
                fontSize: '0.9em'
            }}
        />
        <CardContent>
            <div style={{ minHeight: '150px' }}>
                <div>{normalizeText(assessment.assessed === userId && question.text1st ? question.text1st[assessment.user.textForm ?? 'm'] : question.text3rd[assessment.user.textForm ?? 'm'])}</div>
                {question.comment && <div style={{ fontStyle: 'italic', color: 'gray' }}>{question.comment}</div>}
            </div>
        </CardContent>
        <CardContent>
            <span style={{ fontStyle: 'italic', color: 'gray' }}>Możesz dodać komentarz, który zostanie zapisany po wybraniu jednej z odpowiedzi.</span>
            <WideTextField inputRef={commentFieldRef} multiline rows={4} />
        </CardContent>
        <CardActions>
            <ScaleAnswers question={question} submitAnswer={submitAnswer} prevResponse={prevResponse} commentRef={commentFieldRef} feedbackRef={feedbackFieldRef} />
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
                    <WideTextField inputRef={feedbackFieldRef} multiline rows={4} defaultValue={assessment.questionFeedback?.[question.id] ?? ''} />
                </div>
            </CardContent>
        </Collapse>
        {debug && <CardActions style={{ justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.8em', fontStyle: 'italic', color: 'darkred', marginRight: '8px' }}>Resetowanie jest dostępne tylko w czasie beta testów</span>
            <Button variant="outlined" size="small" onClick={reset}>reset</Button>
        </CardActions>}
    </Card>;
};

const AssessmentView = ({ teamId, userId }: ViewProps) => {
    const [searchParams] = useSearchParams();
    const { assessmentId, userAssessmentId, userAssessmentRefId } = useParams<{ assessmentId: string, userAssessmentId: string, userAssessmentRefId: string }>();
    const navigate = useNavigate();
    const [splashShown, setSplashShown] = useState(searchParams.has('skipSplash'));
    const debug = searchParams.has('debug');
    const demo = searchParams.has('demo');

    const [assessment, updateAssessment, finishAssessment] = useUserAssessment(teamId, userId, assessmentId, userAssessmentId, userAssessmentRefId);
    const {
        category,
        question,
        submitAnswer,
        reset,
        progress,
        navigation
    } = useAssessmentSurveyQuestions(assessment, updateAssessment, finishAssessment, demo);

    useEffect(
        () => {
            if (assessment?.finished) {
                navigate({
                    pathname: '..',
                    search: 'finished'
                });
            }
        },
        [assessment, navigate]
    );

    if (assessment === undefined) {
        return <OneColumnLayoutWide>
            <LoadingAssessment></LoadingAssessment>
        </OneColumnLayoutWide>;
    } else if (assessment === null) {
        return <OneColumnLayoutWide>
            <NotFound id={`${assessmentId}/${userAssessmentId}`}></NotFound>
        </OneColumnLayoutWide>;
    } else if (assessment.finished || (assessment && question === null) || assessment?.currentQuestion === 'finished') {
        return <OneColumnLayoutWide>
            <Finished></Finished>
        </OneColumnLayoutWide>;
    } else if (!category || !question) {
        return <OneColumnLayoutWide>
            <LoadingQuestion></LoadingQuestion>
        </OneColumnLayoutWide>;
    } else if (!splashShown) {
        return <OneColumnLayoutWide>
            <AssessmentSplash confirm={() => setSplashShown(true)}></AssessmentSplash>
        </OneColumnLayoutWide>;
    } else {
        return <OneColumnLayoutWide>
            <QuestionSurvey assessment={assessment}
                            category={category}
                            question={question}
                            submitAnswer={submitAnswer}
                            reset={reset}
                            progress={progress}
                            userId={userId}
                            debug={debug}
            />
            <SurveyFooter backAvailable={navigation.isBackAvailable} back={navigation.back} forwardAvailable={navigation.isForwardAvailable} forward={navigation.forward} />
        </OneColumnLayoutWide>;
    }
};

const SurveyFooter: FC<{ backAvailable: boolean, back: () => void, forwardAvailable: boolean, forward: () => void }> = ({ backAvailable, back, forwardAvailable, forward }) => {
    return <div style={{ marginTop: 16, display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1 }}>
            {backAvailable && <BackButton onClick={back}>
                <ArrowBackIos /> <span>wróć do poprzedniego pytania</span>
            </BackButton>}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {forwardAvailable && <BackButton onClick={forward}>
                <span>przejdź do pytania bez odpowiedzi</span> <ArrowForwardIos />
            </BackButton>}
        </div>
    </div>;
};

const BackButton = styled(Button)`
    height: 24px;
`;

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
