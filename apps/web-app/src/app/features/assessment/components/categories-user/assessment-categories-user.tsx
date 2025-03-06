import { useParams } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../../state/app-state';
import { OneColumnLayoutUltraWide } from '../assessment-result';
import { useUserProfile } from '../../../user/firestore/use-user-profile';
import { Spinner } from '../../../../ui/spinner/spinner';
import { categories, Category, Question } from '@clbox/assessment-survey';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormControl } from '@mui/material';
import styled from 'styled-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { UserAssessmentVerification, UserAssessmentVerifiedCategories, UserAssessmentVerifiedCategory } from 'assessment-model';
import { firebaseApp } from '../../../firebase/firebase.app';
import { UserProfile } from 'user-profile-model';

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
    margin: 0 8px;

    &:hover {
        outline: 1px dashed gray;
    }
`;

const CategoryQuestionColumn = styled.div`
    display: flex;
    align-items: center;
`;
const CategoryQuestionTextColumn = styled(CategoryQuestionColumn)`
    flex: 1;
`;
const CategoryQuestionTextSeniorityColumn = styled(CategoryQuestionColumn)`
    width: 80px;
`;
const CategoryQuestionTextIdColumn = styled(CategoryQuestionColumn)`
    width: 80px;
`;
const CategoryQuestionTextIdColumnEllipsis = styled.div`
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
`
const CategoryQuestionTextAssessmentColumn = styled(CategoryQuestionColumn)`
    width: 170px
`;
const CategoryQuestionAuditRow = styled.div`
    font-size: .9em;
    color: gray;
    font-style: italic;
    text-align: right;
`;

const CategoryRowPanel = styled.div`
    margin-bottom: 12px;
`;
const CategoryRowName = styled.div`
    font-weight: bold;
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

const QuestionAssessmentVerificationSelect = ({ value, onChange }: { value: UserAssessmentVerification, onChange: (value: UserAssessmentVerification) => void }) => {
    return <FormControl sx={{ m: 1, width: '160px' }} size="small">
        <Select
            value={value}
            onChange={event => onChange(event.target.value as UserAssessmentVerification)}
        >
            <MenuItem value={UserAssessmentVerification.Ask}>Pytaj</MenuItem>
            <MenuItem value={UserAssessmentVerification.Verified}>Potwierdzone</MenuItem>
            <MenuItem value={UserAssessmentVerification.Skip}>Nie dotyczy</MenuItem>
            {/*<MenuItem value={VerifiedStatus.Verify}>Potwierdź</MenuItem>*/}
        </Select>
    </FormControl>;
};

const UserAssessmentVerificationFilter = ({ value, onChange }: { value: UserAssessmentVerification | undefined, onChange: (value: UserAssessmentVerification | undefined) => void }) => {
    return <ButtonGroup variant="text" size="small" color="inherit">
        <Button
            sx={{ fontWeight: value === undefined ? 'bold' : 'inherit' }}
            onClick={() => onChange(undefined)}>
            wszystkie
        </Button>
        <Button
            sx={{ fontWeight: value === UserAssessmentVerification.Ask ? 'bold' : 'inherit' }}
            onClick={() => onChange(UserAssessmentVerification.Ask)}>
            aktywne
        </Button>
        <Button
            sx={{ fontWeight: value === UserAssessmentVerification.Verified ? 'bold' : 'inherit' }}
            onClick={() => onChange(UserAssessmentVerification.Verified)}>
            potwierdzone
        </Button>
        <Button
            sx={{ fontWeight: value === UserAssessmentVerification.Skip ? 'bold' : 'inherit' }}
            onClick={() => onChange(UserAssessmentVerification.Skip)}>
            ignorowane
        </Button>
    </ButtonGroup>;
};

function fetchUserVerifiedCategories(teamId: string, user: string, setVerifiedCategories: (value: (((prevState: UserAssessmentVerifiedCategories) => UserAssessmentVerifiedCategories) | UserAssessmentVerifiedCategories)) => void) {
    firebaseApp.firestore()
        .doc(`/team/${teamId}/user/${user}/data/assessment-categories`)
        .get()
        .then(snapshot => {
            setVerifiedCategories(snapshot.data() || {});
        });
}

function updateUserVerifiedCategories(teamId: string, user: string, question: Question, updatedVerificationStatus: { status: UserAssessmentVerification; author: string; date: number }) {
    firebaseApp.firestore()
        .doc(`/team/${teamId}/user/${user}/data/assessment-categories`)
        .set({
            [question.id]: updatedVerificationStatus
        }, {
            merge: true
        })
        .catch(error => {
            console.error(error);
            alert('Nie udało się zapisać, spójrz w logi i zgłoś problem ;)');
        });
}

const CategoryRow = ({ category, verifiedCategories, userProfile, updateVerificationStatus }: { category: Category, verifiedCategories: UserAssessmentVerifiedCategories, userProfile: UserProfile, updateVerificationStatus: (question: Question, status: UserAssessmentVerification) => void }) => {
    return <CategoryRowPanel>
        <CategoryRowName>
            {category.name} ({category.id})
        </CategoryRowName>
        <CategoryQuestionsRow>
            {category.questions.map(
                question => <CategoryQuestionRow key={question.id}>
                    <div style={{ display: 'flex', color: verificationColor(verifiedCategories[question.id]?.status ?? UserAssessmentVerification.Ask) }}>
                        <CategoryQuestionTextColumn>
                            {question.text3rd ? question.text3rd?.[userProfile.textForm ?? 'm'] : question.text1st?.[userProfile.textForm ?? 'm']}
                        </CategoryQuestionTextColumn>
                        <CategoryQuestionTextSeniorityColumn>
                            {question.seniority}
                        </CategoryQuestionTextSeniorityColumn>
                        <CategoryQuestionTextIdColumn title={question.id?.replaceAll('_', '.')}>
                            <CategoryQuestionTextIdColumnEllipsis>
                                {question.id?.replaceAll('_', '.')}
                            </CategoryQuestionTextIdColumnEllipsis>
                        </CategoryQuestionTextIdColumn>
                        <CategoryQuestionTextAssessmentColumn>
                            <QuestionAssessmentVerificationSelect
                                value={verifiedCategories[question.id]?.status ?? UserAssessmentVerification.Ask}
                                onChange={value => updateVerificationStatus(question, value)}
                            />
                        </CategoryQuestionTextAssessmentColumn>
                    </div>
                    {verifiedCategories[question.id] && <CategoryQuestionAuditRow>
                        {verifiedCategories[question.id]?.author} {verifiedCategories[question.id]?.date ? new Date(verifiedCategories[question.id]?.date).toISOString() : undefined}
                    </CategoryQuestionAuditRow>}
                </CategoryQuestionRow>
            )}
        </CategoryQuestionsRow>
    </CategoryRowPanel>;
};

export const AssessmentCategoriesUserView = ({ teamId, loggedUser }: ConnectedProps<typeof connector>) => {
    const { user } = useParams<{ user: string | undefined }>();
    const userProfile = useUserProfile(teamId, user);
    const [filter, setFilter] = useState<UserAssessmentVerification | undefined>(UserAssessmentVerification.Ask);
    const [verifiedCategories, setVerifiedCategories] = useState<UserAssessmentVerifiedCategories>(undefined);

    useEffect(() => {
        if (teamId && user) {
            fetchUserVerifiedCategories(teamId, user, setVerifiedCategories);
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
            updateUserVerifiedCategories(teamId, user, question, updatedVerificationStatus);
        },
        [teamId, user, loggedUser]
    );

    const filteredCategories = useMemo(() => filterCategories(filter, verifiedCategories), [filter, verifiedCategories]);

    return <OneColumnLayoutUltraWide>
        {(!userProfile || !verifiedCategories) && <Spinner />}
        {userProfile && verifiedCategories && <>
            <div style={{ marginBottom: '16px', fontSize: '1.2em', borderBottom: '1px solid gray' }}>{userProfile?.display_name}</div>
            <div style={{ textAlign: 'right' }}>
                <UserAssessmentVerificationFilter
                    value={filter}
                    onChange={setFilter}
                />
            </div>
            <div>
                {filteredCategories.map(
                    category => <CategoryRow
                        key={category.id}
                        category={category}
                        userProfile={userProfile}
                        verifiedCategories={verifiedCategories}
                        updateVerificationStatus={updateVerificationStatus}
                    />
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

