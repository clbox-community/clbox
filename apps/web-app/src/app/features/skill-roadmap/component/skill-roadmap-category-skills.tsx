import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import {useParams} from "react-router";
import React, {Fragment, PropsWithChildren, useState} from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import Checkbox from '@mui/material/Checkbox';
import {FormControlLabel, FormGroup} from "@mui/material";
import {useSearchParams} from "react-router-dom";
import {SkillLevelFilter} from "./skill-level-filter";
import {SkillRoadmapDevelWarning} from "./skill-roadmal-devel-warning";
import {RoadmapSkillSection, RoadmapSkillTopic, SkillLevel, SkillsRoadmap} from "@clbox/skill-roadmap";

const TopicRowHeader = styled.div`
    display: flex;
    justify-items: baseline;
    justify-content: space-between;
    align-items: center;

    &:hover {
        outline: 1px dashed lightgrey;
    }
`;

const TopicRowBody = styled.div`
    margin-left: 26px;
    font-size: 0.9em;
    font-style: italic;
`;

const disableTopicCheckboxes = true;

const labelOfLevel = (level: SkillLevel) => level === SkillLevel.Level3plus ? '3+' : level;

const TopicRow: React.FC<{ topic: RoadmapSkillTopic }> = ({topic}) => {
    const [expanded, setExpanded] = useState(false);
    return <div>
        <TopicRowHeader>
            <FormControlLabel control={<Checkbox disabled={!topic.uuid || disableTopicCheckboxes} sx={{'& .MuiSvgIcon-root': {fontSize: 20}}}/>}
                              label={<span style={{fontSize: '0.9em'}}>{topic.title}</span>}/>
            <div style={{fontSize: '0.8em', fontStyle: 'italic', display: 'flex'}}>
                {(topic.details || topic.links?.length > 0) && <div style={{color: 'gray', cursor: 'pointer'}}
                                                                    onClick={() => setExpanded(prev => !prev)}>(więcej)</div>}
                <div style={{width: '70px', textAlign: 'right'}}>poziom {labelOfLevel(topic.level)}</div>
            </div>
        </TopicRowHeader>
        {expanded && <TopicRowBody>
            <ReactMarkdown>{topic.details}</ReactMarkdown>
            {topic.links?.length > 0 && <Fragment>
                {topic.links.map(link => <div>
                    ✓ <a href={link.href}>{link.title}</a>
                </div>)}
            </Fragment>}
        </TopicRowBody>}
    </div>;
}

const SectionRowBody = styled.div`
    margin-left: 16px;
    font-size: 0.9em;
    font-style: italic;
    margin-bottom: 16px;
`;

const SectionRow: React.FC<PropsWithChildren<{ section: RoadmapSkillSection }>> = ({section, children}) => {
    const [expanded, setExpanded] = useState(false);
    return <Fragment>
        <div style={{marginBottom: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{fontSize: '1.1em'}}>{section.title}</div>
                {(section.details || section.links.length > 0) && <div style={{
                    fontSize: '0.8em',
                    fontStyle: 'italic',
                    color: 'gray',
                    cursor: 'pointer'
                }} onClick={() => setExpanded(prev => !prev)}>(więcej)</div>}
            </div>
            {expanded && <SectionRowBody>
                <ReactMarkdown>{section.details}</ReactMarkdown>
                {section.links.length > 0 && <div style={{marginBottom: '16px'}}>
                    {section.links.map(link => <div>
                        ✓ <a href={link.href}>{link.title}</a>
                    </div>)}
                </div>}
            </SectionRowBody>}
            <div>
                {children}
            </div>
        </div>
    </Fragment>;
}


export const SkillRoadmapAreaSkillView = () => {
    const {category: categoryId} = useParams();
    const [params, setParams] = useSearchParams();

    const levelFilter = +params.get('level') > 0 ? +params.get('level') : SkillLevel.Level3plus;
    const changeFilter = (level: SkillLevel) => setParams(prev => {
        prev.set('level', level + '');
        return prev;
    });

    const category = SkillsRoadmap.find(
        category => category.slug === categoryId || category.uuid === categoryId
    );

    if (category) {
        return <Layout>
            <SkillRoadmapDevelWarning />
            <div style={{fontSize: '1.4em'}}>
                {category.title}
            </div>
            <div style={{fontSize: '0.9em', fontStyle: 'italic', marginBottom: '16px'}}>
                {category.details && <div>
                    {category.details}
                </div>}
                {category.links && category.links.length > 0 && <div>
                    {
                        category.links.map(link => <div key={link.href}>
                            - <a href={link.href}>{link.title}</a>{link.details && ' - ' + link.details}
                        </div>)
                    }
                </div>}
            </div>
            <div style={{fontSize: '0.9em', fontStyle: 'italic', color: 'gray'}}>
                <div>Wskazówki pomagające meytorycznie określić poziom 1, 2, 3, 3+ są na wiki.</div>
                <div><a href="https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962">https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962</a></div>
            </div>
            <SkillLevelFilter level={levelFilter} onLevelChange={level => changeFilter(level)}/>
            {
                category.items && category.items
                    .filter(item => item.items.some(skill => skill.level <= levelFilter))
                    .map(section => <SectionRow key={section.title} section={section}>
                        {section.items && <div style={{marginLeft: '16px'}}>
                            <FormGroup>
                                {section.items
                                    .filter(topic => levelFilter === undefined || levelFilter >= topic.level)
                                    .map(topic => <TopicRow topic={topic} key={topic.title}/>)}
                            </FormGroup>
                        </div>}
                    </SectionRow>)
            }
        </Layout>;
    } else {
        return <>Nie znaleziono umiejętności. Sprawdź poprawność URL: {window.location.href}.</>;
    }
}


const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;

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

export const SkillRoadmapCategorySkills = connector(SkillRoadmapAreaSkillView);

