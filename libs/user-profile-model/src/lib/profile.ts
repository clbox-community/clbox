export interface Profile {
    channelManager: string[];
    channelManagerMap: { [channel: string]: boolean };
    chapter: string;
    chapterName: string;
    seniority: string;
    chapterLeader: string;
    display_name: string;
    email: string;
    expireDate: string;
    leader: boolean;
    leaderOf: string[];
    leaderOfMap: { [chapter: string]: boolean };
    username: string;
    withExpire: boolean;
    teams: string[];
    projects: string[];
    textForm: 'm' | 'f';
    locale: Intl.UnicodeBCP47LocaleIdentifier;
    roles: string[];
}
