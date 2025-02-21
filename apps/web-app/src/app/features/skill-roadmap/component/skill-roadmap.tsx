import {connect, ConnectedProps} from "react-redux";
import {AppState} from "../../../state/app-state";
import React, {Fragment, useMemo} from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import {useNavigate, useSearchParams} from "react-router-dom";
import {SkillLevelFilter} from "./skill-level-filter";
import {SkillLevel, SkillsRoadmap} from "@clbox/skill-roadmap";

export const SkillRoadmapView = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const levelFilter = +params.get('level') > 0 ? +params.get('level') : SkillLevel.Level3plus;
    const labelFilter = params.get('label') ? params.get('label') : undefined;
    const changeSkillFilter = (level: SkillLevel) => setParams(prev => {
        prev.set('level', level + '');
        return prev;
    });

    const changeLabelFilter = (label: string) => setParams(prev => {
        if (label) {
            prev.set('label', label);
        } else {
            prev.delete('label');
        }
        return prev;
    });

    const labels = useMemo(
        () => SkillsRoadmap
            .map(item => item.labels)
            .reduce(
                (result, itemLabels) => {
                    itemLabels.forEach(label => {
                        if (result.indexOf(label) === -1) {
                            result.push(label);
                        }
                    })
                    return result;
                },
                []
            ),
        []
    );

    return <Layout>
        <div>
            <div style={{fontWeight: 600}}>Obszary</div>
            <div style={{marginLeft: '8px', cursor: 'pointer', fontWeight: labelFilter === undefined ? 600 : undefined}}
                 onClick={() => changeLabelFilter(undefined)}  role="button">
                Wszystkie
            </div>
            {labels.map(
                label => <div
                    key={label}
                    style={{
                        marginLeft: '8px',
                        cursor: 'pointer',
                        fontWeight: labelFilter === label ? 600 : undefined
                    }}
                    onClick={() => changeLabelFilter(label)}  role="button">
                    {label}
                </div>
            )}
        </div>
        <div>
            <div style={{fontSize: '1.4em'}}>
                Ścieżka rozwoju technologicznego
            </div>
            <SkillLevelFilter level={levelFilter} onLevelChange={level => changeSkillFilter(level)}/>
            {SkillsRoadmap && SkillsRoadmap
                .filter(item => labelFilter === undefined || item.labels.indexOf(labelFilter) >= 0)
                .map(item => <Fragment key={item.title}>
                    <div style={{marginBottom: '16px', cursor: 'pointer'}} onClick={() => navigate({
                        pathname: item.slug ? item.slug : item.uuid,
                        search: levelFilter !== 4 ? 'level=' + levelFilter : undefined
                    })} role="button">
                        <div>{item.title}</div>
                        <div style={{fontSize: '0.8em', marginLeft: '16px'}}>
                            {item.details && <div style={{fontStyle: 'italic', marginBottom: '16px'}}>
                                <ReactMarkdown>{item.details}</ReactMarkdown>
                            </div>}
                            <div style={{fontStyle: 'italic', color: 'gray'}}>
                                {item.items.length} obszarów
                            </div>
                        </div>
                    </div>
                </Fragment>)}
        </div>
    </Layout>;
}

const Layout = styled.div`
    display: flex;

    & > div:nth-child(1) {
        flex-basis: 200px;
        margin-right: 64px;
    }

    & > div:nth-child(2) {
        flex: 1;
    }
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

export const SkillRoadmap = connector(SkillRoadmapView);

