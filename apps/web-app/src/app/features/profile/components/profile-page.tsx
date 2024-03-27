import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {OneColumnLayout} from "../../layout/one-column-layout";
import {ProfileView} from "./profile-view";

export const ProfilePageView = ({profile}: ConnectedProps<typeof connector>) => {
    if (!profile) {
        return <OneColumnLayout>
            ...
        </OneColumnLayout>;
    }
    return <ProfileView profile={profile}/>;
}

const connector = connect(
    (state: AppState) => ({
        profile: state?.profile.profile
    }),
    {}
);

export const ProfilePage = connector(ProfilePageView);
