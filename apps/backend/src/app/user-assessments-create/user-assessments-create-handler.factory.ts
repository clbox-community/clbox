import { Assessment, UserAssessment, UserAssessmentRef } from 'assessment-model';

export const userAssessmentsCreateHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/assessment/{assessment}').onWrite(
    async (change, context) => {
        if (!change.after) {
            console.log(`Skipping user assessment documents when assessment deleted`);
            // todo: if we will ever flush user assessment documents we should store them on the side to not lose user data
            return;
        }

        const db = firebase.firestore();
        const assessment = change.after.data() as Assessment;
        const assessors: string[] = assessment.assessors ?? [];
        for (const assessor of assessors) {
            const userAssessment: UserAssessment = {
                ...assessment,
                assessmentId: change.after.id,
                assessor: assessor,
                askedQuestion: {},
                questionFeedback: {},
                questionTime: {},
                comment: {},
                responseValue: {},
                finished: false
            };
            const assessmentDocRef = db.doc(`team/${context.params.team}/assessment/${change.after.id}/result/${assessor}`);
            await assessmentDocRef.set(userAssessment);

            const userAssessmentRef: UserAssessmentRef = {
                assessmentId: change.after.id,
                assessorId: assessor,
                userAssessmentId: assessor,
                assessedId: assessment.assessed,
                assessedName: assessment.user.name,
                deadline: assessment.deadline,
                finished: false
            };
            console.log(`Creating user assessment for [data=${JSON.stringify(userAssessment)}, ref=${JSON.stringify(userAssessmentRef)}]`);
            const userAssessmentDocRef = db.doc(`team/${context.params.team}/user/${assessor}/user-assessment-pending/${change.after.id}`);
            await userAssessmentDocRef.set(userAssessmentRef);
            console.log(`User assessment created with [ref=${userAssessmentDocRef.path}, assessment=${assessmentDocRef.path}]`);
        }
    }
);
