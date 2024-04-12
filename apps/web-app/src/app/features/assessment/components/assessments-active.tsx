import { AppState } from '../../../state/app-state';
import { connect, ConnectedProps } from 'react-redux';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React, { useCallback } from 'react';
import { useChapterLeaderActiveAssessments } from '../state/use-chapter-leader-active-assessments';
import DownloadingIcon from '@mui/icons-material/Downloading';
import { asLocalDate } from './as-local-date';
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAssessmentArchive } from '../state/use-archive-assessment';

const AsessmentRow = styled.tr`
    :hover {
        background-color: #f6f6f6;
        outline: 1px solid #f1f1f1;
    }
`;

const AssessmentHeaderCell = styled.th`
    text-align: left;
`;

const AssessmentRowCell = styled.td`
    vertical-align: top;
`;

const AssessmentAssessesList = styled.ul`
    margin: 0;
    padding: 0;
`;

const AssessmentAssessesListItem = styled.li`
    display: flex;
`;

const today = new Date().getTime();

const AssessmentsActiveView = ({ teamId, userId }: ViewProps) => {
    const navigate = useNavigate();
    const assessments = useChapterLeaderActiveAssessments(teamId, userId);
    const archiveAssessment = useAssessmentArchive(teamId);

    const navigateToResult = useCallback(
        (id: string) => navigate(`${id}/result`),
        [navigate]
    );

    return <Card>
        <CardHeader title="Aktywne ankiety" />
        <CardContent>
            {assessments === undefined &&
                <div style={{ textAlign: 'center' }}><DownloadingIcon style={{ fontSize: '60px' }} color="info" /></div>}
            {assessments?.length === 0 &&
                <div>Nie masz żadnych aktywnych ankiet :)</div>}
            {assessments?.length > 0 && <table style={{ width: '100%' }}>
                <thead>
                <tr>
                    <AssessmentHeaderCell>Oceniany</AssessmentHeaderCell>
                    <AssessmentHeaderCell>Utworzona</AssessmentHeaderCell>
                    <AssessmentHeaderCell>Deadline</AssessmentHeaderCell>
                    <AssessmentHeaderCell>Oceniający</AssessmentHeaderCell>
                    <AssessmentHeaderCell></AssessmentHeaderCell>
                    <AssessmentHeaderCell></AssessmentHeaderCell>
                </tr>
                </thead>
                <tbody>
                {assessments?.map(
                    assessment => <AsessmentRow key={assessment.id}>
                        <AssessmentRowCell style={{ cursor: 'pointer' }} onClick={() => navigateToResult(assessment.id)}>{assessment.assessed}</AssessmentRowCell>
                        <AssessmentRowCell>{asLocalDate(assessment.createdAt)}</AssessmentRowCell>
                        <AssessmentRowCell>{asLocalDate(assessment.deadline)}</AssessmentRowCell>
                        <AssessmentRowCell>
                            <AssessmentAssessesList>
                                {assessment.assessors?.map((assessor) => <AssessmentAssessesListItem key={assessor}>
                                    {assessor}&nbsp;{assessment.finishedAssessors?.[assessor.replaceAll('.', '_')] ? <CheckIcon fontSize="small" color="success" /> :
                                    <CloseIcon fontSize="small" color="warning" />}
                                </AssessmentAssessesListItem>)}
                            </AssessmentAssessesList>
                        </AssessmentRowCell>
                        <AssessmentRowCell style={{ textAlign: 'center' }}>
                            {assessment.deadline <= today && <WarningIcon color="error" />}
                        </AssessmentRowCell>
                        <AssessmentRowCell style={{ textAlign: 'center' }}>
                            {assessment.chapterLeader === userId && <DeleteForeverIcon
                                onClick={() => archiveAssessment(assessment.id)}
                                sx={{ cursor: 'pointer', color: 'lightgray', '&:hover': { color: 'rgb(211, 47, 47)' } }}
                            />}
                        </AssessmentRowCell>
                    </AsessmentRow>
                )}
                </tbody>
            </table>}
            <Button size="medium" color="primary" component={Link} to={'new'}>Stwórz ankietę</Button>
        </CardContent>
    </Card>;
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

export const AssessmentsActive = connector(AssessmentsActiveView);
