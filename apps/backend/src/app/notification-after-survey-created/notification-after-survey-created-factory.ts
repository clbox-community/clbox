import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

export const notificationAfterSurveyCreatedFactory = (
    config: Record<string, any>
) => onDocumentCreated('team/{team}/survey/{survey}',
    async (event) => {
        const survey = event.data.data();
        const slackToken = config.slack.bottoken;
        if (slackToken) {
            console.log(`User survey created [user=${survey.forUser}, survey=${event.data.id}]`);
            const slackUser = await userProfile(survey.forUser, slackToken);
            const notification = {
                channel: `@${slackUser.name}`,
                text: `You have new survey to fill: ${config.webapp.url}s/${event.params.team}/${event.data.id}.`
            };

            console.log(`Sending user survey notification [${JSON.stringify(notification)}]`);
            await sendSlackMessage(slackToken, notification);
        } else {
            console.warn('Notification skipped due to missing slack configuration');
        }
    }
);
