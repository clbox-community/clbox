import { Assessment, UserAssessment, UserAssessmentRef, UserAssessmentVerifiedCategories } from 'assessment-model';
import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import type {GlobalOptions} from 'firebase-functions/v2';

export const userAssessmentsWriteHandlerFactory = (
    firebase: typeof import('firebase-admin'),
    options: GlobalOptions
) => onDocumentWritten({document: 'team/{team}/assessment/{assessment}', ...options},
    async (event) => {
        if (!event.data.after.exists) {
            console.log(`Skipping user assessment documents when assessment deleted`);
            // todo: if we will ever flush user assessment documents we should store them on the side to not lose user data
            return;
        }

        const db = firebase.firestore();
        const prevAssessment = event.data.before.data() as Assessment | undefined;
        const assessment = event.data.after.data() as Assessment;
        const assessors: string[] = assessment?.assessors ?? [];
        const assessmentCategories= await db.doc(`team/${event.params.team}/user/${assessment.assessed}/data/assessment-categories`).get();

        for (const assessor of assessors) {
            if (prevAssessment?.assessors?.includes(assessor)) {
                continue;
            }
            console.log(`Updating assessment documents for added assessor: ${assessor}`);

            const userAssessment: UserAssessment = {
                ...assessment,
                assessmentId: event.data.after.id,
                assessor: assessor,
                verifiedCategories: assessmentCategories?.data() as UserAssessmentVerifiedCategories ?? {},
                askedQuestion: {},
                questionFeedback: {},
                questionTime: {},
                comment: {},
                responseValue: {},
                finished: false
            };
            const assessmentDocRef = db.doc(`team/${event.params.team}/assessment/${event.data.after.id}/result/${assessor}`);
            console.log(`Updating assessment result document for user [data=${JSON.stringify(userAssessment)}, ref=${assessmentDocRef.path}]`);
            await assessmentDocRef.set(userAssessment);

            const userAssessmentRef: UserAssessmentRef = {
                assessmentId: event.data.after.id,
                assessorId: assessor,
                userAssessmentId: assessor,
                assessedId: assessment.assessed,
                assessedName: assessment.user.name,
                deadline: assessment.deadline,
                finished: false
            };
            const userAssessmentDocRef = db.doc(`team/${event.params.team}/user/${assessor}/user-assessment-pending/${event.data.after.id}`);
            console.log(`Updating user assessment for [data=${JSON.stringify(userAssessmentRef)}, path=${userAssessmentDocRef.path}]`);
            await userAssessmentDocRef.set(userAssessmentRef);
        }
    }
);
