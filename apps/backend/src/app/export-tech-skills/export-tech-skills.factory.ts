import {exportTechSkills} from "./export-tech-skills";
import {onSchedule} from 'firebase-functions/v2/scheduler';

export const exportTechSkillsFactory = (
    firebase: typeof import('firebase-admin'),
    options: import('firebase-functions/v2').GlobalOptions
) => {
    return onSchedule({ ...options, schedule: '0 3 * * 1-7', timeZone: 'Europe/Warsaw' }, async () => exportTechSkills(firebase));
}
