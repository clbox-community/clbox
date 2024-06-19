import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';

export const notificationAfterSurveyCreatedFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>
) => functions.firestore.document('team/{team}/survey/{survey}').onCreate(
    async (change, context) => {
        const survey = change.data();
        const slackToken = config.slack.bottoken;
        if (slackToken) {
            console.log(`User survey created [user=${survey.forUser}, survey=${change.id}]`);
            const slackUser = await userProfile(survey.forUser, slackToken);
            const notification = {
                channel: `@${slackUser.name}`,
                text: `You have new survey to fill: ${config.webapp.url}s/${context.params.team}/${change.id}.`
            };

            console.log(`Sending user survey notification [${JSON.stringify(notification)}]`);
            await sendSlackMessage(slackToken, notification);
        } else {
            console.warn('Notification skipped due to missing slack configuration');
        }
    }
);
