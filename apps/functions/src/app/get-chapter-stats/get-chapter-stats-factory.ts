import { onCall } from 'firebase-functions/v2/https';

export const getChapterStatsFactory = (
    firebase: typeof import('firebase-admin')
) => onCall(    async request => {
    if (!request.auth?.token?.email) {
        throw new Error(`Functions requires authentication`);
    }
    const firestore = firebase.firestore();
    const auth = request.auth?.token?.email;

    const users = await firestore
        .collection(`/team/${request.data.team}/user`)
        .where('chapterLeader', '==', auth)
        .get();

    return await Promise.all([
        firestore
            .collection(`/team/${request.data.team}/user/${auth}/stats`)
            .doc(request.data.statType)
            .get()
            .then(doc => ({
                user: auth,
                stats: doc.data()
            })),
        ...users.docs.map(async user => {
            const stats = await firestore
                .collection(`/team/${request.data.team}/user/${user.id}/stats`)
                .doc(request.data.statType)
                .get();
            return {
                user: user.id,
                stats: stats.data()
            };
        })
    ]);
});
