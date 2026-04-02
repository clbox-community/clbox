import {PubSub} from '@google-cloud/pubsub';
import * as firebase from 'firebase-admin';
import {GlobalOptions, setGlobalOptions} from 'firebase-functions/v2';
import {createUserFactory} from './app/create-user/create-user.handler';
import {expireUserAccountsFactory} from './app/expire-user-accounts/expire-user-accounts-factory';
import {feedbackStatsFactory} from './app/feedback-stats/feedback-stats-factory';
import {getChapterStatsFactory} from './app/get-chapter-stats/get-chapter-stats-factory';
import {kudosHandlerFactory} from './app/kudos/kudos.handler';
import {
    notificationAfterLeaderChangeFactory
} from './app/notification-after-leader-change/notification-after-leader-change-factory';
import {
    notificationAfterSurveyCreatedFactory
} from './app/notification-after-survey-created/notification-after-survey-created-factory';
import {
    notifyAfterChannelFeedbackFactory
} from "./app/notify-after-channel-feedback/notify-after-channel-feedback.handler";
import {notifyAfterUserFeedbackFactory} from './app/notify-after-user-feedback/notify-after-user-feedback.handler';
import {storeChannelFeedbackHandlerFactory} from "./app/store-channel-feedback/store-channel-feedback.handler";
import {storeUserFeedbackFactory} from './app/store-user-feedback/store-user-feedback.handler';
import {
    updateCampaignAfterSurveyFactory
} from './app/update-campaign-after-survey/update-campaign-after-survey-factory';
import {
    updateFilterStatsAfterInboxChangeFactory
} from "./app/update-filter-stats/update-filter-stats-after-inbox-change";
import {
    updateFilterStatsAfterInboxCreateFactory
} from "./app/update-filter-stats/update-filter-stats-after-inbox-create";
import {
    updateFilterStatsAfterInboxDeleteFactory
} from "./app/update-filter-stats/update-filter-stats-after-inbox-delete";
import {userFeedbackStatsFactory} from './app/user-feedback-stats/user-feedback-stats-factory';
import {
    userAssessmentsWriteHandlerFactory
} from "./app/user-assessments-create/user-assessments-write-handler.factory";
import {exportTechSkillsFactory} from "./app/export-tech-skills/export-tech-skills.factory";
import { userAssessmentsFinishHandlerFactory } from './app/user-assessments-finish/user-assessments-finish-handler.factory';
import { updatePublicProfileHandlerFactory } from './app/public-profile/update-public-profile-handler.factory';
import { aggregateSkillRoadmapStatsHandlerFactory } from './app/aggregate-skill-roadmap-stats/aggregate-skill-roadmap-stats-handler.factory';

firebase.initializeApp();

const defaultOptions: GlobalOptions = {
    region: 'europe-west3',
    memory: '256MiB',
    maxInstances: 1,
};

setGlobalOptions(defaultOptions);

const config = {
    slack: {
        bottoken: process.env.SLACK_BOTTOKEN ?? '',
        signingsecret: process.env.SLACK_SIGNINGSECRET ?? '',
    },
    webapp: {
        url: process.env.WEBAPP_URL ?? '',
    },
};

const missingEnvVars = ['SLACK_BOTTOKEN', 'SLACK_SIGNINGSECRET', 'WEBAPP_URL'].filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
    console.warn(`Missing environment variables: ${missingEnvVars.join(', ')}. Some functions may not work correctly.`);
}

export const storeUserFeedback = storeUserFeedbackFactory(config, firebase, 'pending-user-feedbacks');
export const storeChannelFeedback = storeChannelFeedbackHandlerFactory(config, firebase, 'pending-channel-feedbacks');
export const notifyAfterUserFeedback = notifyAfterUserFeedbackFactory(config);
export const notifyAfterChannelFeedback = notifyAfterChannelFeedbackFactory(config, firebase);
export const notifyAfterLeaderChange = notificationAfterLeaderChangeFactory(config);
export const notifyAfterSurveyCreated = notificationAfterSurveyCreatedFactory(config);
export const feedbackStats = feedbackStatsFactory(firebase);
export const userFeedbackStats = userFeedbackStatsFactory(firebase);
export const createUser = createUserFactory(firebase);
export const expireUserAccounts = expireUserAccountsFactory(firebase, defaultOptions);
export const getChapterStats = getChapterStatsFactory(firebase);
export const updateFilterStatsAfterInboxCreate = updateFilterStatsAfterInboxCreateFactory(config, firebase);
export const updateFilterStatsAfterInboxChange = updateFilterStatsAfterInboxChangeFactory(config, firebase);
export const updateFilterStatsAfterInboxDelete = updateFilterStatsAfterInboxDeleteFactory(config, firebase);
export const updateCampaignAfterSurvey = updateCampaignAfterSurveyFactory(firebase);
export const kudosHandler = kudosHandlerFactory(
    config,
    defaultOptions,
    new PubSub(),
    'pending-user-feedbacks',
    'pending-channel-feedbacks'
);
export const userAssessmentsWriteHandler = userAssessmentsWriteHandlerFactory(firebase);
export const userAssessmentsFinishHandler = userAssessmentsFinishHandlerFactory(firebase);
export const exportTechSkillsCron = exportTechSkillsFactory(config, firebase, defaultOptions);
export const updatePublicProfileHandler = updatePublicProfileHandlerFactory(firebase);
export const aggregateSkillRoadmapStatsHandler = aggregateSkillRoadmapStatsHandlerFactory(firebase);
