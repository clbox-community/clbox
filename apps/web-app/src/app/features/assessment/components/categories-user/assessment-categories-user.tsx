import { useParams } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../../state/app-state';
import { OneColumnLayoutUltraWide } from '../assessment-result';
import { useUserProfile } from '../../../user/firestore/use-user-profile';
import { Spinner } from '../../../../ui/spinner/spinner';
import { categories, Question } from '@clbox/assessment-survey';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormControl } from '@mui/material';
import styled from 'styled-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { UserAssessmentVerification, UserAssessmentVerifiedCategories, UserAssessmentVerifiedCategory } from '../../model/user-assessment-verified-categories';
import { firebaseApp } from '../../../firebase/firebase.app';

function verificationColor(verifiedStatus: UserAssessmentVerification) {
    switch (verifiedStatus) {
        case UserAssessmentVerification.Verified:
            return 'rgba(39, 174, 96, 1.0)';
        case UserAssessmentVerification.Skip:
            return 'rgba(127, 140, 141, 1.0)';
        case UserAssessmentVerification.Verify:
            return 'rgba(230, 126, 34, 1.0)';
        case UserAssessmentVerification.Ask:
            return 'inherit';
        default:
            throw new Error('Unknown verification status');
    }
}

const CategoryQuestionsRow = styled.div``;

const CategoryQuestionRow = styled.div`
    &:hover {
        outline: 1px dashed gray;
    }
`;

function filterCategories(filter: UserAssessmentVerification, verifiedCategories: { [p: string]: UserAssessmentVerifiedCategory }) {
    if (filter && verifiedCategories) {
        const result = [];
        categories.forEach(category => {
            const questions = [];
            category.questions.forEach((question: Question) => {
                if ((verifiedCategories[question.id]?.status ?? UserAssessmentVerification.Ask) === filter) {
                    questions.push(question);
                }
            });
            if (questions.length > 0) {
                result.push({
                    ...category,
                    questions
                });
            }
        });
        return result;
    } else {
        return categories;
    }
}

export const AssessmentCategoriesUserView = ({ teamId, loggedUser }: ConnectedProps<typeof connector>) => {
    const { user } = useParams<{ user: string | undefined }>();
    const userProfile = useUserProfile(teamId, user);
    const [filter, setFilter] = useState<UserAssessmentVerification | undefined>(UserAssessmentVerification.Ask);
    const [verifiedCategories, setVerifiedCategories] = useState<UserAssessmentVerifiedCategories>(undefined);

    useEffect(() => {
        if (teamId && user) {
            firebaseApp.firestore()
                .doc(`/team/${teamId}/user/${user}/data/assessment-categories`)
                .get()
                .then(snapshot => {
                    setVerifiedCategories(snapshot.data() || {});
                });
        }
    }, [teamId, user]);

    const updateVerificationStatus = useCallback(
        (question: Question, status: UserAssessmentVerification) => {
            const updatedVerificationStatus = {
                status: status,
                author: loggedUser,
                date: new Date().getTime()
            };
            setVerifiedCategories(
                current => ({
                    ...current, [question.id]: updatedVerificationStatus
                })
            );
            firebaseApp.firestore()
                .doc(`/team/${teamId}/user/${user}/data/assessment-categories`)
                .set({
                    [question.id]: updatedVerificationStatus
                }, {
                    merge: true
                })
        },
        [teamId, user, loggedUser]
    );

    const filteredCategories = useMemo(() => filterCategories(filter, verifiedCategories), [filter, verifiedCategories]);

    return <OneColumnLayoutUltraWide>
        {(!userProfile || !verifiedCategories) && <Spinner />}
        {userProfile && verifiedCategories && <>
            <div style={{ marginBottom: '16px', fontSize: '1.2em', borderBottom: '1px solid gray' }}>{userProfile?.display_name}</div>
            <div style={{ textAlign: 'right' }}>
                <ButtonGroup variant="text" size="small" color="inherit">
                    <Button sx={{ fontWeight: filter === undefined ? 'bold' : 'inherit' }} onClick={() => setFilter(undefined)}>wszystkie</Button>
                    <Button sx={{ fontWeight: filter === UserAssessmentVerification.Ask ? 'bold' : 'inherit' }} onClick={() => setFilter(UserAssessmentVerification.Ask)}>aktywne</Button>
                    <Button sx={{ fontWeight: filter === UserAssessmentVerification.Verified ? 'bold' : 'inherit' }}
                            onClick={() => setFilter(UserAssessmentVerification.Verified)}>potwierdzone</Button>
                    <Button sx={{ fontWeight: filter === UserAssessmentVerification.Skip ? 'bold' : 'inherit' }} onClick={() => setFilter(UserAssessmentVerification.Skip)}>ignorowane</Button>
                </ButtonGroup>
            </div>
            <div>
                {filteredCategories.map(
                    category => <div key={category.id} style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{category.name} ({category.id})</div>
                        <CategoryQuestionsRow>
                            {category.questions.map(
                                question => <CategoryQuestionRow key={question.id}
                                                                 style={{ margin: '0 8px' }}>
                                    <div style={{ display: 'flex', color: verificationColor(verifiedCategories[question.id]?.status ?? UserAssessmentVerification.Ask) }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                            {question.text3rd ? question.text3rd?.[userProfile.textForm ?? 'm'] : question.text1st?.[userProfile.textForm ?? 'm']}
                                        </div>
                                        <div style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                                            {question.id}
                                        </div>
                                        <div style={{ width: '170px' }}>
                                            <FormControl sx={{ m: 1, width: '160px' }} size="small">
                                                <Select
                                                    value={verifiedCategories[question.id]?.status ?? UserAssessmentVerification.Ask}
                                                    onChange={event => updateVerificationStatus(question, event.target.value as UserAssessmentVerification)}
                                                >
                                                    <MenuItem value={UserAssessmentVerification.Ask}>Pytaj</MenuItem>
                                                    <MenuItem value={UserAssessmentVerification.Verified}>Potwierdzone</MenuItem>
                                                    <MenuItem value={UserAssessmentVerification.Skip}>Nie dotyczy</MenuItem>
                                                    {/*<MenuItem value={VerifiedStatus.Verify}>Potwierdź</MenuItem>*/}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                    {verifiedCategories[question.id] && <div style={{ fontSize: '0.9em', color: 'gray', fontStyle: 'italic', textAlign: 'right' }}>
                                        {verifiedCategories[question.id]?.author} {verifiedCategories[question.id]?.date ? new Date(verifiedCategories[question.id]?.date).toISOString() : undefined}
                                    </div>}
                                </CategoryQuestionRow>
                            )}
                        </CategoryQuestionsRow>
                    </div>
                )}
            </div>
        </>}
    </OneColumnLayoutUltraWide>;
};

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id,
        loggedUser: state.authentication?.email
    }),
    {}
);

export const AssessmentCategoriesUser = connector(AssessmentCategoriesUserView);

