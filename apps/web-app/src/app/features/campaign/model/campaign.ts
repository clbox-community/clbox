import {CampaignStatus} from './campaign-status';
import {CampaignSurvey} from './campaign-survey';

export interface Campaign {
    id: string;
    created: string;
    owners: string[];
    responsePrivacy: 'signed' | 'anonymous';
    surveyTemplate: CampaignSurvey;
    users: string[];
    details: {
        comment: string;
    };
    answers: {
        timestamp: number,
        date: string,
        survey: string
    }[];
    status: CampaignStatus;
}
