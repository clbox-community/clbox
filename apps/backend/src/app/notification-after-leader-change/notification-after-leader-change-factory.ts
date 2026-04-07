import { sendSlackMessage } from '../slack/send-slack-message';
import { UserPublicProfile } from 'user-profile-model';
import type { firestore } from 'firebase-admin';

export const notificationAfterLeaderChangeFactory = (
  functions: import('firebase-functions/v1').FunctionBuilder,
  config: Record<string, any>,
  firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/user/{user}').onUpdate(
  async (change, context) => {
    if (change.after.data().chapterLeader !== change.before.data().chapterLeader) {
      console.log(`Notify user after chapter leader change [user=${context.params.user}, newLeader=${change.after.data().chapterLeader}]`);
      const slackToken = config.slack.bottoken;
      if (slackToken) {
        const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase
          .firestore()
          .doc(`team/${context.params.team}/profile-public/${context.params.user}`) as firestore.DocumentReference<UserPublicProfile>;
        const profile = await profileDoc.get();
        if (profile.exists) {
            await sendSlackMessage(slackToken, {
                channel: profile.data().slackMemberId,
                text: `Your chapter leader was changed to ${change.after.data().chapterLeader}.`
            });
        } else {
            console.error(`User public profile not found [profileId=${context.params.user}]`);
        }
      } else {
        console.warn('Notification skipped due to missing slack configuration');
      }
    }
  }
);
