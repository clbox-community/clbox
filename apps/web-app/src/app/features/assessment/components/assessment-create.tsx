import { connect, ConnectedProps } from 'react-redux';
import { OneColumnLayoutWide } from '../../layout/one-column-layout-wide';
import { AppState } from '../../../state/app-state';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { FormControl, InputLabel } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useUserPublicProfiles } from '../../user/firestore/use-user-public-profiles';
import { SelectFromDomain } from '../../skill-editor/component/select-from-domain';
import Button from '@mui/material/Button';
import { AssessmentUserSeniorityOfString } from '../model/assessment-user-seniority';
import { Assessment } from '../model/assessment';
import { firebaseApp } from '../../firebase/firebase.app';
import { useNavigate } from 'react-router-dom';

const firestore = firebaseApp.firestore();

export const AssessmentCreateView = ({ userId, teamId }: ConnectedProps<typeof connector>) => {
    const navigate = useNavigate();
    const users = useUserPublicProfiles(teamId);
    const [locked, setLocked] = useState<boolean>(false);
    const [assessed, setAssessed] = useState<string>('');
    const [assessors, setAssessors] = useState<string[]>([]);
    const [accessibleBy, setAccessibleBy] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>();

    const selectDomain = useMemo(() => {
        if (users) {
            return users
                .sort((a, b) => a.display_name.localeCompare(b.display_name))
                .map(user => ({
                    id: user.email,
                    label: user.display_name
                }));
        } else {
            return [];
        }
    }, [users]);

    const setAssessedWithAutoAssessment = useCallback((assessed: string) => {
        setAssessed(assessed);
        setAssessors(value => value.indexOf(assessed) < 0 ? [...value, assessed] : value);
        setAccessibleBy(value => {
            const assessedUserProfile = users.find(user => user.email === assessed);
            const updatedList = [...value];
            if (updatedList.indexOf(userId) < 0) {
                updatedList.push(userId);
            }
            if (updatedList.indexOf(assessedUserProfile.chapterLeader) < 0) {
                updatedList.push(assessedUserProfile.chapterLeader);
            }
            return updatedList;
        });
    }, [setAssessed, setAssessors, setAccessibleBy, userId, users]);

    const validateAndSubmit = useCallback(
        () => {
            const errors = [];
            if (!assessed) {
                errors.push('Musisz wybrać osobę ocenianą');
            }
            if (accessibleBy.length === 0) {
                errors.push('Musisz wskazać osoby upoważnione do ankiety');
            }
            if (assessors.length === 0) {
                errors.push('Musisz wybrać osoby oceniające');
            }
            setErrors(errors);
            if (errors.length > 0) {
                return;
            }

            setLocked(true);
            const assessedUserProfile = users.find(user => user.email === assessed);
            const userAssessment: Assessment = {
                assessed: assessedUserProfile.email,
                assessors: assessors,
                finishedAssessors: {},
                chapterLeader: assessedUserProfile.chapterLeader,
                accessibleBy: accessibleBy,
                deadline: new Date().getTime() + 1000 * 60 * 60 * 24 * 14,
                author: userId,
                createdAt: new Date().getTime(),
                // TODO: te dane powinny być uzupełniane lambdą na podstawie pełnego profilu użytkownika bez udostępniania tych danych w publicznym profilu
                user: {
                    name: assessedUserProfile.display_name,
                    projects: assessedUserProfile.projects,
                    teams: assessedUserProfile.teams,
                    seniority: AssessmentUserSeniorityOfString(assessedUserProfile.seniority),
                    textForm: assessedUserProfile.textForm === 'm' ? 'm' : 'f'
                }
            };

            firestore.collection(`/team/${teamId}/assessment/`)
                .add(userAssessment)
                .then(() => navigate({
                    pathname: '../',
                    search: 'created'
                }))
                .catch(error => {
                    console.error(error);
                    setErrors(['Nie udało się stworzyć ankiety, skontaktuj się z glipecki.']);
                });
        },
        [assessed, assessors, accessibleBy, navigate, teamId, userId, users]
    );

    return <OneColumnLayoutWide>
        <Card>
            {!users && <CardContent>
                Loading...
            </CardContent>}
            {users && <CardContent>
                {errors?.length > 0 && <div style={{ marginBottom: '16px' }}>
                    {errors.map(error => <div style={{ color: '#b31536' }} key={error}>{error}</div>)}
                </div>}
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel>Oceniany</InputLabel>
                    <SelectFromDomain
                        disabled={locked}
                        value={assessed}
                        multiple={false}
                        label="Oceniany"
                        domain={selectDomain}
                        onChange={selected => setAssessedWithAutoAssessment(selected[0])}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel>Lista oceniających</InputLabel>
                    <SelectFromDomain
                        disabled={locked}
                        value={assessors}
                        label="Lista oceniających"
                        domain={selectDomain}
                        onChange={setAssessors}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel>Osoby upoważnione</InputLabel>
                    <SelectFromDomain
                        disabled={locked}
                        value={accessibleBy}
                        label="Lista upoważniony"
                        domain={selectDomain}
                        onChange={setAccessibleBy}
                    />
                </FormControl>
                {locked && <span>Tworzenie ankiety oceny...</span>}
                {!locked && <Button onClick={validateAndSubmit}>Stwórz</Button>}
            </CardContent>}
        </Card>
    </OneColumnLayoutWide>;
};

const connector = connect(
    (state: AppState) => ({
        userId: state.authentication?.email,
        teamId: state.team?.current?.id
    }),
    {}
);

export const AssessmentCreate = connector(AssessmentCreateView);
