import { describe, expect, it } from '@jest/globals';
import { AssessmentUserRole, AssessmentUserRoleOfString } from './assessment-user-role';

describe('assessment user role parse', () => {
    it('should parse string as enum', () => {
        expect(AssessmentUserRoleOfString('dev')).toBe(AssessmentUserRole.Developer);
        expect(AssessmentUserRoleOfString('qa')).toBe(AssessmentUserRole.QA);
        expect(AssessmentUserRoleOfString('po')).toBe(AssessmentUserRole.ProductOwner);
        expect(AssessmentUserRoleOfString('blahbleh')).toBe(AssessmentUserRole.None);
        expect(AssessmentUserRoleOfString(undefined)).toBe(AssessmentUserRole.None);
    });
});
