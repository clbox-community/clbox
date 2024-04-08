import { UserAssessmentRef } from '../../../../web-app/src/app/features/assessment/model/user-assessment-ref';

export const userAssessmentsFinishHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('/team/{team}/user/{assessor}/user-assessment-sent/{id}').onCreate(
    async (snapshot, context) => {
        console.log(`Assessment finished [id=${context.params.id}]`);
        const db = firebase.firestore();

        const userAssessmentRef = snapshot.data() as UserAssessmentRef;
        await db.runTransaction(async (trn) => {
            const resultDoc = `/team/${context.params.team}/assessment/${userAssessmentRef.assessmentId}/result/${userAssessmentRef.userAssessmentId}`;
            console.log(`Update ${resultDoc} with finished state`);
            trn.update(
                db.doc(resultDoc),
                {
                    finished: true,
                    finishedDate: userAssessmentRef.finishedDate ?? new Date().getTime()
                }
            );
            const assessmentDoc = `/team/${context.params.team}/assessment/${userAssessmentRef.assessmentId}`;
            console.log(`Update ${assessmentDoc} with finished assessors: ${context.params.assessor}`);
            trn.update(
                db.doc(assessmentDoc),
                {
                    [`finishedAssessors.${context.params.assessor.replace('.', '_')}`]: true
                }
            );

            const pendingDoc = `/team/${context.params.team}/user/${context.params.assessor}/user-assessment-pending/${context.params.id}`;
            console.log(`Delete ${pendingDoc}`);
            trn.delete(db.doc(pendingDoc));
        });
    }
);
