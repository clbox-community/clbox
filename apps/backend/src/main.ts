import {PubSub} from '@google-cloud/pubsub';
import * as firebase from 'firebase-admin';
import type {GlobalOptions} from 'firebase-functions/v2';
import {defineSecret} from 'firebase-functions/params';
import {createUserFactory} from './app/create-user/create-user.handler';
import {expireUserAccountsFactory} from './app/expire-user-accounts/expire-user-accounts-factory';
import {feedbackStatsFactory} from './app/feedback-stats/feedback-stats-factory';
import {getChapterStatsFactory} from './app/get-chapter-stats/get-chapter-stats-factory';
import {kudosHandlerFactory} from './app/kudos/kudos.handler';
import {
    notificationAfterLeaderChangeFactory
} from './app/notification-after-leader-change/notification-after-leader-change-factory';
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

const SLACK_BOTTOKEN = defineSecret('SLACK_BOTTOKEN');
const SLACK_SIGNINGSECRET = defineSecret('SLACK_SIGNINGSECRET');
const WEBAPP_URL = defineSecret('WEBAPP_URL');
const SKILLS_EXPORTKEY = defineSecret('SKILLS_EXPORTKEY');

const functionOptions: GlobalOptions = {
    region: 'europe-west3',
    maxInstances: 3,
    memory: '256MiB',
};

const slackFunctionOptions: GlobalOptions = {
    ...functionOptions,
    secrets: [SLACK_BOTTOKEN, SLACK_SIGNINGSECRET, WEBAPP_URL],
};

export const storeUserFeedback = storeUserFeedbackFactory(firebase, 'pending-user-feedbacks', slackFunctionOptions);
export const storeChannelFeedback = storeChannelFeedbackHandlerFactory(firebase, 'pending-channel-feedbacks', slackFunctionOptions);
export const notifyAfterUserFeedback = notifyAfterUserFeedbackFactory(firebase, slackFunctionOptions);
// export const notifyAfterChannelFeedback = notifyAfterChannelFeedbackFactory(functionBuilder(), config, firebase);
export const notifyAfterLeaderChange = notificationAfterLeaderChangeFactory(firebase, slackFunctionOptions);
// export const notifyAfterSurveyCreated = notificationAfterSurveyCreatedFactory(functionBuilder(), config);
export const feedbackStats = feedbackStatsFactory(firebase, functionOptions);
export const userFeedbackStats = userFeedbackStatsFactory(firebase, functionOptions);
export const createUser = createUserFactory(firebase, functionOptions);
export const expireUserAccounts = expireUserAccountsFactory(firebase, functionOptions);
export const getChapterStats = getChapterStatsFactory(firebase, functionOptions);
export const updateFilterStatsAfterInboxCreate = updateFilterStatsAfterInboxCreateFactory(firebase, functionOptions);
export const updateFilterStatsAfterInboxChange = updateFilterStatsAfterInboxChangeFactory(firebase, functionOptions);
export const updateFilterStatsAfterInboxDelete = updateFilterStatsAfterInboxDeleteFactory(firebase, functionOptions);
export const updateCampaignAfterSurvey = updateCampaignAfterSurveyFactory(firebase, functionOptions);
export const kudosHandler = kudosHandlerFactory(
    new PubSub(),
    'pending-user-feedbacks',
    'pending-channel-feedbacks',
    {...slackFunctionOptions, memory: '512MiB', maxInstances: 5}
);
export const userAssessmentsWriteHandler = userAssessmentsWriteHandlerFactory(
    firebase,
    functionOptions
);
export const userAssessmentsFinishHandler = userAssessmentsFinishHandlerFactory(
    firebase,
    functionOptions
);
export const exportTechSkillsCron = exportTechSkillsFactory(
    firebase,
    {...functionOptions, secrets: [SKILLS_EXPORTKEY]}
);
export const updatePublicProfileHandler = updatePublicProfileHandlerFactory(
    firebase,
    functionOptions
)
export const aggregateSkillRoadmapStatsHandler = aggregateSkillRoadmapStatsHandlerFactory(
    firebase,
    functionOptions
)
