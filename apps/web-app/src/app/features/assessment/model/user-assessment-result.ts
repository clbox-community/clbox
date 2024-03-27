import {UserAssessment} from "./user-assessment";

/**
 * Source: created by system after UserAssessment changes state to finished=true.
 * Created by: function listening on /team/{team}/user/{assessee}/assessment-survey/{id}
 * Collection: /team/{team}/user/{assessee}/assessment-survey/{id}
 * Permissions:
 * - read: chapterLeader
 * - create: system
 */
export interface UserAssessmentResult extends UserAssessment {
    /** Date when system marked survey as submitted. */
    submitDate: Date;
}
