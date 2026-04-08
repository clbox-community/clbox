import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

const documentPath = 'team/{team}/sent/{user}/message/{messageId}' as const;

export const userFeedbackStatsFactory = (
  firebase: typeof import('firebase-admin'),
  options: GlobalOptions
) => onDocumentCreated({document: documentPath, ...options},
  async (event) => {
    const firestore = firebase.firestore();
    if (!event.data) return;
    const {date} = event.data.data() as { date: string };
    const day = date.substring(0, 10);
    const year = date.substring(0, 4);
    const statsRef = firestore
      .collection(`team/${event.params.team}/user/${event.params.user}/stats`)
      .doc('sent-feedbacks');

    await statsRef.set(
      {
        byYear: {
          [year]: {
            [day]: firebase.firestore.FieldValue.increment(1),
            summary: firebase.firestore.FieldValue.increment(1),
          }
        }
      },
      {
        merge: true
      }
    );
  }
)

