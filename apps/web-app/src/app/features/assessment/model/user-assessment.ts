import {AssessmentUserDetails} from "./assessment-user-details";

export interface UserAssessment {
    /** Identifier of source assessment based on which user assessment survey was created */
    assessmentId: string;
    /** User system/authentication identifiers of assessed person, e.g. grzegorz@lipecki.net */
    assessed: string;
    /** User system/authentication identifiers of assessees, e.g. [grzegorz@lipecki.net] */
    assessor: string;
    /** Users chapter leader identifier */
    chapterLeader: string;
    /** Assessment due date after which responses will not be stored */
    deadline?: number;
    /** User state in the moment of assessment */
    user: AssessmentUserDetails;
    /** Is survey finished by answering all questions. False when no questions left. */
    finished: boolean;
    /** Date when survey changed to finished state. */
    finishedDate?: number;
    /** Collection of presented question identifiers. Some questions may be skipped and this map allows to verify that. */
    askedQuestion: {
        [id: string]: boolean; // true when question was presented, false or no row if question was skipped
    };
    /** Question responses by question identifier. */
    response: {
        [id: string]: boolean;
    };
    /** Question comment by question identifier */
    comment: {
        [id: string]: string;
    };
    /** Collected feedback for questions by its identifier. Question feedback is optional. */
    questionFeedback: {
        [id: string]: string;
    };
    /** Time spend answering a question calculated as time between presenting question and collecting answer. Stored only when user selects a response and does not accumulate across multiple sessions without answer. */
    questionTime: {
        [id: string]: number; // time between question presentation to answer in seconds
    }
}
