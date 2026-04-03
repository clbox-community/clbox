import {AppState} from "../../../state/app-state";
import {connect, ConnectedProps} from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import {useUserAssessments} from "../state/use-user-assessments";
import React from "react";

const AssessmentsArchiveView = ({teamId, userId}: ViewProps) => {
    const assessments = useUserAssessments(teamId, userId);
    return <Card>
        <CardHeader title="Archiwalne ankiety"/>
        <CardContent>
            ...
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

export const AssessmentsArchive = connector(AssessmentsArchiveView);
