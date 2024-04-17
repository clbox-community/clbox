import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../state/app-state';
import { useParams } from 'react-router';
import React, { Fragment, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel, FormGroup } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { SkillLevelFilter } from './skill-level-filter';
import { RoadmapSkillSection, RoadmapSkillTopic, SkillLevel, SkillsRoadmap } from '@clbox/skill-roadmap';
import { CategoryResults, useCategoryResult } from '../state/use-category-result';
import CircularProgress from '@mui/material/CircularProgress';

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

const labelOfLevel = (level: SkillLevel) => {
    switch (level) {
        case SkillLevel.Level1:
            return '1';
        case SkillLevel.Level2:
            return '2';
        case SkillLevel.Level3:
            return '3';
        case SkillLevel.Level3plus:
            return '3+';
        case SkillLevel.NeedAssessment:
            return '*';
    }
};

const TopicRow: React.FC<{ topic: RoadmapSkillTopic, categoryResults: CategoryResults }> = ({ topic, categoryResults }) => {
    const [expanded, setExpanded] = useState(true);
    return <div>
        <TopicRowHeader>
            <FormControlLabel
                control={<Checkbox disabled={!topic.uuid} checked={categoryResults[0][topic.uuid] ?? false} onChange={change => categoryResults[1](topic.uuid, !categoryResults[0][topic.uuid])}
                                   sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />}
                label={<span style={{ fontSize: '0.9em' }}>{topic.title}</span>} />
            <div style={{ fontSize: '0.8em', fontStyle: 'italic', display: 'flex' }}>
                {(topic.details || topic.links?.length > 0) && <div style={{ color: 'gray', cursor: 'pointer' }}
                                                                    onClick={() => setExpanded(prev => !prev)}>{expanded ? '(zwiń)' : '(więcej)'}</div>}
                <div style={{ width: '70px', textAlign: 'right' }}>poziom {labelOfLevel(topic.level)}</div>
            </div>
        </TopicRowHeader>
        {expanded && <TopicRowBody>
            <ReactMarkdown>{topic.details}</ReactMarkdown>
            {topic.links?.length > 0 && <Fragment>
                {topic.links.map(link => <div key={link.title}>
                    ✓ <a href={link.href}>{link.title}</a>
                </div>)}
            </Fragment>}
        </TopicRowBody>}
    </div>;
};

const SectionRowBody = styled.div`
    margin-left: 16px;
    font-size: 0.9em;
    font-style: italic;
    margin-bottom: 16px;
`;

const SectionRow: React.FC<PropsWithChildren<{ section: RoadmapSkillSection }>> = ({ section, children }) => {
    const [expanded, setExpanded] = useState(true);
    return <Fragment>
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.1em' }}>{section.title}</div>
                {(section.details || section.links.length > 0) && <div style={{
                    fontSize: '0.8em',
                    fontStyle: 'italic',
                    color: 'gray',
                    cursor: 'pointer'
                }} onClick={() => setExpanded(prev => !prev)}>{expanded ? '(zwiń)' : '(więcej)'}</div>}
            </div>
            {expanded && <SectionRowBody>
                <ReactMarkdown>{section.details}</ReactMarkdown>
                {section.links.length > 0 && <div style={{ marginBottom: '16px' }}>
                    {section.links.map(link => <div key={link.href ?? link.title}>
                        ✓ {link.href ? <a href={link.href}>{link.title}</a> : link.title}
                    </div>)}
                </div>}
            </SectionRowBody>}
            <div>
                {children}
            </div>
        </div>
    </Fragment>;
};


export const SkillRoadmapAreaSkillView = ({ team, user }: ViewProps) => {
    const { category: categoryId } = useParams();
    const [params, setParams] = useSearchParams();

    const levelFilter = +params.get('level') > 0 ? +params.get('level') : SkillLevel.NeedAssessment;
    const changeFilter = (level: SkillLevel) => setParams(prev => {
        prev.set('level', level + '');
        return prev;
    });

    const category = SkillsRoadmap.find(
        category => category.slug === categoryId || category.uuid === categoryId
    );

    const categoryResults = useCategoryResult(team, user, categoryId);

    if (!category) {
        return <Layout>
            <>Nie znaleziono umiejętności. Sprawdź poprawność URL: {window.location.href}.</>
        </Layout>;
    } else if (categoryResults?.[0] === undefined) {
        return <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', height: '120px', alignItems: 'center' }}>
                <CircularProgress size={50} />
            </div>
        </Layout>;
    } else {
        return <Layout>
            <div style={{ fontSize: '1.4em' }}>
                {category.title}
            </div>
            <div style={{ fontSize: '0.9em', fontStyle: 'italic', marginBottom: '16px' }}>
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
            <div style={{ fontSize: '0.9em', fontStyle: 'italic', color: 'gray' }}>
                <div>Wskazówki pomagające meytorycznie określić poziom 1, 2, 3, 3+ są na wiki.</div>
                <div><a href="https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962">https://wiki.consdata.pl/pages/viewpage.action?pageId=289182962</a></div>
            </div>
            <SkillLevelFilter level={levelFilter} onLevelChange={level => changeFilter(level)} />
            {
                category.items && category.items
                    .filter(item => item.items.some(skill => skill.level <= levelFilter))
                    .map(section => <SectionRow key={section.title} section={section}>
                        {section.items && <div style={{ marginLeft: '16px' }}>
                            <FormGroup>
                                {section.items
                                    .filter(topic => levelFilter === undefined || levelFilter >= topic.level)
                                    .map(topic => <TopicRow topic={topic} key={topic.title} categoryResults={categoryResults} />)}
                            </FormGroup>
                        </div>}
                    </SectionRow>)
            }
        </Layout>;

    }
};


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
        user: state.authentication?.email
    }),
    {}
);

export const SkillRoadmapCategorySkills = connector(SkillRoadmapAreaSkillView);

