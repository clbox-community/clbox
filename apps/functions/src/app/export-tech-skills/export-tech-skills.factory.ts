import {exportTechSkills} from "./export-tech-skills";

export const exportTechSkillsFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    config: Record<string, any>,
    firebase: typeof import('firebase-admin')
) => {
    return functions.pubsub.schedule('0 3 * * 1-7')
        .timeZone('Europe/Warsaw')
        .onRun(async () => exportTechSkills(config, firebase))
}
