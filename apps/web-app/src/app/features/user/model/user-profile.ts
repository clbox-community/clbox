import {Profile} from "../../profile/state/profile";

export type UserProfile = Pick<
    Profile,
    'chapter'
    | 'leader'
    | 'leaderOf'
    | 'chapterLeader'
    | 'display_name'
    | 'email'
    | 'teams'
    | 'projects'
    | 'seniority'
    | 'textForm'
>;
