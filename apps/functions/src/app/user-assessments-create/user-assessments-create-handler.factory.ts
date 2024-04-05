import { UserAssessmentRef } from '../../../../web-app/src/app/features/assessment/model/user-assessment-ref';
import { Assessment } from '../../../../web-app/src/app/features/assessment/model/assessment';

export const userAssessmentsCreateHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/assessment/{assessment}').onCreate(
    async (change, context) => {
        const db = firebase.firestore();
        const assessment = change.data() as Assessment;
        const assessors: string[] = assessment.assessors;
        for (const assessor of assessors) {
            const userAssessment = await db.collection(`team/${context.params.team}/assessment/${change.id}/result/`).add({} as UserAssessmentRef);
            const userAssessmentRef: UserAssessmentRef = {
                assessmentId: change.id,
                userAssessmentId: userAssessment.id,
                assessedId: assessment.assessed,
                assessedName: assessment.user.name,
                deadline: assessment.deadline,
                finished: false
            };
            console.log(`Creating user assessment for [data=${JSON.stringify(userAssessmentRef)}]`);
            const created = await db.collection(`team/${context.params.team}/user/${assessor}/assessment-survey`)
                .add(userAssessmentRef);
            console.log(`User assessment created with [id=${created.id}]`);
        }
    }
);
