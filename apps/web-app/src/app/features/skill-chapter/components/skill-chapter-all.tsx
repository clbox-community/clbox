import React from 'react';
import { AppState } from '../../../state/app-state';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { useChapterUsersSkill } from '../model/use-chapter-users-skill';
import { useSkillTree } from '../../skill/firestore/use-skill-tree';

function skillColor(skill: number): string {
    switch (skill) {
        case 0:
            return 'rgba(149, 165, 166,1.0)';
        case 1:
            return 'rgba(243, 156, 18,1.0)';
        case 2:
            return 'rgba(46, 204, 113,1.0)';
        case 3:
            return 'rgba(39, 174, 96,1.0)';
    }
}

export const SkillChapterAllView = ({ teamId, userId }: ViewProps) => {
    const users = useChapterUsersSkill(teamId, userId);
    const [skills] = useSkillTree(teamId);
    return <Layout>
        {(users && skills) && <>
            <SkillRow>
                <div style={{ flex: 1 }}></div>
                {users.map(user => <div key={user.id} style={{ flexBasis: '50px', textAlign: 'center' }}>
                    <span title={user.name}>{user.name.substring(0, 3)}</span>
                </div>)}
                <div style={{ flexBasis: '50px', textAlign: 'center' }}>sum</div>
            </SkillRow>
            {skills.map(skill => <SkillRow key={skill.id}>
                <div>
                    <div style={{ fontSize: '0.8em', color: 'gray' }}>
                        {Object.keys(skill.tag ?? {}).join(', ')}{' / '}
                        {Object.keys(skill.project ?? {}).join(', ')}
                    </div>
                    <div>
                        {skill.summary ?? skill.id}
                    </div>
                </div>
                <div style={{ flex: 1 }}></div>
                {users.map(user => <div key={skill.id + '_' + user.id} style={{ flexBasis: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span
                        title={`${user.name} - ${skill.summary ?? skill.id} - ${user.skills[skill.id]}`}
                        style={{ fontWeight: 500, color: skillColor(user.skills[skill.id]) }}
                    >
                        {user.skills[skill.id]}
                    </span>
                </div>)}
                <div style={{ flexBasis: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: users.map(user => user.skills[skill.id]).filter(skill => skill >= 2).length > 0 ? 'rgba(46, 204, 113, .2)' : 'rgba(236, 240, 241, 1.0)' }}>
                    {users.map(user => user.skills[skill.id]).filter(skill => skill >= 2).length}
                </div>
            </SkillRow>)}
        </>}
    </Layout>;
};

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;

const SkillRow = styled.div`
    display: flex;
    padding: 4px;

    :hover {
        background-color: #f6f6f6;
        outline: 1px solid #f1f1f1;
    }
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        teamId: state.team.current?.id,
        userId: state.authentication?.email
    }),
    {}
);

export const SkillChapterAll = connector(SkillChapterAllView);
