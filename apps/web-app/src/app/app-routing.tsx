import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { CreateUser } from './features/authentication/components/create-user/create-user';
import { Login } from './features/authentication/components/login/login';
import { ResetPassword } from './features/authentication/components/restore-password/reset-password';
import { CampaignSummary } from './features/campaign/components/campaign-summary';
import { Campaigns } from './features/campaign/components/campaigns';
import { ChapterStats } from './features/chapter-stats/components/chatpter-stats/chapter-stats';
import { Inbox } from './features/inbox/components/inbox/inbox';
import { PageNotFound } from './features/page-not-found/page-not-found';
import { Sent } from './features/sent/components/sent/sent';
import { Stats } from './features/stats/components/stats/stats';
import { Surveys } from './features/surveys/surveys';
import { SkillEditor } from './features/skill-editor/component/skill-editor';
import { SkillTeam } from './features/skill-team/component/skill-team';
import { SkillsBrowser } from './features/skill-browser/component/skills-browser';
import { Changelog } from './features/changelog/components/changelog';
import { SkillChapterUser } from './features/skill-chapter/components/skill-chapter-user';
import { SkillChapterUsers } from './features/skill-chapter/components/skill-chapter-users';
import { SkillRoadmapCategorySkills } from './features/skill-roadmap/component/skill-roadmap-category-skills';
import { SkillRoadmap } from './features/skill-roadmap/component/skill-roadmap';
import { Assessment } from './features/assessment/components/assessment';
import { Assessments } from './features/assessment/components/assessments';
import { AssessmentEdit } from './features/assessment/components/assessment-edit';
import { ProfilePage } from './features/profile/components/profile-page';
import { AssessmentResult } from './features/assessment/components/assessment-result';
import { UserProfilePage } from './features/profile/components/user-profile-page';
import { SurveyRoot } from './features/survey/components/survey-root';
import { SkillsSurvey } from './features/skill-survey/component/skills-survey';
import { SkillChapterAll } from './features/skill-chapter/components/skill-chapter-all';
import { ChapterDashboard } from './features/chapter/components/dashboard/chapter-dashboard';
import { AssessmentCategoriesUser } from './features/assessment/components/categories-user/assessment-categories-user';

export const AppRoutingAuthenticated = () => <Routes>
    <Route path="/s/:team/:uuid" element={<SurveyRoot />} />
    <Route path="/" element={<Navigate to="/chapter" />} />
    <Route path="/chapter">
        <Route path="" element={<ChapterDashboard />} />
    </Route>
    <Route path="feedback">
        <Route path="inbox" element={<Inbox />} />
        <Route path="sent" element={<Sent />} />
        <Route path="stats" element={<Stats />} />
        <Route path="chapter/stats" element={<ChapterStats />} />
    </Route>
    <Route path="survey">
        <Route path="inbox" element={<Surveys />} />
        <Route path="campaign" element={<Campaigns />} />
    </Route>
    <Route path="/campaign/:uuid" element={<CampaignSummary />} />
    <Route path="skill">
        <Route path="survey" element={<SkillsSurvey />} />
        <Route path="browser" element={<SkillsBrowser />} />
        <Route path="editor" element={<SkillEditor />} />
        <Route path="chapter" element={<SkillChapterUsers />} />
        <Route path="chapter/all" element={<SkillChapterAll />} />
        <Route path="chapter/:user" element={<SkillChapterUser />} />
        <Route path="team" element={<SkillTeam />} />
        <Route path="roadmap" element={<SkillRoadmap />} />
        <Route path="roadmap/:category" element={<SkillRoadmapCategorySkills />} />
    </Route>
    <Route path="/assessment">
        <Route path="" element={<Assessments />} />
        <Route path="new" element={<AssessmentEdit />} />
        <Route path="edit" element={<AssessmentEdit />} />
        <Route path="categories/:user" element={<AssessmentCategoriesUser />} />
        <Route path=":uuid/edit" element={<AssessmentEdit />} />
        <Route path=":uuid/result" element={<AssessmentResult />} />
        <Route path=":assessmentId/:userAssessmentId/:userAssessmentRefId" element={<Assessment />} />
    </Route>
    <Route path="/changelog" element={<Changelog />} />
    <Route path="/profile">
        <Route path="" element={<ProfilePage />} />
        <Route path="_/:userId" element={<UserProfilePage />} />
    </Route>
    {/*<Route path="/dashboard" component={Dashboard}/>*/}
    {/*<Route path="/chapter" component={Chapter}/>*/}
    {/*<Route path="/mine" component={PersonalFeedback}/>*/}
    <Route path="/*" element={<PageNotFound />} />
</Routes>;

export const AppRoutingUnauthenticated = () => {
    return <Routes>
        <Route path="/s/:team/:uuid" element={<SurveyRoot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/register" element={<CreateUser />} />
        <Route path="/*" element={<Navigate to="/login" />} />
    </Routes>;
};
