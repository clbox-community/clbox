import { describe, expect, it } from '@jest/globals';
import { assessmentResponseAssessResult } from './assessment-response-assess-result';
import { DesiredResponseBySeniority, Question, QuestionType, Seniority } from '@clbox/assessment-survey';
import { ResponseAssessmentResult, UserAssessmentVerification, UserAssessmentVerifiedCategories } from 'assessment-model';

function q(
    expectedResponses: Partial<DesiredResponseBySeniority> = {},
    seniority = Seniority.regular,
    type = QuestionType.Correctness
): Question {
    return {
        id: 'dummy',
        seniority,
        expectedResponses: {
            [Seniority.junior]: [true, false],
            [Seniority.regular]: [true, false],
            [Seniority.senior]: [true],
            [Seniority.seniorPlus]: [true],
            ...expectedResponses
        },
        type
    };
}

describe('assessment result', () => {
    it('should mark ignored questions', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), undefined, {
            'dummy': { status: UserAssessmentVerification.Skip}
        })).toBe(ResponseAssessmentResult.Skipped);
    });
    it('should mark verified questions', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), undefined, {
            'dummy': { status: UserAssessmentVerification.Verified}
        })).toBe(ResponseAssessmentResult.Verified);
    });
    it('should mark expected response', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 3, undefined)).toBe(ResponseAssessmentResult.ExpectedResponse);
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 4, undefined)).toBe(ResponseAssessmentResult.ExpectedResponse);
    });
    it('should mark not expected bot required response', () => {
        expect(assessmentResponseAssessResult(Seniority.senior, q(), 1, undefined)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q(), 2, undefined)).toBe(ResponseAssessmentResult.NotExpectedRequired);
    });
    it('should mark not expected bot not required response', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 1, undefined)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 2, undefined)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
    });
    it('should correctly mark numeric questions', () => {
        expect(assessmentResponseAssessResult(Seniority.senior, q({
          senior: [4],
          seniorPlus: [4]
        }), 1, undefined)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({
          senior: [4],
          seniorPlus: [4]
        }), 2, undefined)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({
          senior: [3, 4],
          seniorPlus: [4]
        }), 3, undefined)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({
          senior: [3, 4],
          seniorPlus: [4]
        }), 4, undefined)).toBe(ResponseAssessmentResult.ExpectedResponse);
        expect(assessmentResponseAssessResult(Seniority.senior, q({
          senior: [3, 4],
          seniorPlus: [4]
        }), undefined, undefined)).toBe(ResponseAssessmentResult.NotAsked);
    })
});
