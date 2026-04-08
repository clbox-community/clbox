import {PendingFeedbackMessage} from '../pending-feedback-message';
import {SlackUserProfile} from '../slack/slack-user-profile';
import {userList} from "../slack/fetch-user-list";
import {sendSlackMessage} from "../slack/send-slack-message";
import {SlackUser} from '../slack/slack-user';
import {onMessagePublished} from 'firebase-functions/v2/pubsub';
import type {GlobalOptions} from 'firebase-functions/v2';

function now() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function asMessage(channel, fromUser: SlackUserProfile, payload: PendingFeedbackMessage) {
    return {
        date: now(),
        for: payload.mention,
        forName: channel.short_name,
        forSlack: payload.mention,
        from: fromUser.email,
        fromName: fromUser.display_name,
        fromSlack: payload.user,
        message: payload.feedback,
        type: 'channel'
    };
}

export const storeChannelFeedbackHandlerFactory = (
    config: Record<string, any>,
    firebase: typeof import('firebase-admin'),
    topic: string,
    options: GlobalOptions) => {
    return onMessagePublished({topic, ...options}, async (event) => {
        const usersIndex = await userList(config.slack.bottoken);
        const payload: PendingFeedbackMessage = JSON.parse(Buffer.from(event.data.message.data, 'base64').toString());

        const fromSlackUser: SlackUser = usersIndex[payload.user];
        const firestore = firebase.firestore();
        if (!fromSlackUser) {
            await firestore.collection(`team/${payload.team}/channel/failed-to-deliver/inbox`).add({
                msg: `Can't find slack user for feedback author`, date: now(), payload
            });
            console.error(`Can't find slack user for feedback author (${payload.user}).`);
            return;
        }

        const fromUser = (await firestore.collection(`team/${payload.team}/user/`).where('slackMemberId', '==', fromSlackUser.id).limit(1).get()).docs[0]?.data();
        if (!fromUser) {
            await firestore.collection(`team/${payload.team}/channel/failed-to-deliver/inbox`).add({
                msg: `Can't find user matching slack member for feedback author`, date: now(), payload
            });
            console.error(`User not found by slack id [slackMemberId=${fromSlackUser.id}]`);
            return;
        }

        const channel = await firestore.collection(`team/${payload.team}/channel`)
            .doc(payload.mention)
            .get();

        if (channel.exists) {
            await firestore.runTransaction(async trn => {
                const channelInboxDoc = firestore.collection(`team/${payload.team}/channel/${payload.mention}/inbox`).doc();
                const sentDoc = firestore.collection(`team/${payload.team}/user/${fromUser.email}/sent`).doc(channelInboxDoc.id);
                const userInboxDocs = channel.data()
                    .managers
                    .map(
                        email => firestore
                            .collection(`team/${payload.team}/user/${email}/inbox`)
                            .doc(channelInboxDoc.id)
                    );

                const message = asMessage(channel.data(), fromSlackUser.profile, payload);
                userInboxDocs.forEach(doc => trn.set(doc, message));
                trn.set(channelInboxDoc, message);
                trn.set(sentDoc, message);
            })
        } else {
            await Promise.all([
                firestore.collection(`team/${payload.team}/channel/failed-to-deliver/inbox`).add({
                    msg: `Can't find channel for feedback`, date: now(), payload
                }),
                sendSlackMessage(config.slack.bottoken, {
                    channel: `@${payload.user}`,
                    text: `Channel mentioned in feedback (${payload.mention}) not found.`
                })
            ]);
        }
    });
}
