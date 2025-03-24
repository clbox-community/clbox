import { Question, Seniority } from '@clbox/assessment-survey';
import { ResponseAssessmentResult, UserAssessmentVerification, UserAssessmentVerifiedCategories } from 'assessment-model';

export function assessmentResponseAssessResult(userSeniority: Seniority, question: Question, response: number|undefined, verifiedCategories: UserAssessmentVerifiedCategories): ResponseAssessmentResult {
  if (verifiedCategories[question.id]?.status === UserAssessmentVerification.Verified) {
      return ResponseAssessmentResult.Verified;
  }
  if (verifiedCategories[question.id]?.status === UserAssessmentVerification.Skip) {
      return ResponseAssessmentResult.Skipped;
  }
  if (response === undefined) {
    return ResponseAssessmentResult.NotAsked;
  }
  const expectedResponses = normalizeResponses(question.expectedResponses[Seniority.seniorPlus]);
  if (expectedResponses.includes(response)) {
    return ResponseAssessmentResult.ExpectedResponse;
  }

  const requiredResponse = normalizeResponses(question.expectedResponses[userSeniority]);
  if (requiredResponse.includes(response)) {
    return ResponseAssessmentResult.NotExpectedNotRequired;
  }

  return ResponseAssessmentResult.NotExpectedRequired;
}

function normalizeResponses(array: unknown[]): number[] {
  const normalized: number[] = [];
  array.forEach(item => {
    if (item === true) {
      pushIfNotIncluded(normalized, 3);
      pushIfNotIncluded(normalized, 4);
    } else if (item === false) {
      pushIfNotIncluded(normalized, 1);
      pushIfNotIncluded(normalized, 2);
    } else {
      pushIfNotIncluded(normalized, item);
    }
  });
  return normalized;
}

function pushIfNotIncluded(normalized: unknown[], value: unknown) {
  if (!normalized.includes(value)) {
    normalized.push(value);
  }
}
