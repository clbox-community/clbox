import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';
import {onDocumentUpdated} from 'firebase-functions/v2/firestore';

export const notificationAfterLeaderChangeFactory = (
    config: Record<string, any>
) => onDocumentUpdated('team/{team}/user/{user}',
    async (event) => {
        if (event.data.after.data().chapterLeader !== event.data.before.data().chapterLeader) {
            console.log(`Notify user after chapter leader change [user=${event.params.user}, newLeader=${event.data.after.data().chapterLeader}]`);
            const slackToken = config.slack.bottoken;
            if (slackToken) {
                const slackUser = await userProfile(event.params.user, slackToken);
                await sendSlackMessage(slackToken, {
                    channel: `@${slackUser.name}`,
                    text: `Your chapter leader was changed to ${event.data.after.data().chapterLeader}.`
                });
            } else {
                console.warn('Notification skipped due to missing slack configuration');
            }
        }
    }
);
