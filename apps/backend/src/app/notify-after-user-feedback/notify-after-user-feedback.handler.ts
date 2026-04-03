import { sendSlackMessage } from '../slack/send-slack-message';
import { UserPublicProfile } from 'user-profile-model';
import type { firestore } from 'firebase-admin';

export const notifyAfterUserFeedbackFactory = (
  functions: import('firebase-functions/v1').FunctionBuilder,
  config: Record<string, any>,
  firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/inbox/{chapterLeader}/message/{messageId}').onCreate(
  async (change, context) => {
    const message = change.data();
    const slackToken = config.slack.bottoken;
    if (slackToken) {
      const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase
        .firestore()
        .doc(`team/${context.params.team}/profile-public/${context.params.chapterLeader}`) as firestore.DocumentReference<UserPublicProfile>;
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
                      title_link: config.webapp.url,
                      fallback: `${message.forName}: ${message.message}\nby ${message.fromName}`
                  }
              ]
          });
      } else {
          console.error(`User public profile not found [profileId=${context.params.chapterLeader}]`);
      }
    } else {
      console.warn('Notification skipped due to missing slack configuration');
    }
  }
);
