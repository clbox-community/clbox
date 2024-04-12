import {AssessmentUserDetails} from "./assessment-user-details";

export interface Assessment {
    /** User system/authentication identifiers of assessed person, e.g. grzegorz@lipecki.net */
    assessed: string;
    /** User system/authentication identifiers of assessees, e.g. [grzegorz@lipecki.net] */
    assessors: string[];
    finishedAssessors: {
        [email: string]: boolean
    };
    /** Users chapter leader identifier */
    chapterLeader: string;
    /** Users with permission to view assessment progress and results. Without permission to modify assessment. */
    accessibleBy: string[];
    /** Assessment due date after which responses will not be stored. Assessment may not have deadline and will not be closed automatically. */
    deadline?: number;
    /** Identifiers of user who created assessment */
    author: string;
    /** Date at which assessment template was created */
    createdAt: number;
    /** User state in the moment of assessment */
    user: AssessmentUserDetails;
}
