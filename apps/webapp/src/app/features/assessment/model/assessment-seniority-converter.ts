import {Seniority } from '@clbox/assessment-survey';
import { AssessmentUserSeniority } from 'assessment-model';



export function AssessmentUserSeniorityToSeniority(raw: AssessmentUserSeniority): Seniority | undefined {
    switch (raw) {
        case AssessmentUserSeniority.junior: return Seniority.junior;
        case AssessmentUserSeniority.regular: return Seniority.regular;
        case AssessmentUserSeniority.senior: return Seniority.senior;
        case AssessmentUserSeniority.lead: return Seniority.seniorPlus;
        default: return undefined;
    }
}
