import {AssessmentUserSeniority} from "./assessment-user-seniority";

export interface AssessmentUserDetails {
    name: string;
    /** Identifiers of the projects in which the user is involved */
    projects: string[];
    /** Identifiers of the teams the user belongs to */
    teams: string[];
    /** User seniority in the moment of assessment */
    seniority: AssessmentUserSeniority;
    textForm: 'm' | 'f';
}
