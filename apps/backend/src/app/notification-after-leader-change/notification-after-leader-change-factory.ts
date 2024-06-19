import { userProfile } from '../slack/fetch-user-profile';
import { sendSlackMessage } from '../slack/send-slack-message';

export const notificationAfterLeaderChangeFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>
) => functions.firestore.document('team/{team}/user/{user}').onUpdate(
    async (change, context) => {
        if (change.after.data().chapterLeader !== change.before.data().chapterLeader) {
            console.log(`Notify user after chapter leader change [user=${context.params.user}, newLeader=${change.after.data().chapterLeader}]`);
            const slackToken = config.slack.bottoken;
            if (slackToken) {
                const slackUser = await userProfile(context.params.user, slackToken);
                await sendSlackMessage(slackToken, {
                    channel: `@${slackUser.name}`,
                    text: `Your chapter leader was changed to ${change.after.data().chapterLeader}.`
                });
            } else {
                console.warn('Notification skipped due to missing slack configuration');
            }
        }
    }
);
