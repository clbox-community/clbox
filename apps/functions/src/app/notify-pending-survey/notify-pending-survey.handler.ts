import {Survey} from "../../../../web-app/src/app/features/survey/model/survey";

type SurveyWithId = Survey & { id: string };

export const notifyPendingSurveyHandler = async (firebase: typeof import('firebase-admin'), config: Record<string, any>) => {
    const firestore = firebase.firestore();

    const thresholdDate = new Date();
    // thresholdDate.setDate(thresholdDate.getDate() - 2);

    const teams = await firestore.collection(`team`).get();
    for (const team of teams.docs) {
        const surveys = await team.ref.collection('survey').get();
        const byUser = surveys.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SurveyWithId))
            .filter(survey => survey.createdTimestamp <= thresholdDate.getTime())
            .filter(survey => survey.forUser)
            .reduce((result, survey) => ({
                ...result,
                [survey.forUser]: [...(result[survey.forUser] ?? []), survey]
            }), {});

        for (const user of Object.keys(byUser)) {
            if (user !== 'glipecki@consdata.com') {
                continue;
            }

            try {
                // const slackUser = await userProfile(user, config.slack.bottoken);
                const slackUser = {name: 'Test#' + user};

                const notificationText = `Czekają na Ciebie ankiety: ${
                    byUser[user].map(survey => `${config.webapp.url}s/${team.id}/${survey.id}`).join(', ')
                }`;
                const notification = {
                    channel: `@${slackUser.name}`,
                    text: notificationText
                };

                console.log(`Sending user survey notification [${JSON.stringify(notification)}]`);
                // await sendSlackMessage(config.slack.bottoken, notification);
            } catch (error) {
                console.log(`Can't create notification for pending user surveys [team=${team.id}, user=${user}, error=${error}]`);
            }
        }
    }
}
