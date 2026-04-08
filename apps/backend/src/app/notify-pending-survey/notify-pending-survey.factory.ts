import {notifyPendingSurveyHandler} from "./notify-pending-survey.handler";
import {onSchedule} from 'firebase-functions/v2/scheduler';
import type {GlobalOptions} from 'firebase-functions/v2';

export const notifyPendingSurveyFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions
) => onSchedule({
    ...options,
    schedule: '0 9 * * 1-5',
    timeZone: 'Europe/Warsaw',
}, async () => notifyPendingSurveyHandler(
    firebase
));
