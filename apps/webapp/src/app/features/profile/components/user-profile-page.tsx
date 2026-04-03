import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {OneColumnLayout} from "../../layout/one-column-layout";
import {ProfileView} from "./profile-view";
import {useParams} from "react-router";
import {useUserProfile} from "../../user/firestore/use-user-profile";

export const UserProfilePageView = ({teamId}: ConnectedProps<typeof connector>) => {
    const {userId} = useParams<{userId: string}>();
    const user = useUserProfile(teamId, userId);
    if (!user) {
        return <OneColumnLayout>
            ...
        </OneColumnLayout>;
    }
    return <ProfileView profile={user}/>;
}

const connector = connect(
    (state: AppState) => ({
        teamId: state?.team?.current?.id
    }),
    {}
);

export const UserProfilePage = connector(UserProfilePageView);
