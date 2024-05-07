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
            const resultDocPath = `/team/${context.params.team}/assessment/${userAssessmentRef.assessmentId}/result/${userAssessmentRef.userAssessmentId}`;
            const assessmentDocPath = `/team/${context.params.team}/assessment/${userAssessmentRef.assessmentId}`;
            const pendingDocPath = `/team/${context.params.team}/user/${context.params.assessor}/user-assessment-pending/${context.params.id}`;

            const resultDoc = db.doc(resultDocPath);
            const assessmentDoc = db.doc(assessmentDocPath);
            const pendingDoc = db.doc(pendingDocPath);

            console.log(`Update ${resultDocPath} with finished state`);
            trn.update(
                resultDoc,
                {
                    finished: true,
                    finishedDate: userAssessmentRef.finishedDate ?? new Date().getTime()
                }
            );

            console.log(`Update ${assessmentDocPath} with finished assessors: ${context.params.assessor}`);
            trn.update(
                assessmentDoc,
                {
                    [`finishedAssessors.${context.params.assessor.replaceAll('.', '_')}`]: true
                }
            );

            console.log(`Delete ${pendingDocPath}`);
            trn.delete(pendingDoc);
        });
    }
);
