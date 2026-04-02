import {onDocumentWritten} from 'firebase-functions/v2/firestore';

export const aggregateSkillRoadmapStatsHandlerFactory = (
    firebase: typeof import('firebase-admin')
) => onDocumentWritten('team/{team}/user/{user}/data/skills',
    async (event) => {
        console.log({ user: event.params.user, change: event.data });
    }
);

