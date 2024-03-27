import React, {useState} from "react";
import styled from "styled-components";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import {useSkillTree} from "../../skill/firestore/use-skill-tree";
import {SkillTreeCategory} from "../../skill/model/skill-tree-category";
import Button from "@mui/material/Button";
import {ButtonGroup} from "@mui/material";
import { Teams } from "../../team/model/teams";

interface Skill {
    id: string;
    summary: string;
    tags: string[];
    children: Skill[];
    parent?: Skill;
}

const SkillBrowserView = ({team}: ViewProps) => {
    const [skillTree] = useSkillTree(team);
    const [groupBy, setGroupBy] = useState<'p' | 't'>('p');

    return <Layout>
        {
            skillTree && <>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '8px',
                    fontSize: '0.9em',
                    fontStyle: 'italic'
                }}>
                    <ButtonGroup size="small">
                        <Button variant={groupBy === 'p' ? 'contained' : undefined}
                                onClick={() => setGroupBy('p')}>projekty</Button>
                        <Button variant={groupBy === 't' ? 'contained' : undefined}
                                onClick={() => setGroupBy('t')}>zespoły</Button>
                    </ButtonGroup>
                </div>
                <div>
                    {groupBy === 'p' && <SkillByProjectTable skills={skillTree}/>}
                    {/*{groupBy === 't' && <SkillByTeamTable skills={skillTree}/>}*/}
                </div>
            </>
        }
    </Layout>;
}

const SkillByProjectTable = ({skills}: { skills: SkillTreeCategory[] }) => <TableContainer>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Umiejętność</TableCell>
                <TableCell>iBiznes</TableCell>
                <TableCell>Poczta</TableCell>
                <TableCell>Eximee</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {skills.map(skill => <TableRow key={skill.id}>
                <TableCell>{skill.summary}</TableCell>
                <TableCell>{skill.project['ibiznes'] ? <CheckIcon style={{color: '#00cec9'}}/> : ''}</TableCell>
                <TableCell>{skill.project['poczta'] ? <CheckIcon style={{color: '#00cec9'}}/> : ''}</TableCell>
                <TableCell>{skill.project['eximee'] ? <CheckIcon style={{color: '#00cec9'}}/> : ''}</TableCell>
            </TableRow>)}
        </TableBody>
    </Table>
</TableContainer>;

const SkillByTeamTable = ({skills}: { skills: SkillTreeCategory[] }) => <TableContainer>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Umiejętność</TableCell>
                {Object.keys(Teams).map(team => <TableCell key={Teams[team]}>{team}</TableCell>)}
            </TableRow>
        </TableHead>
        <TableBody>
            {skills.map(skill => <TableRow key={skill.id}>
                <TableCell>{skill.summary}</TableCell>
                {Object.keys(Teams).map(team => <TableCell key={Teams[team]}>
                    {skill.team[Teams[team]] ? <CheckIcon/> : ''}
                </TableCell>)}
            </TableRow>)}
        </TableBody>
    </Table>
</TableContainer>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        team: state.team.current?.id,
        userId: state.authentication?.email
    }),
    {}
);

export const SkillsBrowser = connector(SkillBrowserView);

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;
