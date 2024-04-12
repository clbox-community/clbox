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
import { Fragment, useEffect, useState } from 'react';
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

function asSeniority(seniority: AssessmentUserSeniority) {
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

function asSeniorityGroup(filter: 'junior' | 'regular' | 'senior' | 'seniorPlus'): Seniority[] {
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

function isQuestionSeniorityGreaterThanUser(q: QuestionWithCategory, assessment: WithId & Assessment) {
    switch (assessment.user.seniority) {
        case AssessmentUserSeniority.junior:
            return [Seniority.junior].indexOf(q.question.seniority);
        case AssessmentUserSeniority.regular:
            return [Seniority.junior, Seniority.regular].indexOf(q.question.seniority);
        case AssessmentUserSeniority.senior:
            return [Seniority.junior, Seniority.regular, Seniority.senior].indexOf(q.question.seniority);
        case AssessmentUserSeniority.lead:
            return [Seniority.junior, Seniority.regular, Seniority.senior, Seniority.seniorPlus].indexOf(q.question.seniority);
    }
    return false;
}

function responseColor(q: QuestionWithCategory, assessment: WithId & Assessment, result: WithId & UserAssessment): string {
    const asked = result.askedQuestion[q.question.id];
    const valid = isValidResponse(q, assessment, result);

    if (!asked) {
        return 'lightgray';
    } else if (valid) {
        if (isDesiredResponse(q, assessment, result)) {
            return 'green';
        } else if (isQuestionSeniorityGreaterThanUser(q, assessment)) {
            return 'gray';
        } else {
            return 'orange';
        }
    } else if (!valid) {
        return 'red';
    }

    return undefined;
}

// Desire response to oczekiwana żeby spełnić pytanie
// Fail response to ocena spełnienia względem wymagań na bieżącym stanowisku
function shouldShowQuestion(q: QuestionWithCategory, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    if (asSeniorityGroup(seniorityFilter).indexOf(q.question.seniority) < 0) {
        return false;
    }
    if (onlyFails && results.every(result => !result.askedQuestion[q.question.id] || isDesiredResponse(q, assessment, result))) {
        return false;
    }
    return true;
}

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
`;
const HeaderCell = styled.div``;

const ResultRowWrapper = styled.div`
    &:nth-child(2n) {
        background-color: rgba(234, 234, 234, 0.57);
    }

    :hover {
        background-color: rgba(179, 21, 54, 0.1);
    }
`;

const ResultRow = styled.div`
    display: flex;
    flex-direction: row;
`;

const ResultCell = styled.div`
    padding: 2px;
`;

const Columns = {
    id: {
        flexBasis: '100px',
        fontStyle: 'italic',
        color: 'gray'
    },
    question: {
        flex: '1'
    },
    seniority: {
        flexBasis: '100px'
    },
    result: {
        flexBasis: '100px'
    }
};

export const AssessmentResultView = ({ teamId }: ConnectedProps<typeof connector>) => {
    const { uuid } = useParams<{ uuid: string }>();
    const assessment = useAssessment(teamId, uuid);
    const results = useAssessmentResults(teamId, uuid);
    const [onlyFails, setOnlyFails] = useState<boolean>(true);
    const [seniorityFilter, setSeniorityFilter] = useState<keyof typeof Seniority | undefined>(Seniority.junior);
    useEffect(() => {
        if (assessment) {
            setSeniorityFilter(asSeniority(assessment.user.seniority));
        }
    }, [assessment, setSeniorityFilter, results]);
    return assessment && <OneColumnLayoutUltraWide>
        <Card>
            <CardContent>
                <div>
                    <div style={{ fontSize: '1.2em' }}>{assessment.user.name}</div>
                    <div>Poziom: {assessment.user.seniority}</div>
                    <div>Zespół: {assessment.user.teams} w {assessment.user.projects.join(', ')}</div>
                    <div>Oceniający: {assessment.assessors?.join(', ')}</div>
                </div>
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
                {results && <div>
                    <HeaderRow>
                        <HeaderCell style={{ ...Columns.id }}>
                            ID
                        </HeaderCell>
                        <HeaderCell style={{ ...Columns.question }}>
                            Pytanie
                        </HeaderCell>
                        <HeaderCell style={{ ...Columns.seniority }}>Poziom</HeaderCell>
                        {results.map(result =>
                            <HeaderCell key={result.assessor} style={{ ...Columns.result }} title={result.assessor?.substring(0, result.assessor?.indexOf('@'))}>
                                {result.assessor?.substring(0, result.assessor?.indexOf('@')).substring(0, 2)}
                            </HeaderCell>
                        )}
                    </HeaderRow>
                    {questionsWithCategories
                        .filter(q => shouldShowQuestion(q, assessment, results, seniorityFilter, onlyFails))
                        .sort((a, b) => a.question.seniority.localeCompare(b.question.seniority))
                        .map(q =>
                            <ResultRowWrapper key={q.question.id}>
                                <ResultRow>
                                    <ResultCell style={{ ...Columns.id }}>
                                        {q.question.id.replace('_', '.')}
                                    </ResultCell>
                                    <ResultCell style={{ ...Columns.question }}>
                                        {q.question.text3rd && userInText(q.question.text3rd[assessment.user.textForm], assessment.user.name)}
                                        {!q.question.text3rd && userInText(q.question.text1st[assessment.user.textForm], assessment.user.name)}
                                    </ResultCell>
                                    <ResultCell style={{ ...Columns.seniority }}>
                                        {q.question.seniority}
                                    </ResultCell>
                                    {results.map(result =>
                                        <ResultCell key={result.assessor}
                                                    style={{ ...Columns.result, color: responseColor(q, assessment, result) }}
                                        >
                                        <span title={`Odpowiedź: ${result.response[q.question.id] ? 'tak/często' : 'nie/rzadko'}`}>
                                            {result.askedQuestion[q.question.id] ? (result.response[q.question.id] ? 'tak' : 'nie') : '-'}
                                            &nbsp;
                                            {result.response[q.question.id] !== undefined ? (isDesiredResponse(q, assessment, result) ? '✓' : '⤫') : ''}
                                        </span>
                                        </ResultCell>
                                    )}
                                </ResultRow>
                                <div style={{ marginLeft: Columns.id.flexBasis, fontStyle: 'italic', maxWidth: '80%', fontSize: '.9em' }}>
                                    {results.filter(r => r.comment?.[q.question.id]).map(r => <div style={{ marginBottom: '4px' }} key={r.assessor + '-' + q.question.id}>
                                        <span style={{ color: 'gray' }}>(komentarz do odpowiedzi)</span> {r.assessor}: {r.comment?.[q.question.id]}
                                    </div>)}
                                    {results.filter(r => r.questionFeedback?.[q.question.id]).map(r => <div style={{ marginBottom: '4px' }} key={r.assessor + '-' + q.question.id}>
                                        <span style={{ color: 'gray' }}>(fedback do pytania)</span> {r.assessor}: {r.questionFeedback?.[q.question.id]}
                                    </div>)}
                                </div>
                            </ResultRowWrapper>
                        )}
                </div>}
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
