import { UserAssessmentRef } from 'assessment-model';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

export const userAssessmentsFinishHandlerFactory = (
    firebase: typeof import('firebase-admin')
) => onDocumentCreated('/team/{team}/user/{assessor}/user-assessment-sent/{id}',
    async (event) => {
        console.log(`Assessment finished [id=${event.params.id}]`);
        const db = firebase.firestore();

        const userAssessmentRef = event.data.data() as UserAssessmentRef;
        await db.runTransaction(async (trn) => {
            const resultDocPath = `/team/${event.params.team}/assessment/${userAssessmentRef.assessmentId}/result/${userAssessmentRef.userAssessmentId}`;
            const assessmentDocPath = `/team/${event.params.team}/assessment/${userAssessmentRef.assessmentId}`;
            const pendingDocPath = `/team/${event.params.team}/user/${event.params.assessor}/user-assessment-pending/${event.params.id}`;

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

            console.log(`Update ${assessmentDocPath} with finished assessors: ${event.params.assessor}`);
            trn.update(
                assessmentDoc,
                {
                    [`finishedAssessors.${event.params.assessor.replaceAll('.', '_')}`]: true
                }
            );

            console.log(`Delete ${pendingDocPath}`);
            trn.delete(pendingDoc);
        });
    }
);
