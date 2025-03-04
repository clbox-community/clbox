export const updateCampaignAfterSurveyFactory = (
    functions: import('firebase-functions/v1').FunctionBuilder,
    firebase: typeof import('firebase-admin'),
) => functions.firestore.document('team/{team}/campaign/{campaign}/answers/{answer}').onCreate(
    async (change, context) => {
        console.log(`User survey answered [campaign=${context.params.campaign}, answer=${change.ref.path}]`);

        const now = new Date();
        const firestore = firebase.firestore();
        const campaignRef = firestore.doc(`/team/${context.params.team}/campaign/${context.params.campaign}`);
        await campaignRef.update({
            answers: firebase.firestore.FieldValue.arrayUnion({
                timestamp: now.getTime(),
                date: now.toISOString(),
                survey: change.ref.path
            })
        });
    }
)
