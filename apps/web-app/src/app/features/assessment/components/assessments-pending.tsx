import {AppState} from "../../../state/app-state";
import {connect, ConnectedProps} from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import {useUserAssessments} from "../state/use-user-assessments";
import DownloadingIcon from "@mui/icons-material/Downloading";
import React from "react";
import {Link} from "react-router-dom";
import {asLocalDate} from "./as-local-date";

const AssessmentsPendingView = ({teamId, userId}: ViewProps) => {
    const assessments = useUserAssessments(teamId, userId);
    return <Card>
        <CardHeader title="Ankiety czekające na wypełnienie"/>
        <CardContent>
            {assessments === undefined &&
                <div style={{textAlign: 'center'}}><DownloadingIcon style={{fontSize: '60px'}} color="info"/></div>}
            {assessments?.filter(assessment => !assessment.finished).length === 0 &&
                <div>Nie masz żadnych oczekujących ankiet :)</div>}
            <ul>
                {assessments?.filter(assessment => !assessment.finished).map(
                    assessment => <li key={assessment.id}>
                        <Link to={`/assessment/${assessment.assessmentId}/${assessment.userAssessmentId}/${assessment.id}`}>
                            Ocena okresowa dla {assessment.assessedName}
                            {assessment.deadline && ` w terminie do ` + asLocalDate(assessment.deadline)}
                        </Link>
                    </li>
                )}
            </ul>
        </CardContent>
    </Card>;
}


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

export const AssessmentsPending = connector(AssessmentsPendingView);
