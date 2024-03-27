import React, {useState} from "react";
import styled from "styled-components";
import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {firebaseApp} from "../../firebase/firebase.app";
import {useSkillTree} from "../../skill/firestore/use-skill-tree";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {SkillTreeCategory} from "../../skill/model/skill-tree-category";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {FormControl, InputLabel} from "@mui/material";
import {Tags} from "../../skill/data/tags";
import {SelectFromDomain} from "./select-from-domain";
import {Projects} from "../../team/model/projects";
import {Teams} from "../../team/model/teams";

const firestore = firebaseApp.firestore();

const SkillEditorView = ({teamId, userId}: ViewProps) => {
    const [skills, setSkills] = useSkillTree(teamId);

    const onSkillChanged = (prev: SkillTreeCategory, next: SkillTreeCategory) => {
        console.log({
            prev, next
        });

        const filteredSkill = Object.keys(next)
            .filter(key => key !== 'page')
            .filter(key => key !== 'id')
            .reduce(
                (result, key) => ({
                    ...result,
                    [key]: next[key]
                }),
                {}
            );
        firestore
            .doc(prev.page)
            .update({
                [`categories.${prev.id}`]: filteredSkill
            });
    };

    const onSkillAdded = (id) => {
        console.log(id);
        firestore
            .doc(`/team/${teamId}/skill/tree0`)
            .update({
                [`categories.${id}`]: {}
            });
    }

    return <Layout>
        <div>
            {skills && skills.map(skill =>
                <SkillRow onChanged={(prev, next) => onSkillChanged(prev, next)} skill={skill} key={skill.id}/>
            )}
            <AddSkill onAdd={onSkillAdded} />
        </div>
    </Layout>;
}

const AddSkill = ({onAdd}: {onAdd: (id: string) => void}) => {
    const [id, setId] = useState<string>('');
    const onSave = () => {
        onAdd(id);
        setId('');
    };
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <div>Dodaj nowy</div>
        </AccordionSummary>
        <AccordionDetails>
            <FormControl fullWidth sx={{marginBottom: '16px'}}>
                <TextField
                    label="id"
                    variant="outlined"
                    value={id}
                    onChange={change => setId(change.target.value)}
                />
            </FormControl>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button onClick={() => onSave()}>Zapisz</Button>
            </div>
        </AccordionDetails>
    </Accordion>;
}

const SkillRow = ({
                      skill,
                      onChanged
                  }: { onChanged: (prev: SkillTreeCategory, next: SkillTreeCategory) => void, skill: SkillTreeCategory }) => {
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <span>{skill.summary} ({skill.id})</span>
            <span style={{color: 'gray', fontStyle: 'italic', fontSize: '0.8em', marginLeft: '6px'}}>
                {Object.keys(skill.tag || {}).join(',')}{' '}
                {Object.keys(skill.project || {}).join(',')}{' '}
                {Object.keys(skill.team || {}).join(',')}
            </span>
        </AccordionSummary>
        <AccordionDetails>
            <SkillCategoryEditor skill={skill} onChange={changed => onChanged(skill, changed)}/>
        </AccordionDetails>
    </Accordion>;
}

function reduceToIndex(source: string[]) {
    return source.reduce(
        (result, id) => {
            result[id] = true;
            return result;
        },
        {}
    );
}

const SkillCategoryEditor = ({
                                 skill,
                                 onChange
                             }: { skill: SkillTreeCategory, onChange: (skill: SkillTreeCategory) => void }) => {
    const [details, setDetails] = useState<string>(skill.details ?? '');
    const [teams, setTeams] = useState<string[]>(skill.team ? Object.keys(skill.team) : []);
    const [projects, setProjects] = useState<string[]>(skill.project ? Object.keys(skill.project) : []);
    const [tags, setTags] = useState<string[]>(skill.tag ? Object.keys(skill.tag) : []);
    const [summary, setSummary] = useState<string>(skill.summary ?? '');
    const onSave = () => onChange({
        ...skill,
        summary,
        details,
        tag: reduceToIndex(tags),
        project: reduceToIndex(projects),
        team: reduceToIndex(teams)
    });

    return <div>
        <FormControl fullWidth sx={{marginBottom: '16px'}}>
            <TextField
                label="Nazwa"
                variant="outlined"
                value={summary}
                onChange={change => setSummary(change.target.value)}
            />
        </FormControl>
        <FormControl fullWidth sx={{marginBottom: '16px'}}>
            <TextField
                label="Opis"
                variant="outlined"
                multiline
                value={details}
                onChange={change => setDetails(change.target.value)}
            />
        </FormControl>
        <FormControl fullWidth sx={{marginBottom: '16px'}}>
            <InputLabel>Tagi</InputLabel>
            <SelectFromDomain
                value={tags}
                label="Tagi"
                domain={Object.keys(Tags).map(key => ({id: key, label: Tags[key]}))}
                onChange={setTags}
            />
        </FormControl>
        <FormControl fullWidth sx={{marginBottom: '16px'}}>
            <InputLabel>Projekty</InputLabel>
            <SelectFromDomain
                value={projects}
                domain={Object.keys(Projects).map(key => ({id: key, label: Projects[key]}))}
                label="Projekty"
                onChange={setProjects}
            />
        </FormControl>
        <FormControl fullWidth sx={{marginBottom: '16px'}}>
            <InputLabel>Zespoły</InputLabel>
            <SelectFromDomain
                value={teams}
                label="Zespoły"
                domain={Object.keys(Teams).map(key => ({id: key, label: Teams[key]}))}
                onChange={setTeams}
            />
        </FormControl>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Button onClick={onSave}>Zapisz</Button>
        </div>
    </div>;
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

export const SkillEditor = connector(SkillEditorView);

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;
