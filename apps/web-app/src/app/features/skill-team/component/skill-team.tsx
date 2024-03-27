import {firebaseApp} from "../../firebase/firebase.app";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";

export const SkillTeamView = ({teamId}: ViewProps) => {
    firebaseApp.functions('europe-west3').httpsCallable('getTeamSkills')({
        team: teamId
    }).then(result => {
        console.log(result.data);
    });
    return <div>team skills</div>;
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

export const SkillTeam = connector(SkillTeamView);
