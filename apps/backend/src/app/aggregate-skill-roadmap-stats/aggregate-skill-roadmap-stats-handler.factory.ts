import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

export const aggregateSkillRoadmapStatsHandlerFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions
) => onDocumentWritten({document: 'team/{team}/user/{user}/data/skills', ...options},
    async (event) => {
        console.log({ user: event.params.user, change: event.data });
    }
);

