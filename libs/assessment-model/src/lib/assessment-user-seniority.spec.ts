import { describe, expect, it } from '@jest/globals';
import { AssessmentUserSeniority, AssessmentUserSeniorityOfString } from 'assessment-model';

describe('assessment user seniority parse', () => {
    it('should parse string as enum', () => {
        expect(AssessmentUserSeniorityOfString('lead')).toBe(AssessmentUserSeniority.lead);
        expect(AssessmentUserSeniorityOfString('senior')).toBe(AssessmentUserSeniority.senior);
        expect(AssessmentUserSeniorityOfString('regular')).toBe(AssessmentUserSeniority.regular);
        expect(AssessmentUserSeniorityOfString('junior')).toBe(AssessmentUserSeniority.junior);
        expect(AssessmentUserSeniorityOfString('blahbleh')).toBe(AssessmentUserSeniority.none);
        expect(AssessmentUserSeniorityOfString(undefined)).toBe(AssessmentUserSeniority.none);
    });
});
