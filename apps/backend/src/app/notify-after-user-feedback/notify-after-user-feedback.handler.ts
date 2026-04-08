import { sendSlackMessage } from '../slack/send-slack-message';
import { UserPublicProfile } from 'user-profile-model';
import type { firestore } from 'firebase-admin';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

export const notifyAfterUserFeedbackFactory = (
  firebase: typeof import('firebase-admin'),
  options: GlobalOptions
) => onDocumentCreated({
  document: 'team/{team}/inbox/{chapterLeader}/message/{messageId}',
  ...options
}, async (event) => {
  const message = event.data.data();
  const slackToken = process.env.SLACK_BOTTOKEN;
  if (slackToken) {
    const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase
      .firestore()
      .doc(`team/${event.params.team}/profile-public/${event.params.chapterLeader}`) as firestore.DocumentReference<UserPublicProfile>;
    const profile = await profileDoc.get();
    if (profile.exists) {
        await sendSlackMessage(slackToken, {
            channel: profile.data().slackMemberId,
            text: `You have new feedback!`,
            attachments: [
                {
                    color: `#36a64f`,
                    author_name: message.fromName,
                    title: `Feedback for ${message.forName}`,
                    text: message.message,
                    title_link: process.env.WEBAPP_URL,
                    fallback: `${message.forName}: ${message.message}\nby ${message.fromName}`
                }
            ]
        });
    } else {
        console.error(`User public profile not found [profileId=${event.params.chapterLeader}]`);
    }
  } else {
    console.warn('Notification skipped due to missing slack configuration');
  }
});
