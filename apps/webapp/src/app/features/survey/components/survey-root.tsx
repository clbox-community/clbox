import { SurveyWizard } from './survey-wizard';
import { useSelector } from 'react-redux';
import { AppState } from '../../../state/app-state';
import { Survey } from '../model/survey';
import { useParams } from 'react-router';
import React, { useCallback, useEffect, useState } from 'react';
import { firebaseApp } from '../../firebase/firebase.app';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyOnePage } from './survey-one-page';
import { CampaignAnswers } from '../../campaign/model/campaign-answers';
import { asSurveyAnswer } from '../model/as-survey-answer';
import { SurveyPageAnswerType } from './survey-page-answer-type';
import { useNavigate } from 'react-router-dom';

function useTeamFromParamOrStore() {
    const storeTeam = useSelector((state: AppState) => state.team.current?.id);
    const { team: urlTeam } = useParams<{ team?: string }>();
    const team = storeTeam ?? urlTeam;
    if (team) {
        return team;
    } else {
        throw new Error(`Can't render SurveyWizard without team id`);
    }
}

function useSurvey(team: string, uuid: string, afterSubmit: () => void): [Survey, (answers: { [key: string]: number }) => void] {
    const [survey, setSurvey] = useState<Survey>(undefined);
    const submit = useCallback((answers: { [key: string]: number }) => {
        if (uuid && team) {
            const campaignAnswers: Omit<CampaignAnswers, 'id'> = {
                user: survey.responsePrivacy === 'signed' ? survey.forUser : 'anonymous',
                answers: Object.keys(answers)
                    .map(id => ({
                        ...asSurveyAnswer(
                            uuid,
                            {
                                stats: {
                                    time: 0,
                                    answerChanges: 0
                                },
                                type: SurveyPageAnswerType.Submit,
                                value: answers[id]
                            },
                            survey.pages.find(page => page.id === id)
                        ),
                        id
                    }))
                    .reduce((record, answer) => ({...record, [answer.id]: answer}), {})
            };
            firebaseApp.firestore()
                .collection(`/team/${team}/campaign/${survey.campaign}/answers`)
                .add(campaignAnswers)
                .then(() => {
                    firebaseApp.firestore()
                        .collection(`team/${team}/survey`)
                        .doc(uuid)
                        .delete();
                    afterSubmit();
                });
        }
        return;
    }, [team, uuid, survey]);
    useEffect(
        () => {
            const abort = new AbortController();
            if (uuid && team) {
                firebaseApp.firestore()
                    .collection(`team/${team}/survey`)
                    .doc(uuid)
                    .get()
                    .then(survey => {
                        if (!abort.signal.aborted) {
                            setSurvey(survey?.data() as Survey ?? null);
                        }
                    });
            }
            return () => abort.abort();
        },
        [uuid, team]
    );
    return [survey, submit];
}

export const SurveyRoot = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const team = useTeamFromParamOrStore();

    const [survey, submitSurvey] = useSurvey(team, uuid, () => navigate('/survey/inbox'));

    if (survey) {
        if (survey.flow === 'wizard') {
            return <SurveyWizard survey={survey} team={team} uuid={uuid}></SurveyWizard>;
        } else if (survey.flow === 'onepage') {
            return <SurveyOnePage survey={survey} submit={submitSurvey}></SurveyOnePage>;
        } else {
            return <SurveyWizard survey={survey} team={team} uuid={uuid}></SurveyWizard>;
        }
    } else if (survey === undefined) {
        return <CircularProgress />;
    } else {
        return <>Nie znaleziono ankiety: {team}/{uuid}</>;
    }
};
