import {onDocumentCreated} from 'firebase-functions/v2/firestore';

export const userFeedbackStatsFactory = (
  firebase: typeof import('firebase-admin')
) => onDocumentCreated('team/{team}/sent/{user}/message/{messageId}',
  async (event) => {
    const firestore = firebase.firestore();

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

