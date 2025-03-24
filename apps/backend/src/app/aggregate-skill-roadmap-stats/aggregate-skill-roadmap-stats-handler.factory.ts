export const aggregateSkillRoadmapStatsHandlerFactory = (
    functions: import('firebase-functions/v1').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/user/{user}/data/skills').onWrite(
    async (change, context) => {
        console.log({ user: context.params.user, change });
    }
);

