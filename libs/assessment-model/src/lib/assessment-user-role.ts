/** Based on libs/assessment-survey/src/survey-api.ts#UserRole */
export enum AssessmentUserRole {
    Developer = 'dev',
    ProductOwner = 'po',
    QA = 'qa',
    None = 'none'
}

export function AssessmentUserRoleOfString(raw?: string): AssessmentUserRole {
    switch (raw) {
        case AssessmentUserRole.Developer: return AssessmentUserRole.Developer;
        case AssessmentUserRole.ProductOwner: return AssessmentUserRole.ProductOwner;
        case AssessmentUserRole.QA: return AssessmentUserRole.QA;
        default: return AssessmentUserRole.None;
    }
}
