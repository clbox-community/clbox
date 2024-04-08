import { useParams } from 'react-router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useAssessmentResults } from '../state/use-assessment-results';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../state/app-state';
import { questionsWithCategories } from '../state/questions-with-categories';
import { useAssessment } from '../state/use-assessment';
import { userInText } from './user-In-text';
import styled from 'styled-components';
import { QuestionWithCategory } from '../state/question-with-category';
import { WithId } from '../model/with-id';
import { Assessment } from '../model/assessment';
import { UserAssessment } from '../model/user-assessment';
import { useEffect, useState } from 'react';
import { Seniority } from '@clbox/assessment-survey';
import { AssessmentUserSeniority } from '../model/assessment-user-seniority';

export const OneColumnLayoutUltraWide = styled.div`
    width: 90%;
    margin: 0 auto;
`;

/**
 * Checks if user response matches desired response
 */
function isDesiredResponse(q: QuestionWithCategory, assessment: WithId & Assessment, result: WithId & UserAssessment) {
    return q.question.expectedResponses['seniorPlus'].indexOf(result.response[q.question.id]) >= 0;
}

/**
 * Checks if user has valid response based on seniority.
 */
function isValidResponse(q: QuestionWithCategory, assessment: WithId & Assessment, result: WithId & UserAssessment): boolean {
    return q.question.expectedResponses[assessment.user.seniority === 'lead' ? 'seniorPlus' : assessment.user.seniority].indexOf(result.response[q.question.id]) >= 0;
}

function responseColor(q: QuestionWithCategory, assessment: WithId & Assessment, result: WithId & UserAssessment): string {
    const asked = result.askedQuestion[q.question.id];
    const valid = isValidResponse(q, assessment, result);

    if (!asked) {
        return 'lightgray';
    } else if (valid) {
        return isDesiredResponse(q, assessment, result) ? 'green' : 'orange';
    } else if (!valid) {
        return 'red';
    }

    return undefined;
}

function asSeniorityFilter(seniority: AssessmentUserSeniority) {
    switch (seniority) {
        case AssessmentUserSeniority.none:
            return undefined;
        case AssessmentUserSeniority.junior:
            return Seniority.junior;
        case AssessmentUserSeniority.regular:
            return Seniority.regular;
        case AssessmentUserSeniority.senior:
            return Seniority.senior;
        case AssessmentUserSeniority.lead:
            return Seniority.seniorPlus;
    }
}

function questionSeniorityToFilter(filter: 'junior' | 'regular' | 'senior' | 'seniorPlus'): Seniority[] {
    switch (filter) {
        case 'junior':
            return [Seniority.junior];
        case 'regular':
            return [Seniority.junior, Seniority.regular];
        case 'senior':
            return [Seniority.junior, Seniority.regular, Seniority.senior];
        case 'seniorPlus':
            return [Seniority.junior, Seniority.regular, Seniority.senior, Seniority.seniorPlus];

    }
}

// Desire response to oczekiwana żeby spełnić pytanie
// Fail response to ocena spełnienia względem wymagań na bieżącym stanowisku
function shouldShowQuestion(q: QuestionWithCategory, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    if (questionSeniorityToFilter(seniorityFilter).indexOf(q.question.seniority) < 0) {
        return false;
    }
    if (onlyFails && results.every(result => !result.askedQuestion[q.question.id] || isDesiredResponse(q, assessment, result))) {
        return false;
    }
    return true;
}

export const AssessmentResultView = ({ teamId }: ConnectedProps<typeof connector>) => {
    const { uuid } = useParams<{ uuid: string }>();
    const assessment = useAssessment(teamId, uuid);
    const results = useAssessmentResults(teamId, uuid);
    const [onlyFails, setOnlyFails] = useState<boolean>(true);
    const [seniorityFilter, setSeniorityFilter] = useState<keyof typeof Seniority | undefined>(Seniority.junior);
    useEffect(() => {
        if (assessment) {
            setSeniorityFilter(asSeniorityFilter(assessment.user.seniority));
        }
    }, [assessment, setSeniorityFilter, results]);

    return assessment && <OneColumnLayoutUltraWide>
        <Card>
            <CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '0.9em', cursor: 'pointer', color: 'gray', userSelect: 'none' }}>
                    <span onClick={() => setSeniorityFilter('junior')} style={{ fontWeight: seniorityFilter === 'junior' ? 500 : undefined }}>junior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('regular')} style={{ fontWeight: seniorityFilter === 'regular' ? 500 : undefined }}>regular</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('senior')} style={{ fontWeight: seniorityFilter === 'senior' ? 500 : undefined }}>senior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('seniorPlus')} style={{ fontWeight: seniorityFilter === 'seniorPlus' ? 500 : undefined }}>lead</span>
                    &nbsp;&nbsp;&nbsp;
                    <span onClick={() => setOnlyFails(f => !f)}>
                        {onlyFails ? 'Pokaż wszystkie obszary' : 'Pokaż obszary do usprawnienia'}
                    </span>
                </div>
                {results && <table>
                    <tbody>
                    <tr>
                        <td>
                            ID
                        </td>
                        <td>
                            Pytanie
                        </td>
                        <td>Poziom</td>
                        {results.map(result =>
                            <td key={result.assessor}>
                                {result.assessor?.substring(0, result.assessor?.indexOf('@'))}
                            </td>
                        )}
                        {/*<td>*/}
                        {/*    Oczekiwane*/}
                        {/*</td>*/}
                    </tr>
                    {questionsWithCategories
                        .filter(q => shouldShowQuestion(q, assessment, results, seniorityFilter, onlyFails))
                        .map(q =>
                            <tr key={q.question.id}>
                                <td style={{ verticalAlign: 'top' }}>
                                    {q.question.id.replace('_', '.')}
                                </td>
                                <td style={{ verticalAlign: 'top' }}>
                                    {q.question.text3rd && userInText(q.question.text3rd[assessment.user.textForm], assessment.user.name)}
                                    {!q.question.text3rd && userInText(q.question.text1st[assessment.user.textForm], assessment.user.name)}
                                </td>
                                <td style={{ verticalAlign: 'top' }}>
                                    {q.question.seniority}
                                </td>
                                {results.map(result =>
                                    <td key={result.assessor}
                                        style={{
                                            color: responseColor(q, assessment, result),
                                            flexBasis: '50px',
                                            marginRight: '8px',
                                            cursor: 'pointer',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        <span title={`Odpowiedź: ${result.response[q.question.id] ? 'tak/często' : 'nie/rzadko'}`}>
                                            {result.askedQuestion[q.question.id] ? (result.response[q.question.id] ? 'tak' : 'nie') : '-'}
                                            &nbsp;
                                            {result.response[q.question.id] !== undefined ? (isValidResponse(q, assessment, result) ? '✓' : '⤫') : ''}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>}
            </CardContent>
        </Card>
    </OneColumnLayoutUltraWide>;
};

const connector = connect(
    (state: AppState) => ({
        teamId: state?.team?.current?.id
    }),
    {}
);

export const AssessmentResult = connector(AssessmentResultView);
