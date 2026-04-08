import { sendSlackMessage } from '../slack/send-slack-message';
import { UserPublicProfile } from 'user-profile-model';
import type { firestore } from 'firebase-admin';
import {onDocumentUpdated} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

export const notificationAfterLeaderChangeFactory = (
  config: Record<string, any>,
  firebase: typeof import('firebase-admin'),
  options: GlobalOptions
) => onDocumentUpdated({
  document: 'team/{team}/user/{user}',
  ...options
}, async (event) => {
  if (event.data.after.data().chapterLeader !== event.data.before.data().chapterLeader) {
    console.log(`Notify user after chapter leader change [user=${event.params.user}, newLeader=${event.data.after.data().chapterLeader}]`);
    const slackToken = config.slack.bottoken;
    if (slackToken) {
      const profileDoc: firestore.DocumentReference<UserPublicProfile> = firebase
        .firestore()
        .doc(`team/${event.params.team}/profile-public/${event.params.user}`) as firestore.DocumentReference<UserPublicProfile>;
      const profile = await profileDoc.get();
      if (profile.exists) {
          await sendSlackMessage(slackToken, {
              channel: profile.data().slackMemberId,
              text: `Your chapter leader was changed to ${event.data.after.data().chapterLeader}.`
          });
      } else {
          console.error(`User public profile not found [profileId=${event.params.user}]`);
      }
    } else {
      console.warn('Notification skipped due to missing slack configuration');
    }
  }
});
