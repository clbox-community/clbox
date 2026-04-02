import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

export const notifyAfterUserFeedbackFactory = (
    config: Record<string, any>
) => onDocumentCreated('team/{team}/inbox/{chapterLeader}/message/{messageId}',
    async (event) => {
        const message = event.data.data();
        const slackToken = config.slack.bottoken;
        if (slackToken) {
            const slackUser = await userProfile(event.params.chapterLeader, slackToken);
            await sendSlackMessage(slackToken, {
                channel: `@${slackUser.name}`,
                text: `You have new feedback!`,
                attachments: [
                    {
                        color: `#36a64f`,
                        author_name: message.fromName,
                        title: `Feedback for ${message.forName}`,
                        text: message.message,
                        title_link: config.webapp.url,
                        fallback: `${message.forName}: ${message.message}\nby ${message.fromName}`
                    }
                ]
            });
        } else {
            console.warn('Notification skipped due to missing slack configuration');
        }
    }
);
