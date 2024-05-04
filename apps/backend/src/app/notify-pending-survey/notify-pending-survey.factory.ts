import {notifyPendingSurveyHandler} from "./notify-pending-survey.handler";

export const notifyPendingSurveyFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>,
    firebase: typeof import('firebase-admin')
) => functions.pubsub
    .schedule('0 9 * * 1-5')
    .timeZone('Europe/Warsaw')
    .onRun(async ctx => notifyPendingSurveyHandler(
        firebase, config
    ));
