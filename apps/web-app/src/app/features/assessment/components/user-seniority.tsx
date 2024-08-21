import { Seniority } from '@clbox/assessment-survey';
import { UserSeniorityReportCard } from './user-seniority-report';
import styled from 'styled-components';
import { Assessment, UserAssessment, WithId } from 'assessment-model';
import { useAssessmentQuestions } from '../state/use-assessment-questions';

const HeaderLabel = styled.span`
    font-weight: 300;
    font-style: italic;
    color: gray;
    margin-right: 16px;
`;

export const UserSeniorityReport = ({ userSeniority, onFilterChange, assessment, results }: {
    userSeniority: Seniority,
    onFilterChange: (filter: keyof typeof Seniority) => void,
    assessment: WithId & Assessment,
    results: (WithId & UserAssessment)[]
}) => {
    // todo: remove allQuestions, replace with questionCategories? or leave it as is for report? or use useAsAq directly in report?
    const allQuestions = useAssessmentQuestions();
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
