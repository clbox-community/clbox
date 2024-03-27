export const userAssessmentsCreateHandlerFactory = (
    functions: import('firebase-functions').FunctionBuilder,
    firebase: typeof import('firebase-admin')
) => functions.firestore.document('team/{team}/assessment/{assessment}').onCreate(
    async (change, context) => {
        const db = firebase.firestore();
        const assessment = change.data();
        const assessees: string[] = assessment.assessees;
        for (const assessee of assessees) {
            const userAssessment = {
                assessmentId: change.id,
                assessee,
                assessed: assessment.assessed,
                user: assessment.user,
                chapterLeader: assessment.chapterLeader,
                askedQuestion: {},
                deadline: assessment.deadline,
                finished: false,
                questionFeedback: {},
                questionTime: {},
                response: {}
            };
            console.log(`Creating user assessment for [data=${JSON.stringify(userAssessment)}]`);
            const created = await db.collection(`team/${context.params.team}/user/${assessee}/assessment-survey`)
                .add(userAssessment);
            console.log(`User assessment created with [id=${created.id}]`);
        }
    }
)
