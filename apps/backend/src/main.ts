import {PubSub} from '@google-cloud/pubsub';
import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions/v1';
import type {GlobalOptions} from 'firebase-functions/v2';

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

const region = functions.region('europe-west3');
const slackFunctionBuilder: () => functions.FunctionBuilder = () => region
    .runWith({
        maxInstances: 3,
        memory: '256MB',
        secrets: ['SLACK_BOTTOKEN', 'SLACK_SIGNINGSECRET', 'WEBAPP_URL'],
    });

const v2Options: GlobalOptions = {
    region: 'europe-west3',
    maxInstances: 3,
    memory: '256MB',
};

const config = {
    slack: {
        bottoken: process.env.SLACK_BOTTOKEN ?? '',
        signingsecret: process.env.SLACK_SIGNINGSECRET ?? '',
    },
    webapp: {
        url: process.env.WEBAPP_URL ?? '',
    },
};


export const storeUserFeedback = storeUserFeedbackFactory(config, firebase, 'pending-user-feedbacks');
export const storeChannelFeedback = storeChannelFeedbackHandlerFactory(slackFunctionBuilder(), config, firebase, 'pending-channel-feedbacks');
export const notifyAfterUserFeedback = notifyAfterUserFeedbackFactory(slackFunctionBuilder(), config, firebase);
// export const notifyAfterChannelFeedback = notifyAfterChannelFeedbackFactory(functionBuilder(), config, firebase);
export const notifyAfterLeaderChange = notificationAfterLeaderChangeFactory(slackFunctionBuilder(), config, firebase);
// export const notifyAfterSurveyCreated = notificationAfterSurveyCreatedFactory(functionBuilder(), config);
export const feedbackStats = feedbackStatsFactory(firebase);
export const userFeedbackStats = userFeedbackStatsFactory(firebase);
export const createUser = createUserFactory(firebase);
export const expireUserAccounts = expireUserAccountsFactory(firebase, v2Options);
export const getChapterStats = getChapterStatsFactory(firebase);
export const updateFilterStatsAfterInboxCreate = updateFilterStatsAfterInboxCreateFactory(config, firebase);
export const updateFilterStatsAfterInboxChange = updateFilterStatsAfterInboxChangeFactory(config, firebase);
export const updateFilterStatsAfterInboxDelete = updateFilterStatsAfterInboxDeleteFactory(config, firebase);
export const updateCampaignAfterSurvey = updateCampaignAfterSurveyFactory(firebase);
export const kudosHandler = kudosHandlerFactory(
    slackFunctionBuilder().runWith({memory: '512MB', maxInstances: 5, }),
    config,
    new PubSub(),
    'pending-user-feedbacks',
    'pending-channel-feedbacks'
);
export const userAssessmentsWriteHandler = userAssessmentsWriteHandlerFactory(
    firebase
);
export const userAssessmentsFinishHandler = userAssessmentsFinishHandlerFactory(
    firebase
);
export const exportTechSkillsCron = exportTechSkillsFactory(
    {...config, skills: {exportkey: process.env.SKILLS_EXPORTKEY ?? ''}},
    firebase,
    {...v2Options, secrets: ['SKILLS_EXPORTKEY']}
);
export const updatePublicProfileHandler = updatePublicProfileHandlerFactory(
    firebase
)
export const aggregateSkillRoadmapStatsHandler = aggregateSkillRoadmapStatsHandlerFactory(
    firebase
)
