import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

export const updateCampaignAfterSurveyFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions,
) => onDocumentCreated({document: 'team/{team}/campaign/{campaign}/answers/{answer}', ...options},
    async (event) => {
        console.log(`User survey answered [campaign=${event.params.campaign}, answer=${event.data.ref.path}]`);

        const now = new Date();
        const firestore = firebase.firestore();
        const campaignRef = firestore.doc(`/team/${event.params.team}/campaign/${event.params.campaign}`);
        await campaignRef.update({
            answers: firebase.firestore.FieldValue.arrayUnion({
                timestamp: now.getTime(),
                date: now.toISOString(),
                survey: event.data.ref.path
            })
        });
    }
)
