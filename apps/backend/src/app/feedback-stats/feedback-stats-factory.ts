import {onDocumentCreated} from 'firebase-functions/v2/firestore';

export const feedbackStatsFactory = (
  firebase: typeof import('firebase-admin')
) => onDocumentCreated('team/{team}/inbox/{chapterLeader}/message/{messageId}',
  async (event) => {
    const firestore = firebase.firestore();

    const {date} = event.data.data() as { date: string };
    const month = date.substring(0, 7);
    const day = date.substring(0, 10);
    const monthRef = firestore.collection(`team/${event.params.team}/stats`).doc(month);

    await firestore.runTransaction(async trn => {
      const monthDoc = await trn.get(monthRef);
      const statsData = monthDoc.data();
      await trn.set(monthRef, {
        [day]: (statsData?.[day] ?? 0) + 1,
        summary: (statsData?.summary ?? 0) + 1
      }, {
        merge: true
      })
    });
  }
)

