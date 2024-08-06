import { useParams } from 'react-router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useAssessmentResults } from '../state/use-assessment-results';
import { connect, ConnectedProps } from 'react-redux';
import { useAssessment } from '../state/use-assessment';
import styled from 'styled-components';
import { WithId } from '../model/with-id';
import { Assessment } from '../model/assessment';
import { UserAssessment } from '../model/user-assessment';
import { useEffect, useState } from 'react';
import { AssessmentUserSeniority } from '../model/assessment-user-seniority';
import { useAssessmentQuestions } from '../state/use-assessment-questions';
import { useAssessmentQuestionCategories } from '../state/use-assessment-question-categories';
import { AppState } from '../../../state/app-state';
import { ResponseAssessmentResult } from '../model/assessment-response-result';
import { assessmentResponseAssessResult } from '../model/assessment-response-assess-result';
import { Category, labelBasedOnQuestion, Question, QuestionType, Seniority, summaryAnswerBasedOnQuestion } from '@clbox/assessment-survey';
import { UserSeniorityReport } from './user-seniority';

export const OneColumnLayoutUltraWide = styled.div`
    width: 90%;
    margin: 0 auto;
`;

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

function responseColor(question: Question, assessment: WithId & Assessment, result: WithId & UserAssessment): string {
    const colorMap: Record<ResponseAssessmentResult, string> = {
        [ResponseAssessmentResult.ExpectedResponse]: 'rgba(39, 174, 96, 1.0)',
        [ResponseAssessmentResult.NotExpectedRequired]: 'rgba(192, 57, 43, 1.0)',
        [ResponseAssessmentResult.NotAsked]: 'rgba(127, 140, 141, 1.0)',
        [ResponseAssessmentResult.NotExpectedNotRequired]: 'rgba(230, 126, 34, 1.0)'
    };

    return colorMap[assessmentResponseAssessResult(
        asSeniority(assessment.user.seniority),
        question,
        result.responseValue[question.id]
    )];
}

function shouldShowQuestion(userSeniority: Seniority, question: Question, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    if (!seniorityFilterAtLeast(seniorityFilter, question.seniority)) {
        return false;
    }
    if (onlyFails && (results.every(result => {
        const resultAssessment = assessmentResponseAssessResult(userSeniority, question, result.responseValue[question.id]);
        return resultAssessment === ResponseAssessmentResult.NotAsked || resultAssessment === ResponseAssessmentResult.ExpectedResponse;
    }))) {
        return false;
    }
    return true;
}

function hasAnyVisibleQuestion(userSeniority: Seniority, category: Category, assessment: WithId & Assessment, results: (WithId & UserAssessment)[], seniorityFilter: 'junior' | 'regular' | 'senior' | 'seniorPlus', onlyFails: boolean) {
    return category.questions.some(q => shouldShowQuestion(userSeniority, q, assessment, results, seniorityFilter, onlyFails));
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

function seniorityFilterAtLeast(filter: keyof typeof Seniority, atLeast: Seniority) {
    return asSeniorityGroup(filter).indexOf(atLeast) >= 0;
}

function answerCorrectnessMarkerText(result: WithId & UserAssessment, question: Question, assessment: WithId & Assessment) {
    const markMap: Record<ResponseAssessmentResult, string> = {
        [ResponseAssessmentResult.ExpectedResponse]: '✓',
        [ResponseAssessmentResult.NotExpectedRequired]: '⤫',
        [ResponseAssessmentResult.NotExpectedNotRequired]: '⤫',
        [ResponseAssessmentResult.NotAsked]: '-'
    };

    return markMap[assessmentResponseAssessResult(
        asSeniority(assessment.user.seniority),
        question,
        result.responseValue[question.id]
    )];
}

export const AssessmentResultView = ({ teamId }: ConnectedProps<typeof connector>) => {
    const { uuid } = useParams<{ uuid: string }>();
    // todo: remove allQuestions, replace with questionCategories? or leave it as is for report? or use useAsAq directly in report?
    const allQuestions = useAssessmentQuestions();
    const questionCategories = useAssessmentQuestionCategories();
    const assessment = useAssessment(teamId, uuid);
    const results = useAssessmentResults(teamId, uuid);
    const [onlyFails, setOnlyFails] = useState<boolean>(true);
    const [seniorityFilter, setSeniorityFilter] = useState<keyof typeof Seniority | undefined>(Seniority.junior);
    const userSeniority = assessment?.user?.seniority !== undefined ? asSeniority(assessment.user.seniority) : undefined;
    useEffect(() => {
        if (assessment) {
            setSeniorityFilter(userSeniority);
        }
    }, [assessment, setSeniorityFilter, userSeniority, results]);
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
                    <UserSeniorityReport
                        userSeniority={userSeniority}
                        allQuestions={allQuestions}
                        onFilterChange={setSeniorityFilter}
                        assessment={assessment}
                        results={results}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '0.9em', cursor: 'pointer', color: 'rgba(127, 140, 141, 1.0)', userSelect: 'none' }}>
                    <span onClick={() => setSeniorityFilter('junior')} style={{ fontWeight: seniorityFilterAtLeast(seniorityFilter, Seniority.junior) ? 600 : undefined }}>junior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('regular')} style={{ fontWeight: seniorityFilterAtLeast(seniorityFilter, Seniority.regular) ? 600 : undefined }}>regular</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('senior')} style={{ fontWeight: seniorityFilterAtLeast(seniorityFilter, Seniority.senior) ? 600 : undefined }}>senior</span>
                    &nbsp;|&nbsp;
                    <span onClick={() => setSeniorityFilter('seniorPlus')} style={{ fontWeight: seniorityFilterAtLeast(seniorityFilter, Seniority.seniorPlus) ? 600 : undefined }}>lead</span>
                    &nbsp;&nbsp;&nbsp;
                    <span onClick={() => setOnlyFails(f => !f)}>
                        {onlyFails ? 'Pokaż wszystkie obszary' : 'Pokaż obszary do usprawnienia'}
                    </span>
                </div>
                {results && <div>
                    <div>
                        {questionCategories
                            .filter(category => hasAnyVisibleQuestion(userSeniority, category, assessment, results, seniorityFilter, onlyFails))
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
                                        .filter(q => shouldShowQuestion(userSeniority, q, assessment, results, seniorityFilter, onlyFails))
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
                                                            <span title={labelBasedOnQuestion(userSeniority, q, result.responseValue[q.id])}>
                                                                {result.askedQuestion[q.id] ? (summaryAnswerBasedOnQuestion(q, result.responseValue[q.id])) : '-'}
                                                                &nbsp;
                                                                {answerCorrectnessMarkerText(result, q, assessment)}
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
