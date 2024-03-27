import {userProfile} from '../slack/fetch-user-profile';
import {sendSlackMessage} from '../slack/send-slack-message';

export const notificationAfterSurveyCreatedFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>
) => functions.firestore.document('team/{team}/survey/{survey}').onCreate(
    async (change, context) => {
        const survey = change.data();
        console.log(`User survey created [user=${survey.forUser}, survey=${change.id}]`);

        const slackUser = await userProfile(survey.forUser, config.slack.bottoken);
        const notification = {
            channel: `@${slackUser.name}`,
            text: `You have new survey to fill: ${config.webapp.url}s/${context.params.team}/${change.id}.`
        };

        console.log(`Sending user survey notification [${JSON.stringify(notification)}]`);
        await sendSlackMessage(config.slack.bottoken, notification);
    }
)
