export enum UserAssessmentVerification {
    Verified = 'verified',
    Verify = 'verify',
    Skip = 'skip',
    Ask = 'ask',
}

export interface UserAssessmentVerifiedCategory {
    status: UserAssessmentVerification;
    comment?: string;
    date?: number;
    author?: string;
}

export interface UserAssessmentVerifiedCategories {
    [key: string]: UserAssessmentVerifiedCategory;
}
