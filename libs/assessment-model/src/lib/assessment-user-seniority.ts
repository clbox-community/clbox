/** Based on libs/assessment-survey/src/survey-api.ts#Seniority */
export enum AssessmentUserSeniority {
    none = 'none',
    junior = 'junior',
    regular = 'regular',
    senior = 'senior',
    lead = 'lead'
}

export function AssessmentUserSeniorityOfString(raw: string): AssessmentUserSeniority {
    switch (raw) {
        case AssessmentUserSeniority[AssessmentUserSeniority.junior]: return AssessmentUserSeniority.junior;
        case AssessmentUserSeniority[AssessmentUserSeniority.regular]: return AssessmentUserSeniority.regular;
        case AssessmentUserSeniority[AssessmentUserSeniority.senior]: return AssessmentUserSeniority.senior;
        case AssessmentUserSeniority[AssessmentUserSeniority.lead]: return AssessmentUserSeniority.lead;
        default: return AssessmentUserSeniority.none;
    }
}
