import { describe, expect, it } from '@jest/globals';
import { assessmentResponseAssessResult } from './assessment-response-assess-result';
import { DesiredResponseBySeniority, Question, QuestionType, Seniority } from '@clbox/assessment-survey';
import { ResponseAssessmentResult } from './assessment-response-result';


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
        expect(assessmentResponseAssessResult(Seniority.regular, q(), undefined)).toBe(ResponseAssessmentResult.NotAsked);
    });
    it('should mark expected response', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 2)).toBe(ResponseAssessmentResult.ExpectedResponse);
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 3)).toBe(ResponseAssessmentResult.ExpectedResponse);
    });
    it('should mark not expected bot required response', () => {
        expect(assessmentResponseAssessResult(Seniority.senior, q(), 0)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q(), 1)).toBe(ResponseAssessmentResult.NotExpectedRequired);
    });
    it('should mark not expected bot not required response', () => {
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 0)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
        expect(assessmentResponseAssessResult(Seniority.regular, q(), 1)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
    });
    it('should correctly mark numeric questions', () => {
        expect(assessmentResponseAssessResult(Seniority.senior, q({senior: [3], seniorPlus: [3]}), 0)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({senior: [3], seniorPlus: [3]}), 1)).toBe(ResponseAssessmentResult.NotExpectedRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({senior: [2, 3], seniorPlus: [3]}), 2)).toBe(ResponseAssessmentResult.NotExpectedNotRequired);
        expect(assessmentResponseAssessResult(Seniority.senior, q({senior: [2, 3], seniorPlus: [3]}), 3)).toBe(ResponseAssessmentResult.ExpectedResponse);
        expect(assessmentResponseAssessResult(Seniority.senior, q({senior: [2, 3], seniorPlus: [3]}), undefined)).toBe(ResponseAssessmentResult.NotAsked);
    })
});
