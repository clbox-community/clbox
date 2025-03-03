import { Assessment, UserAssessment, UserAssessmentRef } from 'assessment-model';
import { firestore } from 'firebase-admin';
import DocumentData = firestore.DocumentData;
import DocumentSnapshot = firestore.DocumentSnapshot;

export const userAssessmentsWriteHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/assessment/{assessment}').onWrite(
    async (change, context) => {
        if (!change.after.exists) {
            console.log(`Skipping user assessment documents when assessment deleted`);
            // todo: if we will ever flush user assessment documents we should store them on the side to not lose user data
            return;
        }

        const db = firebase.firestore();
        const prevAssessment = change.before.data() as Assessment | undefined;
        const assessment = change.after.data() as Assessment;
        const assessors: string[] = assessment?.assessors ?? [];
        const assessmentCategories= await db.doc(`team/${context.params.team}/user/${assessment.assessed}/data/assessment-categories`).get();

        for (const assessor of assessors) {
            if (prevAssessment?.assessors?.includes(assessor)) {
                continue;
            }
            console.log(`Updating assessment documents for added assessor: ${assessor}`);


            const userAssessment: UserAssessment = {
                ...assessment,
                assessmentId: change.after.id,
                assessor: assessor,
                questionToSkip: asQuestionToSkip(assessmentCategories),
                askedQuestion: {},
                questionFeedback: {},
                questionTime: {},
                comment: {},
                responseValue: {},
                finished: false
            };
            const assessmentDocRef = db.doc(`team/${context.params.team}/assessment/${change.after.id}/result/${assessor}`);
            console.log(`Updating assessment result document for user [data=${JSON.stringify(userAssessment)}, ref=${assessmentDocRef.path}]`);
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
            const userAssessmentDocRef = db.doc(`team/${context.params.team}/user/${assessor}/user-assessment-pending/${change.after.id}`);
            console.log(`Updating user assessment for [data=${JSON.stringify(userAssessmentRef)}, path=${userAssessmentDocRef.path}]`);
            await userAssessmentDocRef.set(userAssessmentRef);
        }
    }
);

function asQuestionToSkip(document: DocumentSnapshot<DocumentData>) {
    const questions: { [key: string]: boolean } = {};
    if (document.exists) {
        const data = document.data();
        Object.keys(data).filter(key => data[key].status !== "Ask").map(key => questions[key] = true);
    }
    return questions;
}
