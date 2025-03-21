import { QuestionWithCategory } from '../state/question-with-category';
import { Seniority } from '@clbox/assessment-survey';
import { Assessment, ResponseAssessmentResult, UserAssessment, WithId } from 'assessment-model';
import { assessmentResponseAssessResult } from '../model/assessment-response-assess-result';

export const UserSeniorityReportCard = ({ userSeniority, questions, seniority, assessment, results }: {
    userSeniority: Seniority,
    questions: QuestionWithCategory[],
    seniority: Seniority,
    assessment: WithId & Assessment,
    results: (WithId & UserAssessment)[]
}) => {
    const stats = {
        desired: 0,
        notDesiredButAcceptable: 0,
        notValid: 0,
        count: 0,
        wasAsked: 0
    };
    questions
        .filter(q => q.question.seniority === seniority)
        .filter(q => q.question.expectedResponses[seniority]?.length > 0)
        .forEach(q => {
            const wasAsked = results?.map(result => result.askedQuestion[q.question.id]).some(answer => answer);
            const responses = results
                ?.filter(result => result.askedQuestion[q.question.id])
                ?.map(result => assessmentResponseAssessResult(userSeniority, q.question, result.responseValue[q.question.id]))
            const isDesired = responses
                ?.map(answer => answer === ResponseAssessmentResult.ExpectedResponse)
                ?.every(answer => answer);
            const isValid = responses
                ?.map(answer => answer !== ResponseAssessmentResult.NotExpectedRequired)
                ?.every(answer => answer);
            stats.count++;
            if (!wasAsked) {
                stats.wasAsked++;
            } else if (isDesired) {
                stats.desired++;
            } else if (isValid) {
                stats.notDesiredButAcceptable++;
            } else {
                stats.notValid++;
            }
        });
    const barLength = 265;
    return <>
        <span title={Math.floor((stats.desired / stats.count) * 100) + '%'}
              style={{ display: 'inline-block', width: ((stats.desired / stats.count) * barLength), height: '8px', backgroundColor: 'rgba(39, 174, 96, 1.0)' }}></span>
        <span title={Math.floor((stats.notDesiredButAcceptable / stats.count) * 100) + '%'}
              style={{ display: 'inline-block', width: ((stats.notDesiredButAcceptable / stats.count) * barLength), height: '8px', backgroundColor: 'rgba(230, 126, 34, 1.0)' }}></span>
        <span title={Math.floor((stats.notValid / stats.count) * 100) + '%'}
              style={{ display: 'inline-block', width: ((stats.notValid / stats.count) * barLength), height: '8px', backgroundColor: 'rgba(192, 57, 43, 1.0)' }}></span>
        <span title={Math.floor((stats.wasAsked / stats.count) * 100) + '%'}
              style={{ display: 'inline-block', width: ((stats.wasAsked / stats.count) * barLength), height: '8px', backgroundColor: 'rgba(127, 140, 141, 1.0)' }}></span>
    </>;
};
