import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ChapterUser, useChapterUsers } from '../../model/use-chapter-users';
import { OneColumnLayoutWide } from '../../../layout/one-column-layout-wide';
import { AppState } from '../../../../state/app-state';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../../../ui/spinner/spinner';

const Header = styled.div`
    font-size: 20px;
    border-bottom: 1px solid dimgray;
    margin-bottom: 16px;
`;

const UserList = styled.div``;

const UserRowPanelName = styled.div`width: 300px`;
const UserRowPanelFeedbackCount = styled.div`width: 50px;
    text-align: center;`;
const UserRowPanelSeniority = styled.div`width: 50px;
    text-align: center;`;
const UserRowPanelLastOneOnOne = styled.div`width: 100px;
    text-align: center;`;
const UserRowPanelNextAssessment = styled.div`width: 100px;
    text-align: center;`;
const UserRowPanelFiller = styled.div`flex: 1`;

const UserRowPanel = styled.div`
    margin-bottom: 12px;
`;

const UserRowSummary = styled.div`
    display: flex;
    font-size: 1.1em;
`;

const UserRowDetailsPanel = styled.div`
    padding: 0 16px;
`;

const UserRowDetails = ({ user }: { user: ChapterUser }) => {
    const nav = useNavigate();
    return <UserRowDetailsPanel>
        <ButtonGroup variant="text" size="small" color="inherit">
            <Button sx={{ fontWeight: 'inherit' }} onClick={() => nav(`/feedback/inbox/s${user.id}`)}>Feedbacki</Button>
            <Button sx={{ fontWeight: 'inherit' }} onClick={() => nav(`/skill/chapter/${user.id}`)}>Umiejętności</Button>
            <Button sx={{ fontWeight: 'inherit' }}>Skill tree</Button>
            <Button sx={{ fontWeight: 'inherit' }} onClick={() => nav(`/assessment/categories/${user.id}`)}>Obszary oceny okresowej</Button>
            <Button sx={{ fontWeight: 'inherit' }}>Rozmowy 1-1</Button>
            <Button sx={{ fontWeight: 'inherit' }}>Notatki</Button>
        </ButtonGroup>
    </UserRowDetailsPanel>;
};

const UserRow = ({ user }: { user: ChapterUser }) => {
    const [expanded, setExpanded] = useState(false);
    return <UserRowPanel>
        <UserRowSummary>
            <UserRowPanelName>
                <Button variant="text" onClick={() => setExpanded(was => !was)}>{user.name}</Button>
            </UserRowPanelName>
            <UserRowPanelFiller></UserRowPanelFiller>
            <UserRowPanelFeedbackCount>0</UserRowPanelFeedbackCount>
            {/*<UserRowPanelSeniority>S17</UserRowPanelSeniority>*/}
            {/*<UserRowPanelLastOneOnOne>3.02.2025</UserRowPanelLastOneOnOne>*/}
            <UserRowPanelNextAssessment>16.06.2026</UserRowPanelNextAssessment>
        </UserRowSummary>
        {expanded && <UserRowDetails user={user}></UserRowDetails>}
    </UserRowPanel>;
};

const UserListHeader = () => {
    return <div style={{ display: 'flex', color: 'lightgrey' }}>
        <UserRowPanelName></UserRowPanelName>
        <UserRowPanelFiller></UserRowPanelFiller>
        <UserRowPanelFeedbackCount><EmailOutlinedIcon /></UserRowPanelFeedbackCount>
        {/*<UserRowPanelSeniority></UserRowPanelSeniority>*/}
        {/*<UserRowPanelLastOneOnOne>1-1</UserRowPanelLastOneOnOne>*/}
        <UserRowPanelNextAssessment>Ocena roczna</UserRowPanelNextAssessment>
    </div>;
};

export const ChapterDashboardView = ({ teamId, userId, userProfile }: ConnectedProps<typeof connector>) => {
    const users = useChapterUsers(teamId, userId);
    return <OneColumnLayoutWide>
        {userProfile?.chapterName && <Header>{userProfile.chapterName}</Header>}
        {users && <UserList>
            <UserListHeader></UserListHeader>
            {users.map(user => <UserRow user={user} key={user.id}></UserRow>)}
        </UserList>}
        {!users && <Spinner />}
    </OneColumnLayoutWide>;
};

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id,
        userId: state.authentication?.email,
        userProfile: state.profile.profile
    }),
    {}
);

export const ChapterDashboard = connector(ChapterDashboardView);
