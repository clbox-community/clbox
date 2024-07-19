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

function scaleOptions(question: Question): {value: number, text: string, comment?: string}[] {
    if (question.type === QuestionType.Frequency) {
        return [
            { value: 1, text: 'nigdy' },
            { value: 2, text: 'rzadko' },
            { value: 3, text: 'często' },
            { value: 4, text: 'zawsze' }
        ];
    } else if (question.type === QuestionType.Correctness) {
        return [
            { value: 1, text: 'w ogóle się nie zgadzam' },
            { value: 2, text: 'raczej nie' },
            { value: 3, text: 'raczej tak' },
            { value: 4, text: 'stanowczo się zgadzam' }
        ];
    } else if (question.type === QuestionType.Scale) {
        const conf = question.questionData as {
            scale: {
                values: { value: number, label: string, comment: string }[]
            }
        };
        return conf.scale.values.map(c => ({
            value: c.value, text: c.label, comment: c.comment
        }));
    }
    throw new Error(`Unknown question type [question=${question.id}, type=${question.type}]`);
}

const ScaleAnswers: FC<{ question: Question, submitAnswer, prevResponse: number, commentRef: MutableRefObject<HTMLTextAreaElement>, feedbackRef: MutableRefObject<HTMLTextAreaElement> }> = ({
                                                                                                                                                                                                 question,
                                                                                                                                                                                                 submitAnswer,
                                                                                                                                                                                                 prevResponse,
                                                                                                                                                                                                 commentRef,
                                                                                                                                                                                                 feedbackRef
                                                                                                                                                                                             }) => {
    const type = question.type ?? QuestionType.Frequency;
    const options = scaleOptions(question);
    return <div>
        <div>
            {options.map(question => <React.Fragment key={`scale-value-${question.value}`}>
                <Button variant="outlined" size="small" onClick={() => submitAnswer(question.value, commentRef.current?.value, feedbackRef.current?.value)}
                        style={{ width: '200px', height: '50px', backgroundColor: prevResponse === question.value ? 'rgba(192, 57, 43, .1)' : undefined }}>
                    <div>
                        {question.text}
                    </div>
                </Button>
            </React.Fragment>)}
        </div>
        <div style={{padding: '16px', fontSize: '0.8em', color: 'gray', fontStyle: 'italic'}}>
            {options.filter(q => q.comment).map(question => <div key={`scale-text-${question.comment}`}>
                {question.comment && <div>{question.value} - {question.comment}</div>}
            </div>)}
        </div>
    </div>;
};

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
        return undefined;
    })();

    return <Card>
        {debug && <>
            <div style={{ margin: 16, padding: 8, border: '1px dashed darkred', fontSize: '0.8em' }}>
                {assessment && <>
                    <div>Bieżące pytanie: {assessment.currentQuestion.replaceAll('_0', '.')}</div>
                    <div>Pytania z odpowiedziami: {Object.keys(assessment.responseValue).sort().map(i => i === assessment.currentQuestion ? `*${i}*` : i).map(i => i.replaceAll('_0', '.')).join(', ')}</div>
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
            <span style={{ fontStyle: 'italic', color: 'gray' }}>Czy chcesz powiedzieć coś więcej? Możesz dodać nieobowiązkowy komentarz poniżej.</span>
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
            <SurveyFooter backAvailable={navigation.isBackAvailable} back={navigation.back} forwardAvailable={navigation.isForwardAvailable} forward={navigation.forward}  fastForwardAvailable={navigation.isFastForwardAvailable} fastForward={navigation.fastForward} />
        </OneColumnLayoutWide>;
    }
};

const SurveyFooter: FC<{ backAvailable: boolean, back: () => void, forwardAvailable: boolean, forward: () => void, fastForwardAvailable: boolean, fastForward: () => void }> = ({ backAvailable, back, forwardAvailable, forward, fastForwardAvailable, fastForward }) => {
    return <div style={{ marginTop: 16, display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1 }}>
            {backAvailable && <NavButton onClick={back}>
                <ArrowBackIos /> <span>wstecz</span>
            </NavButton>}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {forwardAvailable && <NavButton onClick={forward}>
                <span>dalej</span> <ArrowForwardIos />
            </NavButton>}
            {/*{fastForwardAvailable && <NavButton onClick={fastForward}>*/}
            {/*    <span>przejdź do pytania bez odpowiedzi</span> <ArrowForwardIos /> <ArrowForwardIos />*/}
            {/*</NavButton>}*/}
        </div>
    </div>;
};

const NavButton = styled(Button)`
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
