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
import { firebaseApp } from '../../firebase/firebase.app';
import { useNavigate } from 'react-router-dom';
import { Assessment, AssessmentUserSeniorityOfString } from 'assessment-model';
import { useParams } from 'react-router';
import { useAssessmentForEdit } from '../state/use-assessment-for-edit';

const db = firebaseApp.firestore();

export const AssessmentCreateView = ({ userId, teamId }: ConnectedProps<typeof connector>) => {
    const { uuid } = useParams<{ uuid: string | undefined }>();
    const [originalAssessment] = useAssessmentForEdit(teamId, uuid);
    const [assessment, setAssessment] = useAssessmentForEdit(teamId, uuid);
    const navigate = useNavigate();
    const users = useUserPublicProfiles(teamId);
    const [locked, setLocked] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>();

    const selectDomain = useMemo(() => {
        if (users) {
            return users
                .slice()
                .sort((a, b) => a.display_name.localeCompare(b.display_name))
                .map(user => ({
                    id: user.email,
                    label: user.display_name
                }));
        } else {
            return [];
        }
    }, [users]);

    const validateAndSubmit = useCallback(
        () => {
            const errors = [];
            if (!assessment.assessed) {
                errors.push('Musisz wybrać osobę ocenianą');
            }
            if (assessment.accessibleBy.length === 0) {
                errors.push('Musisz wskazać osoby upoważnione do ankiety');
            }
            if (assessment.assessors.length === 0) {
                errors.push('Musisz wybrać osoby oceniające');
            }
            if (originalAssessment?.assessors?.some(originalAssessor => !assessment.assessors.includes(originalAssessor))) {
                errors.push('Usuwanie osób oceniających nie jest obsługiwane. Wszyscy wcześniej oceniający nadal muszą być na liście: ' + originalAssessment?.assessors.join(', '));
            }
            setErrors(errors);
            if (errors.length > 0) {
                return;
            }

            setLocked(true);
            const assessedUserProfile = users.find(user => user.email === assessment.assessed);

            const userAssessment: Assessment = {
                ...assessment,
                assessed: assessedUserProfile.email,
                assessors: assessment.assessors,
                finishedAssessors: assessment.finishedAssessors ?? {},
                chapterLeader: assessedUserProfile.chapterLeader,
                accessibleBy: assessment.accessibleBy,
                deadline: assessment.deadline ?? new Date().getTime() + 1000 * 60 * 60 * 24 * 14,
                author: assessment.author ? assessment.author : userId,
                createdAt: assessment.createdAt ?? new Date().getTime(),
                user: assessment.user ?? {
                    name: assessedUserProfile.display_name,
                    projects: assessedUserProfile.projects,
                    teams: assessedUserProfile.teams,
                    seniority: AssessmentUserSeniorityOfString(assessedUserProfile.seniority),
                    textForm: assessedUserProfile.textForm === 'm' ? 'm' : 'f'
                }
            };

            if (assessment.id) {
                db.doc(`/team/${teamId}/assessment/${assessment.id}`)
                    .set(userAssessment)
                    .then(() => navigate({ pathname: '../', search: 'created' }))
                    .catch(error => {
                        console.error(error);
                        setErrors(['Nie udało się zapisać ankiety, skontaktuj się z glipecki.']);
                    });
            } else {
                db.collection(`/team/${teamId}/assessment/`)
                    .add(userAssessment)
                    .then(() => navigate({ pathname: '../', search: 'created' }))
                    .catch(error => {
                        console.error(error);
                        setErrors(['Nie udało się stworzyć ankiety, skontaktuj się z glipecki.']);
                    });
            }
        },
        [assessment, navigate, teamId, userId, users]
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
                        disabled={locked || !!assessment.id}
                        value={assessment.assessed}
                        multiple={false}
                        label="Oceniany"
                        domain={selectDomain}
                        onChange={change => setAssessment(assessment => ({
                            ...assessment,
                            assessed: change[0],
                            assessors: assessment.assessors.indexOf(change[0]) < 0 ? [...assessment.assessors, change[0]] : assessment.assessors,
                            accessibleBy: ((previous) => {
                                const assessedUserProfile = users.find(user => user.email === change[0]);
                                const updatedList = [...previous];
                                if (updatedList.indexOf(userId) < 0) {
                                    updatedList.push(userId);
                                }
                                if (updatedList.indexOf(assessedUserProfile.chapterLeader) < 0) {
                                    updatedList.push(assessedUserProfile.chapterLeader);
                                }
                                return updatedList;
                            })(assessment.accessibleBy)
                        }))}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel>Lista oceniających</InputLabel>
                    <SelectFromDomain
                        disabled={locked}
                        value={assessment.assessors}
                        label="Lista oceniających"
                        domain={selectDomain}
                        onChange={assessors => setAssessment(assessment => ({
                            ...assessment,
                            assessors
                        }))}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                    <InputLabel>Osoby upoważnione</InputLabel>
                    <SelectFromDomain
                        disabled={locked}
                        value={assessment.accessibleBy}
                        label="Lista upoważniony"
                        domain={selectDomain}
                        onChange={accessibleBy => setAssessment(assessment => ({
                            ...assessment,
                            accessibleBy
                        }))}
                    />
                </FormControl>
                {locked && <span>Zapisywanie ankiety oceny...</span>}
                {!locked && <Button onClick={validateAndSubmit}>Zapisz</Button>}
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

export const AssessmentEdit = connector(AssessmentCreateView);
