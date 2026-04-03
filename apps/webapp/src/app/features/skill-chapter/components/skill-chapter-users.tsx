import styled from 'styled-components';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../state/app-state';
import { Link } from 'react-router-dom';
import { useChapterUsers } from '../../chapter/model/use-chapter-users';

export const SkillChapterUsersView = ({teamId, userId}: ViewProps) => {
    const users = useChapterUsers(teamId, userId);
    return <Layout>
        <ul>
            {users?.map(
                user => <li key={user.id}>
                    <Link to={`/skill/chapter/${user.id}`}>{user.name}</Link>
                </li>
            )}
        </ul>
    </Layout>;
}

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

export const SkillChapterUsers = connector(SkillChapterUsersView);

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;


