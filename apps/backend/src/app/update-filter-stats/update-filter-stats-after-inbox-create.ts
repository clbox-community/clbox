import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

function asStatsUpdate(firebase, message) {
    const update = {};

    (message.labels || []).forEach(label => update[`labels`] = {
        ...update['labels'],
        [label]: firebase.firestore.FieldValue.increment(1)
    });
    if (message.type === 'channel') {
        update['channels'] = {
            ...update['channels'],
            [message.for]: {
                name: message.for,
                shortName: message.forName,
                count: firebase.firestore.FieldValue.increment(1)
            }
        };
    } else {
        update['users'] = {
            ...update['users'],
            [message.for]: {
                email: message.for,
                name: message.forName,
                count: firebase.firestore.FieldValue.increment(1)
            }
        };
    }

    return update;
}

export const updateFilterStatsAfterInboxCreateFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions
) => onDocumentCreated({document: 'team/{team}/user/{user}/inbox/{messageId}', ...options},
    async (event) => {
        console.log(`Update user filter stats after inbox message create`);
        const statsDoc = firebase.firestore()
            .collection(`team/${event.params.team}/user/${event.params.user}/data`)
            .doc(`inbox-filter-stats`);
        const update = asStatsUpdate(firebase, event.data.data());
        console.log(`${statsDoc.path}=>${JSON.stringify(update)}`);
        await statsDoc.set(update, {merge: true});
    }
)

