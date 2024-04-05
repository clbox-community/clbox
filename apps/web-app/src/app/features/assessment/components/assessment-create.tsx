import {connect, ConnectedProps} from "react-redux";
import {OneColumnLayoutWide} from "../../layout/one-column-layout-wide";
import {AppState} from "../../../state/app-state";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {FormControl, InputLabel} from "@mui/material";
import React, {useCallback, useMemo, useState} from "react";
import {useUserProfiles} from "../../user/firestore/use-user-profiles";
import {SelectFromDomain} from "../../skill-editor/component/select-from-domain";
import Button from "@mui/material/Button";
import {AssessmentUserSeniorityOfString} from "../model/assessment-user-seniority";
import {Assessment} from "../model/assessment";
import {firebaseApp} from "../../firebase/firebase.app";
import {useNavigate} from "react-router-dom";

const firestore = firebaseApp.firestore();

// import TextField from "@mui/material/TextField";
// const TextInput = ({label, value, valueHandler}: {
//     label: string, value: string, valueHandler:
//         (value: string) => void
// }) => {
//     return <FormControl fullWidth sx={{marginBottom: '16px'}}>
//         <TextField
//             label={label}
//             variant="outlined"
//             multiline
//             value={value}
//             onChange={change => valueHandler(change.target.value)}
//         />
//     </FormControl>;
// }

export const AssessmentCreateView = ({userId, teamId}: ConnectedProps<typeof connector>) => {
    const navigate = useNavigate();
    const users = useUserProfiles(teamId);
    const [locekd, setLocked] = useState<boolean>(false);
    const [assessed, setAssessed] = useState<string>('');
    const [assessors, setAssessors] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>();

    const selectDomain = useMemo(() => {
        if (users) {
            return users.map(user => ({
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
            if (!assessed) {
                errors.push('Musisz wybrać osobę ocenianą')
            }
            if (assessors.length === 0) {
                errors.push('Musisz wybrać osoby oceniane')
            }
            setErrors(errors);
            if (errors.length > 0) {
                return;
            }

            setLocked(true);
            const assessedUserProfile = users.find(user => user.email === assessed);
            if (assessors.indexOf(assessedUserProfile.email) < 0) {
                assessors.push(assessedUserProfile.email);
            }
            const userAssessment: Assessment = {
                assessed: assessedUserProfile.email,
                assessors: assessors,
                finishedAssessors: {},
                // chapterLeader: assessedUserProfile.chapterLeader, // TODO: na czas testów wyniki dostaje autor ankiety!
                chapterLeader: userId, // TODO: na czas testów wyniki dostaje autor ankiety!
                deadline: new Date().getTime() + 1000 * 60 * 60 * 24 * 30,
                author: userId,
                createdAt: new Date().getTime(),
                user: {
                    name: assessedUserProfile.display_name,
                    projects: assessedUserProfile.projects,
                    teams: assessedUserProfile.teams,
                    seniority: AssessmentUserSeniorityOfString(assessedUserProfile.seniority),
                    textForm: assessedUserProfile.textForm === 'm' ? 'm' : 'f'
                },
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
        [assessed, assessors, navigate, teamId, userId, users]
    );

    return <OneColumnLayoutWide>
        <Card>
            {!users && <CardContent>
                Loading...
            </CardContent>}
            {users && <CardContent>
                {errors?.length > 0 && <div style={{marginBottom: '16px'}}>
                    {errors.map(error => <div style={{color: '#b31536'}} key={error}>{error}</div>)}
                </div>}
                <FormControl fullWidth sx={{marginBottom: '16px'}}>
                    <InputLabel>Oceniany</InputLabel>
                    <SelectFromDomain
                        disabled={locekd}
                        value={assessed}
                        multiple={false}
                        label="Oceniany"
                        domain={selectDomain}
                        onChange={selected => setAssessed(selected[0])}
                    />
                </FormControl>
                <FormControl fullWidth sx={{marginBottom: '16px'}}>
                    <InputLabel>Lista oceniających</InputLabel>
                    <SelectFromDomain
                        disabled={locekd}
                        value={assessors}
                        label="Lista oceniających"
                        domain={selectDomain}
                        onChange={setAssessors}
                    />
                </FormControl>
                {locekd && <span>Tworzenie ankiety oceny...</span>}
                {!locekd && <Button onClick={validateAndSubmit}>Stwórz</Button>}
            </CardContent>}
        </Card>
    </OneColumnLayoutWide>;
}

const connector = connect(
    (state: AppState) => ({
        userId: state.authentication?.email,
        teamId: state.team?.current?.id
    }),
    {}
);

export const AssessmentCreate = connector(AssessmentCreateView);
