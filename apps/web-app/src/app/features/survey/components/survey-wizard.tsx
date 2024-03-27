import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from "@mui/material/Typography";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {useParams} from 'react-router';
import styled from 'styled-components';
import {AppState} from '../../../state/app-state';
import {firebaseApp} from '../../firebase/firebase.app';
import {asSurveyAnswer} from '../model/as-survey-answer';
import {Survey} from '../model/survey';
import {SurveyPage, SurveyPageType} from '../model/survey-page';
import {SurveyQuestionAnswered, SurveyQuestionAnswerType} from '../model/survey-question-answered';
import {SurveyQuestionData} from '../model/survey-question-data';
import {SurveyTextData} from '../model/survey-text-data';
import {SurveyPageAnswerType} from "./survey-page-answer-type";
import {SurveyPageAnswer, SurveyQuestionPage} from './survey-question-page';
import {SurveyTextPage} from './survey-text-page';

const WizardWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const StyledCard = styled(Card)`
`;

const SpinnerWrapper = styled.div`
    width: 100%;
    margin-top: 32px;
    display: flex;
    justify-content: center;
`;

function fetchSurveyCallback(team: string, uuid: string, setSurvey: (value: (((prevState: Survey) => Survey) | Survey)) => void) {
    const abort = new AbortController();
    firebaseApp.firestore()
        .collection(`team/${team}/survey`)
        .doc(uuid)
        .get()
        .then(survey => {
            if (!abort.signal.aborted) {
                setSurvey(survey?.data() as Survey ?? null);
            }
        });
    return () => abort.abort();
}

interface SurveyWizardStepProps {
    survey: Survey,
    page: SurveyPage,
    previousAnswer: SurveyPageAnswer,
    onAnswer: (answer?: SurveyPageAnswer) => void,
    onBack: () => void;
}

const SurveyWizardStep = ({survey, page, previousAnswer, onAnswer, onBack}: SurveyWizardStepProps) => {
    if (page.type === SurveyPageType.question) {
        return <SurveyQuestionPage
            defaultValue={previousAnswer as SurveyPageAnswer}
            question={page as SurveyPage<SurveyQuestionData>}
            key={page.id}
            onAnswer={onAnswer}
            withBack={survey.withBackNavigation && survey.pages.indexOf(page) > 0}
            onBack={onBack}
            lastPage={survey.pages.indexOf(page) === survey.pages.length - 1}
        />;
    } else if (page.type === SurveyPageType.text) {
        return <SurveyTextPage
            page={page as SurveyPage<SurveyTextData>}
            lastPage={survey.pages.indexOf(page) === survey.pages.length - 1}
            onAnswer={onAnswer}
            withBack={survey.withBackNavigation && survey.pages.indexOf(page) > 0}
            onBack={onBack}
        />;
    } else {
        return <div>
            <div>i dunno what to do ;(</div>
            <div>
                <pre>{JSON.stringify(page, undefined, 2)}</pre>
            </div>
        </div>;
    }
}

const SurveyWizardView = ({teamId}: ViewProps) => {
    const {uuid, ...params} = useParams<{ uuid: string, team?: string }>();

    const team = teamId ?? params.team;
    if (!team) {
        throw new Error(`Can't render SurveyWizard without team id`);
    }

    const [survey, setSurvey] = useState<Survey>(undefined);

    const [page, setPage] = useState<SurveyPage>(undefined);
    const [answers, setAnswers] = useState<Record<string, SurveyQuestionAnswered>>({});
    const [finished, setFinished] = useState<boolean>(false);

    useEffect(() => survey && setPage(survey.pages[0]), [survey]);
    useEffect(() => {
        if (uuid && team) {
            return fetchSurveyCallback(team, uuid, setSurvey);
        }
    }, [uuid, team]);

    const onAnswer = useCallback((answer: SurveyPageAnswer) => {
        const currentQuestionIndex = survey.pages.indexOf(page);
        const surveyAnswer = answer !== undefined ? asSurveyAnswer(uuid, answer, survey, page as SurveyPage<SurveyQuestionData>) : undefined;

        if (currentQuestionIndex + 1 >= survey.pages.length) {
            setFinished(true);
            const answered = surveyAnswer !== undefined ? {
                user: survey.responsePrivacy === 'signed' ? survey.forUser : 'anonymous',
                answers: {
                    ...answers,
                    [surveyAnswer.question.id]: surveyAnswer
                }
            } : {
                user: survey.responsePrivacy === 'signed' ? survey.forUser : 'anonymous',
                answers
            };

            if (window.location.search.indexOf('dryRun') >= 0) {
                console.log(answered)
            } else {
                firebaseApp.firestore()
                    .collection(`/team/${team}/campaign/${survey.campaign}/answers`)
                    .add(answered)
                    .then(() => {
                        firebaseApp.firestore()
                            .collection(`team/${team}/survey`)
                            .doc(uuid)
                            .delete();
                    });
            }
        } else {
            setPage(survey.pages[currentQuestionIndex + 1]);
            if (surveyAnswer) {
                setAnswers(prev => ({
                    ...prev,
                    [surveyAnswer.question.id]: surveyAnswer
                }));
            }
        }
    }, [survey, page, answers, setAnswers]);

    const progress = useMemo<{ current: number, count: number, percent: number }>(() => {
        if (survey && page) {
            const current = survey.pages.indexOf(page) + 1;
            const count = survey.pages.length;
            return {
                current, count, percent: Math.min((current / count) * 100, 100)
            };
        } else {
            return undefined;
        }
    }, [survey, page]);

    const onBack = useCallback(() => {
        setPage(current => survey.pages[survey.pages.indexOf(current) - 1]);
    }, [survey]);

    const previousAnswer = useMemo<SurveyPageAnswer>(() => {
        const prev = page ? answers[page.id] : undefined;
        return prev ? {
            type: prev.type === SurveyQuestionAnswerType.Submit ? SurveyPageAnswerType.Submit : SurveyPageAnswerType.Skip,
            comment: prev.comment,
            value: prev.value,
            stats: {
                ...prev.stats
            }
        } : undefined;
    }, [page, answers]);

    return <WizardWrapper>
        {survey && <div style={{marginBottom: '32px'}}>
            <Typography variant={"h6"}>{survey.title}</Typography>
            <div style={{fontStyle: 'italic', fontSize: '0.8em', display: 'flex', alignItems: 'center'}}>
                {survey.responsePrivacy === 'anonymous' ? 'Ankieta anonimowa' : 'Ankieta z odpowiedziami użytkownika'}
                <Tooltip
                    title={
                        survey.responsePrivacy === 'anonymous' ?
                            'Twoje odpowiedzi nie są w żaden sposób powiązane z Twoimi danymi. Informacja o autorze odpowiedzi nie jest w ogóle przechowywana w systemie.'
                            :
                            'Twoje odpowiedzi są zapisane razem z Twoimi informacjami. Osoby oglądające wyniki mogą powiązać Twoje odpowiedzi z Tobą.'
                    }
                    arrow
                >
                    <HelpOutlineIcon
                        color="disabled"
                        style={{marginLeft: '4px', fontSize: '1.3em', cursor: 'pointer'}}
                    />
                </Tooltip>
            </div>
            {progress && <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{flex: 1, marginRight: '8px'}}>
                    <LinearProgress variant="determinate" value={progress.percent}/>
                </div>
                <div style={{fontSize: '0.8em', fontStyle: 'italic'}}>{progress.current} / {progress.count}</div>
            </div>}
        </div>}
        {survey === undefined && !finished && <SpinnerWrapper>
            <CircularProgress/>
        </SpinnerWrapper>}
        {survey === null && !finished && <StyledCard>
            <CardContent>
                Nice try, nie ma takiej ankiety.
            </CardContent>
        </StyledCard>}
        {survey && !finished && page && <SurveyWizardStep
            survey={survey}
            page={page}
            previousAnswer={previousAnswer}
            onAnswer={onAnswer}
            onBack={onBack}
        />}
        {finished && <StyledCard>
            <CardContent>
                To już koniec, dzięki!
            </CardContent>
        </StyledCard>}
    </WizardWrapper>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id
    }),
    {}
);

export const SurveyWizard = connector(SurveyWizardView);
