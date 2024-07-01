import { useParams } from 'react-router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useAssessmentResults } from '../state/use-assessment-results';
import { connect, ConnectedProps } from 'react-redux';
import { useAssessment } from '../state/use-assessment';
import styled from 'styled-components';
import { QuestionWithCategory } from '../state/question-with-category';
import { WithId } from '../model/with-id';
import { Assessment } from '../model/assessment';
import { UserAssessment } from '../model/user-assessment';
import { useEffect, useState } from 'react';
import { boolAnswerBasedOnQuestion, Category, hasBoolAnswerBasedOnQuestion, labelBasedOnQuestion, Question, Seniority, summaryAnswerBasedOnQuestion } from '@clbox/assessment-survey';
import { AssessmentUserSeniority } from '../model/assessment-user-seniority';
import { useAssessmentQuestions } from '../state/use-assessment-questions';
import { useAssessmentQuestionCategories } from '../state/use-assessment-question-categories';
import { AppState } from '../../../state/app-state';

export const OneColumnLayoutUltraWide = styled.div`
    width: 90%;
    margin: 0 auto;
`;

/**
 * Checks if user response matches desired response
 */
function isDesiredResponse(q: Question, assessment: WithId & Assessment, result: WithId & UserAssessment) {
    if (hasBoolAnswerBasedOnQuestion(q)) {
        return q.expectedResponses['seniorPlus'].includes(boolAnswerBasedOnQuestion(q, result.responseValue[q.id]));
    } else {
        return q.expectedResponses['seniorPlus'].includes(result.responseValue[q.id]);
    }
}

/**
 * Checks if user has valid response based on seniority.
 */
function isValidResponse(q: Question, assessment: WithId & Assessment, result: WithId & UserAssessment): boolean {
    if (hasBoolAnswerBasedOnQuestion(q)) {
        return q.expectedResponses[assessment.user.seniority === 'lead' ? 'seniorPlus' : assessment.user.seniority].includes(boolAnswerBasedOnQuestion(q, result.responseValue[q.id]));
    } else {
        return q.expectedResponses[assessment.user.seniority === 'lead' ? 'seniorPlus' : assessment.user.seniority].includes(result.responseValue[q.id]);
    }
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

function isQuestionSeniorityGreaterThanUser(q: Question, assessment: WithId & Assessment) {
    switch (assessment.user.seniority) {
        case AssessmentUserSeniority.junior:
            return [Seniority.junior].indexOf(q.seniority) < 0;
        case AssessmentUserSeniority.regular:
            return [Seniority.junior, Seniority.regular].indexOf(q.seniority) < 0;
        case AssessmentUserSeniority.senior:
            return [Seniority.junior, Seniority.regular, Seniority.senior].indexOf(q.seniority) < 0;
        case AssessmentUserSeniority.lead:
            return [Seniority.junior, Seniority.regular, Seniority.senior, Seniority.seniorPlus].indexOf(q.seniority) < 0;
    }
    return false;
}

function responseColor(q: Question, assessment: WithId & Assessment, result: WithId & UserAssessment): string {
    const asked = result.askedQuestion[q.id];
    const valid = isValidResponse(q, assessment, result);

    if (!asked) {
        return 'lightgray';
    } else if (valid) {
        if (isDesiredResponse(q, assessment, result)) {
            return 'rgba(39, 174, 96, 1.0)';
        } else if (isQuestionSeniorityGreaterThanUser(q, assessment)) {
            return 'rgba(127, 140, 141, 1.0)';
        } else {
            return 'rgba(230, 126, 34, 1.0)';
        }
    } else if (!valid) {
        return 'rgba(192, 57, 43, 1.0)';
    }

    return undefined;
}

// Desire response to oczekiwana żeby spełnić pytanie
// Fail response to ocena spełnienia względem wymagań na bieżącym stanowisku
function shouldShowQuestion(q: Question, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    if (asSeniorityGroup(seniorityFilter).indexOf(q.seniority) < 0) {
        return false;
    }
    if (onlyFails && (results.every(result => !result.askedQuestion[q.id] || isDesiredResponse(q, assessment, result)))) {
        return false;
    }
    return true;
}

function hasAnyVisibleQuestion(category: Category, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    return category.questions.some(q => shouldShowQuestion(q, assessment, results, seniorityFilter, onlyFails));
}

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 0.9em;
    color: dimgray;
    font-style: italic;
`;
const HeaderCell = styled.div``;

const ResultRowWrapper = styled.div`
    &:nth-child(2n) {
        background-color: rgba(234, 234, 234, 0.57);
    }

    :hover {
        outline: 1px solid rgba(84, 83, 83, 0.57);
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
        flexBasis: '150px',
        fontStyle: 'italic',
        color: 'rgba(127, 140, 141, 1.0)'
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

const HeaderLabel = styled.span`
    font-weight: 300;
    font-style: italic;
    color: gray;
    margin-right: 16px;
`;

const CategoryRow = styled.div`
    margin-bottom: 24px;
`;

const UserSeniorityReport = ({ questions, seniority, assessment, results }: {
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
        .forEach(q => {
            const wasAsked = results.map(result => result.askedQuestion[q.question.id]).some(answer => answer);
            const isDesired = results.filter(result => result.askedQuestion[q.question.id]).map(result => isDesiredResponse(q.question, assessment, result)).every(answer => answer);
            const isValid = results.filter(result => result.askedQuestion[q.question.id]).map(result => isValidResponse(q.question, assessment, result)).every(answer => answer);
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

export const AssessmentResultView = ({ teamId }: ConnectedProps<typeof connector>) => {
    const { uuid } = useParams<{ uuid: string }>();
    // todo: remove allQuestions, replace with questionCategories? or leave it as is for report? or use useAsAq directly in report?
    const allQuestions = useAssessmentQuestions();
    const questionCategories = useAssessmentQuestionCategories();
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
                <div style={{ fontSize: '1.2em' }}>{assessment.user.name}</div>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '32px' }}>
                    <div>
                        <div><HeaderLabel>Poziom</HeaderLabel>{assessment.user.seniority}</div>
                        <div><HeaderLabel>Zespół</HeaderLabel>{assessment.user.teams} w {assessment.user.projects.join(', ')}</div>
                    </div>
                    <div style={{ marginLeft: '32px' }}>
                        <div><HeaderLabel>Oceniający</HeaderLabel>{assessment.assessors?.join(', ')}</div>
                        <div><HeaderLabel>Chapter leader</HeaderLabel>{assessment.chapterLeader}</div>
                        <div><HeaderLabel>Wyniki widoczne dla</HeaderLabel>{assessment.accessibleBy?.join(', ')}</div>
                    </div>
                    <div style={{ flex: 1 }}></div>
                    <div style={{ marginLeft: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <HeaderLabel onClick={() => setSeniorityFilter('junior')} style={{ width: '80px', cursor: 'pointer' }}>Junior</HeaderLabel>
                            <UserSeniorityReport questions={allQuestions} seniority={Seniority.junior} assessment={assessment} results={results} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <HeaderLabel onClick={() => setSeniorityFilter('regular')} style={{ width: '80px', cursor: 'pointer' }}>Regular</HeaderLabel>
                            <UserSeniorityReport questions={allQuestions} seniority={Seniority.regular} assessment={assessment} results={results} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <HeaderLabel onClick={() => setSeniorityFilter('senior')} style={{ width: '80px', cursor: 'pointer' }}>Senior</HeaderLabel>
                            <UserSeniorityReport questions={allQuestions} seniority={Seniority.senior} assessment={assessment} results={results} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <HeaderLabel onClick={() => setSeniorityFilter('seniorPlus')} style={{ width: '80px', cursor: 'pointer' }}>Lead</HeaderLabel>
                            <UserSeniorityReport questions={allQuestions} seniority={Seniority.seniorPlus} assessment={assessment} results={results} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '0.9em', cursor: 'pointer', color: 'rgba(127, 140, 141, 1.0)', userSelect: 'none' }}>
                    <span onClick={() => setSeniorityFilter('junior')} style={{ fontWeight: seniorityFilter === 'junior' ? 600 : undefined }}>junior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('regular')} style={{ fontWeight: seniorityFilter === 'regular' ? 600 : undefined }}>regular</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('senior')} style={{ fontWeight: seniorityFilter === 'senior' ? 600 : undefined }}>senior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('seniorPlus')} style={{ fontWeight: seniorityFilter === 'seniorPlus' ? 600 : undefined }}>lead</span>
                    &nbsp;&nbsp;&nbsp;
                    <span onClick={() => setOnlyFails(f => !f)}>
                        {onlyFails ? 'Pokaż wszystkie obszary' : 'Pokaż obszary do usprawnienia'}
                    </span>
                </div>
                {results && <div>
                    <div>
                        {questionCategories
                            .filter(category => hasAnyVisibleQuestion(category, assessment, results, seniorityFilter, onlyFails))
                            .map(category => <CategoryRow key={category.id}>
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '1.1em', fontWeight: '500' }}>{category.name}</div>
                                    <div style={{ fontSize: '.9em', fontStyle: 'italic', color: 'dimgray' }}>{category.description}</div>
                                    <div style={{ fontSize: '.9em', fontStyle: 'italic', color: 'dimgray' }}>{category.comment}</div>
                                    {category.todo &&
                                        <div style={{ fontSize: '.9em', fontStyle: 'italic', color: 'rgb(192, 57, 43)' }}>Uważaj, kategoria wymaga znanych usprawnień: {category.todo}</div>}
                                </div>
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
                                            {result.assessor?.substring(0, result.assessor?.indexOf('@')).substring(0, 4)}
                                        </HeaderCell>
                                    )}
                                </HeaderRow>
                                <div>
                                    {category.questions
                                        .filter(q => shouldShowQuestion(q, assessment, results, seniorityFilter, onlyFails))
                                        .sort((a, b) => a.seniority.localeCompare(b.seniority))
                                        .map(q =>
                                            <ResultRowWrapper key={q.id}>
                                                <ResultRow>
                                                    <ResultCell style={{ ...Columns.id }}>
                                                        {q.id.replace('_', '.')}
                                                    </ResultCell>
                                                    <ResultCell style={{ ...Columns.question }}>
                                                        {q.text3rd && q.text3rd[assessment.user.textForm]}
                                                        {!q.text3rd && q.text1st[assessment.user.textForm]}
                                                    </ResultCell>
                                                    <ResultCell style={{ ...Columns.seniority }}>
                                                        {q.seniority}
                                                    </ResultCell>
                                                    {results.map(result =>
                                                        <ResultCell key={result.assessor}
                                                                    style={{ ...Columns.result, color: responseColor(q, assessment, result) }}
                                                        >
                                                            <span title={`Odpowiedź: ${labelBasedOnQuestion(q, result.responseValue[q.id])}`}>
                                                                {result.askedQuestion[q.id] ? (summaryAnswerBasedOnQuestion(q, result.responseValue[q.id])) : '-'}
                                                                &nbsp;
                                                                {result.responseValue[q.id] !== undefined ? (isDesiredResponse(q, assessment, result) ? '✓' : '⤫') : ''}
                                                            </span>
                                                        </ResultCell>
                                                    )}
                                                </ResultRow>
                                                <div style={{ marginLeft: Columns.id.flexBasis, fontStyle: 'italic', maxWidth: '80%', fontSize: '.9em', color: 'dimgray' }}>
                                                    {q.comment && <div>{q.comment}</div>}
                                                    {q.motivation && <div>{q.motivation}</div>}
                                                    {q.todo && <div style={{ color: 'rgb(192, 57, 43)' }}>Uważaj, pytanie wymaga znanych usprawnień: {q.todo}</div>}
                                                </div>
                                                <div style={{ marginLeft: Columns.id.flexBasis, fontStyle: 'italic', maxWidth: '80%', fontSize: '.9em', color: 'rgba(39, 174, 96, 1.0)' }}>
                                                    {results.filter(r => r.comment?.[q.id]).map(r => <div style={{ marginBottom: '4px' }} key={r.assessor + '-' + q.id}>
                                                        <span style={{ color: 'rgba(127, 140, 141, 1.0)' }}>(komentarz do odpowiedzi)</span> {r.assessor}: {r.comment?.[q.id]}
                                                    </div>)}
                                                    {results.filter(r => r.questionFeedback?.[q.id]).map(r => <div style={{ marginBottom: '4px' }} key={r.assessor + '-' + q.id}>
                                                        <span style={{ color: 'rgba(127, 140, 141, 1.0)' }}>(komentarz do pytania)</span> {r.assessor}: {r.questionFeedback?.[q.id]}
                                                    </div>)}
                                                </div>
                                            </ResultRowWrapper>
                                        )}
                                </div>
                            </CategoryRow>)}
                    </div>
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
