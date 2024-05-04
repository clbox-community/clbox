import {PubSub} from '@google-cloud/pubsub';
import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FunctionBuilder} from 'firebase-functions';
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
    userAssessmentsCreateHandlerFactory
} from "./app/user-assessments-create/user-assessments-create-handler.factory";
import {exportTechSkillsFactory} from "./app/export-tech-skills/export-tech-skills.factory";
import { userAssessmentsFinishHandlerFactory } from './app/user-assessments-finish/user-assessments-finish-handler.factory';

firebase.initializeApp();

const region = functions.region('europe-west3');
const functionBuilder: () => FunctionBuilder = () => region
    .runWith({
        maxInstances: 3,
        memory: '256MB'
    });

export const storeUserFeedback = storeUserFeedbackFactory(functionBuilder(), functions.config(), firebase, 'pending-user-feedbacks');
export const storeChannelFeedback = storeChannelFeedbackHandlerFactory(functionBuilder(), functions.config(), firebase, 'pending-channel-feedbacks');
export const notifyAfterUserFeedback = notifyAfterUserFeedbackFactory(functionBuilder(), functions.config());
export const notifyAfterChannelFeedback = notifyAfterChannelFeedbackFactory(functionBuilder(), functions.config(), firebase);
export const notifyAfterLeaderChange = notificationAfterLeaderChangeFactory(functionBuilder(), functions.config());
export const notifyAfterSurveyCreated = notificationAfterSurveyCreatedFactory(functionBuilder(), functions.config());
export const feedbackStats = feedbackStatsFactory(functionBuilder(), firebase);
export const userFeedbackStats = userFeedbackStatsFactory(functionBuilder(), firebase);
export const createUser = createUserFactory(functionBuilder(), firebase);
export const expireUserAccounts = expireUserAccountsFactory(functionBuilder(), firebase);
export const getChapterStats = getChapterStatsFactory(functionBuilder(), firebase);
// export const getTeamSkills = getTeamSkillsFactory(functionBuilder(), firebase);
export const updateFilterStatsAfterInboxCreate = updateFilterStatsAfterInboxCreateFactory(functionBuilder(), functions.config(), firebase);
export const updateFilterStatsAfterInboxChange = updateFilterStatsAfterInboxChangeFactory(functionBuilder(), functions.config(), firebase);
export const updateFilterStatsAfterInboxDelete = updateFilterStatsAfterInboxDeleteFactory(functionBuilder(), functions.config(), firebase);
export const updateCampaignAfterSurvey = updateCampaignAfterSurveyFactory(functionBuilder(), firebase);
export const kudosHandler = kudosHandlerFactory(
    functionBuilder().runWith({memory: '512MB', maxInstances: 5, }),
    functions.config(),
    new PubSub(),
    'pending-user-feedbacks',
    'pending-channel-feedbacks'
);
export const userAssessmentsCreateHandler = userAssessmentsCreateHandlerFactory(
    functionBuilder().runWith({}),
    firebase
);
export const userAssessmentsFinishHandler = userAssessmentsFinishHandlerFactory(
    functionBuilder().runWith({}),
    firebase
);
export const exportTechSkillsCron = exportTechSkillsFactory(
    functionBuilder().runWith({}),
    functions.config(),
    firebase
);
