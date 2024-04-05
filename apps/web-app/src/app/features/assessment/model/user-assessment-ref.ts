export interface UserAssessmentRef {
    /** Identifier of source assessment based on which user assessment survey was created */
    assessmentId: string;
    /** Identifier of user assessment results */
    userAssessmentId: string;
    /** User system/authentication identifiers of assessed person, e.g. grzegorz@lipecki.net */
    assessedId: string;
    /** User full name of assessed person, e.g. Grzegorz Lipecki */
    assessedName: string;
    /** Assessment due date after which responses will not be stored */
    deadline?: number;
    /** Is survey finished by answering all questions. False when no questions left. */
    finished: boolean;
}
