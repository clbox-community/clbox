import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';

export const notifyAfterUserFeedbackFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>
) => functions.firestore.document('team/{team}/inbox/{chapterLeader}/message/{messageId}').onCreate(
    async (change, context) => {
        const message = change.data();
        const slackToken = config.slack.bottoken;
        if (slackToken) {
            const slackUser = await userProfile(context.params.chapterLeader, slackToken);
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
