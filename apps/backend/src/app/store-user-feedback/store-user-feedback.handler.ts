import fetch from 'node-fetch';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { PendingFeedbackMessage } from '../pending-feedback-message';
import { SlackUserProfile } from '../slack/slack-user-profile';
import { userList } from '../slack/fetch-user-list';
import { SlackUser } from '../slack/slack-user';
import type { GlobalOptions } from 'firebase-functions/v2';

function now() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string }, channel: string, message: string) {
    await fetch(`https://slack.com/api/chat.postMessage`, {
        method: 'POST',
        headers: slackHttpHeaders,
        body: JSON.stringify({
            channel: channel,
            text: message
        })
    });
}

function message(forUser: SlackUserProfile, fromUser: SlackUserProfile, payload: PendingFeedbackMessage) {
    return {
        date: now(),
        for: forUser.email,
        forName: forUser.display_name || forUser.real_name || forUser.email || payload.mention,
        forSlack: payload.mention,
        from: fromUser.email,
        fromName: fromUser.display_name || fromUser.real_name || fromUser.email || payload.user,
        fromSlack: payload.user,
        message: payload.feedback,
        type: 'personal'
    };
}

function failedToDeliverCollection(firebase: typeof import('firebase-admin'), team) {
    return firebase.firestore().collection(`team/${team}/inbox/failed-to-deliver/message`);
}

async function failedToSendFeedback(firebase: typeof import('firebase-admin'), headers, payload: PendingFeedbackMessage, error: string, message: string) {
    return Promise.all([
        sendSlackMessage(headers, `@${payload.user}`, message),
        failedToDeliverCollection(firebase, payload.team).add({
            msg: error, date: now(), payload
        })
    ]);
}

export const storeUserFeedbackFactory = (
    config: Record<string, any>,
    firebase: typeof import('firebase-admin'),
    topic: string,
    options: GlobalOptions) => {
    const slackHttpHeaders = {
        Authorization: `Bearer ${config.slack.bottoken}`,
        'Content-type': 'application/json'
    };
    return onMessagePublished({topic, ...options},
        async (event) => {
            console.log('Sending feedback after pubsub event');

            const usersIndex = await userList(config.slack.bottoken);
            const payload: PendingFeedbackMessage = JSON.parse(Buffer.from(event.data.message.data, 'base64').toString());

            console.log(`Feedback to store [fromUser=${payload.user}, toUser=${payload.mention}]`);

            const fromSlackUser: SlackUser = usersIndex[payload.user];
            const forSlackUser = usersIndex[payload.mention];

            if (!fromSlackUser) {
                await failedToSendFeedback(
                    firebase,
                    slackHttpHeaders,
                    payload,
                    `Can't find user`,
                    `Can't send feedback due to missing author profile (${payload.user}).`
                );
                console.error(`Can't send feedback due to missing author profile (${payload.user}).`)
                return;
            }
            if (!forSlackUser) {
                await failedToSendFeedback(
                    firebase,
                    slackHttpHeaders,
                    payload,
                    `Can't find user`,
                    `User mentioned in feedback (${payload.mention}) not found.`
                );
                console.error(`User mentioned in feedback (${payload.mention}) not found.`)
                return;
            }

            const firestore = firebase.firestore();
            const userCollection = firestore.collection(`team/${payload.team}/user/`);

            const fromUser = (await userCollection.where('slackMemberId', '==', fromSlackUser.id).limit(1).get()).docs[0]?.data();
            if (!fromUser) {
                await failedToSendFeedback(
                    firebase,
                    slackHttpHeaders,
                    payload,
                    `Can't find user matching slack member`,
                    `User mentioned in feedback (${payload.mention}) not found by slack member id.`
                )
                console.error(`User not found by slack id [type=fromUser, slackMemberId=${fromSlackUser.id}]`);
                return;
            }

            const forUser = (await userCollection.where('slackMemberId', '==', forSlackUser.id).limit(1).get()).docs[0]?.data();
            if (!forUser) {
                await failedToSendFeedback(
                    firebase,
                    slackHttpHeaders,
                    payload,
                    `Can't find user matching slack member`,
                    `User mentioned in feedback (${payload.mention}) not found by slack member id.`
                )
                console.error(`User not found by slack id [type=forUser, slackMemberId=${forSlackUser.id}]`);
                return;
            }

            if (forUser.chapterLeader !== undefined) {
                await firestore.runTransaction(async trn => {
                    const inboxDoc = firestore.collection(`team/${payload.team}/user/${forUser.chapterLeader}/inbox`).doc();
                    const sentDoc = firestore.collection(`team/${payload.team}/user/${fromUser.email}/sent`).doc(inboxDoc.id);

                    const inboxLegacyDoc = firestore.collection(`team/${payload.team}/inbox/${forUser.chapterLeader}/message`).doc(inboxDoc.id);
                    const sentLegacyDoc = firestore.collection(`team/${payload.team}/sent/${fromUser.email}/message`).doc(inboxDoc.id);

                    trn.set(inboxLegacyDoc, message(forSlackUser.profile, fromSlackUser.profile, payload));
                    trn.set(sentLegacyDoc, message(forSlackUser.profile, fromSlackUser.profile, payload));

                    trn.set(inboxDoc, message(forSlackUser.profile, fromSlackUser.profile, payload));
                    trn.set(sentDoc, message(forSlackUser.profile, fromSlackUser.profile, payload));
                });
            } else {
                await failedToSendFeedback(
                    firebase,
                    slackHttpHeaders,
                    payload,
                    `Can't find user chapter leader`,
                    `User mentioned in feedback (${payload.mention}) has no chapter leader.`
                );
                console.error(`User mentioned in feedback (${payload.mention}) has no chapter leader.`)
                return;
            }
        }
    );
};
