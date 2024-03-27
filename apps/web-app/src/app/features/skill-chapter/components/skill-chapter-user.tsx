import styled from "styled-components";
import {useParams} from "react-router";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {useUserSkills} from "../../skill/firestore/use-user-skills";
import {useSkillTree} from "../../skill/firestore/use-skill-tree";
import React, {FC} from "react";
import {useUser} from "../../user/firestore/use-user";

export const SkillChapterView = ({teamId}: ViewProps) => {
    const {user: userId} = useParams<{ user: string }>()
    const [userSkills] = useUserSkills(teamId, userId);
    const [skills] = useSkillTree(teamId);
    const [user] = useUser(teamId, userId);
    return <Layout>
        <h2>
            {user?.display_name}
        </h2>
        <TwoColumns>
            <div>
            </div>
            <div>
                {skills && userSkills && skills
                    .sort((a, b) => (userSkills[b.id] ?? 0) - (userSkills[a.id] ?? 0))
                    .map(
                        skill => <SkillRow key={skill.id}>
                            <div style={{flex: 1}}>
                                <div style={{fontSize: '0.8em', color: 'gray'}}>
                                    {Object.keys(skill.tag ?? {}).join(', ')}{' / '}
                                    {Object.keys(skill.project ?? {}).join(', ')}
                                </div>
                                <div>
                                    {skill.summary ?? skill.id}
                                </div>
                            </div>
                            <div>
                                <SkillMeter value={userSkills[skill.id]}/>
                            </div>
                        </SkillRow>
                    )}
            </div>
        </TwoColumns>
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

export const SkillChapterUser = connector(SkillChapterView);

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

const SkillMeter: FC<{ value: number }> = ({value}) => {
    const valueNumber = value ?? 0;
    const progressColor = valueNumber > 0 ? (valueNumber > 1 ? '#91e4bc' : '#d4e491') : 'lightgray';
    return <div style={{
        paddingRight: '4px',
        backgroundColor: progressColor,
        width: `${20 + 20 * valueNumber}px`,
        textAlign: 'right'
    }}>
        {valueNumber}
    </div>;
}

const TwoColumns = styled.div`
    display: flex;

    & > div:nth-child(1) {
        flex-basis: 200px;
        margin-right: 16px;
        text-align: right;
    }

    & > div:nth-child(2) {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
`;
