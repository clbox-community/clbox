import { Assessment, UserAssessment, UserAssessmentRef } from 'assessment-model';

export const userAssessmentsCreateHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/assessment/{assessment}').onCreate(
    async (change, context) => {
        const db = firebase.firestore();
        const assessment = change.data() as Assessment;
        const assessors: string[] = assessment.assessors ?? [];
        for (const assessor of assessors) {
            const userAssessment: UserAssessment = {
                ...assessment,
                assessmentId: change.id,
                assessor: assessor,
                askedQuestion: {},
                questionFeedback: {},
                questionTime: {},
                comment: {},
                responseValue: {},
                finished: false
            };
            const userAssessmentDoc = await db
                .collection(`team/${context.params.team}/assessment/${change.id}/result/`)
                .add(userAssessment);
            const userAssessmentRef: UserAssessmentRef = {
                assessmentId: change.id,
                userAssessmentId: userAssessmentDoc.id,
                assessedId: assessment.assessed,
                assessedName: assessment.user.name,
                deadline: assessment.deadline,
                finished: false
            };
            console.log(`Creating user assessment for [data=${JSON.stringify(userAssessment)}, ref=${JSON.stringify(userAssessmentRef)}]`);
            const created = await db.collection(`team/${context.params.team}/user/${assessor}/user-assessment-pending`)
                .add(userAssessmentRef);
            console.log(`User assessment created with [ref=${created.path}, assessment=${userAssessmentDoc.path}]`);
        }
    }
);
