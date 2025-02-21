import React, {useState} from "react";
import styled from "styled-components";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {firebaseApp} from "../../firebase/firebase.app";
import {ButtonGroup} from "@mui/material";
import Button from "@mui/material/Button";
import {useSkillTree} from "../../skill/firestore/use-skill-tree";
import {Tags} from "../../skill/data/tags";
import {SkillTreeCategory} from "../../skill/model/skill-tree-category";
import {useUserSkills} from "../../skill/firestore/use-user-skills";

const firestore = firebaseApp.firestore();

interface Skill {
    id: string;
    summary: string;
    tags: string[];
    children: Skill[];
    parent?: Skill;
}

const SkillsSurveyView = ({teamId, userId}: ViewProps) => {
    const [tagFilter, setTagFilter] = useState<string>(null);
    const [skillTree] = useSkillTree(teamId);
    const [userSkills] = useUserSkills(teamId, userId);

    const onSkillAnswered = (skill: SkillTreeCategory, answer: number) => {
        firestore
            .doc(`/team/${teamId}/user/${userId}/data/skills`)
            .set(
                {[skill.id]: answer},
                {merge: true}
            );
    }

    return <Layout>
        <TwoColumns>
            <div style={{cursor: 'pointer'}}>
                <div
                    style={{borderBottom: '1px solid lightgray', fontWeight: tagFilter === null ? 600 : undefined}}
                    onClick={() => setTagFilter(null)}
                    role="button">
                    Wszystkie
                </div>
                {Object.keys(Tags).map(tag => <div key={tag} style={{fontWeight: tagFilter === tag ? 600 : undefined}}
                                                   onClick={() => setTagFilter(tag)} role="button">
                    {tag}
                </div>)}
            </div>
            <div>
                <div>
                    <div style={{fontSize: '1.2em'}}>
                        Tabela kompetencji
                    </div>
                </div>
                <div style={{fontSize: '0.9em', fontStyle: 'italic', color: 'gray'}}>
                    <div>Wskazówki pomagające meytorycznie określić poziom 0, 1, 2, 3 są na wiki.</div>
                    <div><a href="https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962">https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962</a></div>
                </div>
                <div style={{marginTop: '16px'}}>
                    {skillTree && userSkills && skillTree
                        .filter(skill => tagFilter === null || skill.tag?.[tagFilter])
                        .map(skill => <SkillRow key={skill.id} style={{marginBottom: '8px'}}>
                            <SkillSurvey skill={skill} value={userSkills[skill.id]}
                                         onAnswered={(answer) => onSkillAnswered(skill, answer)}/>
                        </SkillRow>)}
                </div>
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

export const SkillsSurvey = connector(SkillsSurveyView);

const SkillSurvey = ({
                         skill,
                         onAnswered,
                         value
                     }: { skill: SkillTreeCategory, value: number, onAnswered: (answer: number) => void }) => {
    return <>
        <div style={{flex: 1}}>
            <div style={{fontSize: '0.8em', color: 'gray'}}>
                {Object.keys(skill.tag ?? {}).join(', ')}{' / '}
                {Object.keys(skill.project ?? {}).join(', ')}
            </div>
            <div>
                {/*{skill.parent && <span> {skill.parent?.summary} / </span>}*/}
                {skill.summary ?? skill.id}
            </div>
        </div>
        <ButtonGroup variant="outlined">
            <Button variant={value === 0 ? 'contained' : undefined} onClick={() => onAnswered(0)}>Nie używałem</Button>
            <Button variant={value === 1 ? 'contained' : undefined} onClick={() => onAnswered(1)}>1</Button>
            <Button variant={value === 2 ? 'contained' : undefined} onClick={() => onAnswered(2)}>2</Button>
            <Button variant={value === 3 ? 'contained' : undefined} onClick={() => onAnswered(3)}>3</Button>
        </ButtonGroup>
    </>;
}

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;

const TwoColumns = styled.div`
    display: flex;

    & > div:nth-child(1) {
        flex-basis: 200px;
        margin-right: 16px;
        text-align: right;
    }

    & > div:nth-child(2) {
        flex: 1;
    }
`;

const SkillRow = styled.div`
    display: flex;
    padding: 4px;

    :hover {
        background-color: #f6f6f6;
        outline: 1px solid #f1f1f1;
    }
`;
