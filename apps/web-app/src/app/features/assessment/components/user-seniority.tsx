import { QuestionWithCategory } from '../state/question-with-category';
import { Seniority } from '@clbox/assessment-survey';
import { WithId } from '../model/with-id';
import { Assessment } from '../model/assessment';
import { UserAssessment } from '../model/user-assessment';
import { UserSeniorityReportCard } from './user-seniority-report';
import styled from 'styled-components';

const HeaderLabel = styled.span`
    font-weight: 300;
    font-style: italic;
    color: gray;
    margin-right: 16px;
`;

export const UserSeniorityReport = ({ userSeniority, allQuestions, onFilterChange, assessment, results }: {
    userSeniority: Seniority,
    allQuestions: QuestionWithCategory[],
    onFilterChange: (filter: keyof typeof Seniority) => void,
    assessment: WithId & Assessment,
    results: (WithId & UserAssessment)[]
}) => {
    return <div style={{ marginLeft: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLabel onClick={() => onFilterChange('junior')} style={{ width: '80px', cursor: 'pointer' }}>Junior</HeaderLabel>
            <UserSeniorityReportCard userSeniority={userSeniority} questions={allQuestions} seniority={Seniority.junior} assessment={assessment} results={results} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLabel onClick={() => onFilterChange('regular')} style={{ width: '80px', cursor: 'pointer' }}>Regular</HeaderLabel>
            <UserSeniorityReportCard userSeniority={userSeniority} questions={allQuestions} seniority={Seniority.regular} assessment={assessment} results={results} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLabel onClick={() => onFilterChange('senior')} style={{ width: '80px', cursor: 'pointer' }}>Senior</HeaderLabel>
            <UserSeniorityReportCard userSeniority={userSeniority} questions={allQuestions} seniority={Seniority.senior} assessment={assessment} results={results} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLabel onClick={() => onFilterChange('seniorPlus')} style={{ width: '80px', cursor: 'pointer' }}>Lead</HeaderLabel>
            <UserSeniorityReportCard userSeniority={userSeniority} questions={allQuestions} seniority={Seniority.seniorPlus} assessment={assessment} results={results} />
        </div>
    </div>;
};
