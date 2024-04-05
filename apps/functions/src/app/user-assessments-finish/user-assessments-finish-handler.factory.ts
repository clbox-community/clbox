// export const userAssessmentsFinishHandlerFactory = (
//     functions: import('firebase-functions').FunctionBuilder,
//     firebase: typeof import('firebase-admin')
// ) => functions.firestore.document('/team/{team}/user/{assessee}/assessment-survey/{id}/data/state').onCreate(
//     async (change_, context) => {
//         console.log(`Assessment finished [id=${context.params.id}]`)
//         const db = firebase.firestore();
//
//         const assessment = await db.doc(`/team/${context.params.team}/user/${context.params.assessee}/assessment-survey/${context.params.id}`).get();
//
//         const toUpdateDoc = `/team/${context.params.team}/assessment/${assessment.data().assessmentId}`;
//         console.log(`Updating finished assesses [assessee=${context.params.assessee}, doc=${toUpdateDoc}]`)
//         await db
//             .doc(toUpdateDoc)
//             .update({
//                 [`finishedAssessees.${context.params.assessee.replace('.', '_')}`]: true
//             });
//
//         const copyResultTo = `/team/${context.params.team}/assessment/${assessment.data().assessmentId}/result`;
//         console.log(`Copying assessment survey as result [path=${copyResultTo}]`)
//         await db
//             .collection(copyResultTo)
//             .add({
//                 ...assessment.data(),
//                 finishedDate: change_.data().finishedDate
//             });
//
//
//         const sourcePath = assessment.ref.path;
//         console.log(`Removing source survey [path=${sourcePath}]`)
//         await db.doc(assessment.ref.path).delete();
//         await db.doc(sourcePath).delete();
//     }
// )
