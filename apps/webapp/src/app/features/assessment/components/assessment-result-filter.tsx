import { ResponseAssessmentResult, UserAssessment, WithId } from 'assessment-model';
import { assessmentResponseAssessResult } from '../model/assessment-response-assess-result';
import { Question, Seniority } from '@clbox/assessment-survey';

export const AssessmentResultFilter = {
    isCorrect: function(userSeniority: Seniority, question: Question, results: (WithId & UserAssessment)[]) {
        return results.every(result => {
            const resultAssessment = assessmentResponseAssessResult(userSeniority, question, result.responseValue[question.id], result.verifiedCategories);
            return resultAssessment === ResponseAssessmentResult.NotAsked
                || resultAssessment === ResponseAssessmentResult.ExpectedResponse
                || resultAssessment === ResponseAssessmentResult.Verified
                || resultAssessment === ResponseAssessmentResult.Skipped;
        });
    },

    isFail: function(userSeniority: Seniority, question: Question, results: (WithId & UserAssessment)[]) {
        return !this.isCorrect(userSeniority, question, results);
    },

};
