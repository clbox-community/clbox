import {OneColumnLayout} from "../../layout/one-column-layout";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import styled from "styled-components";

const Row = styled.div`
    display: flex;
    margin-bottom: 6px;
`;

const RowLabel = styled.div`
    flex-basis: 150px;
    font-weight: 300;
    justify-content: flex-end;
    display: flex;
    margin-right: 16px;
`;

const RowValue = styled.div`
`;

function seniorityAsText(raw: string): string {
    switch (raw) {
        case 'lead':
            return 'Lead Developer';
        case 'senior':
            return 'Senior';
        case 'regular':
            return 'Regular';
        case 'junior':
            return 'Junior';
        default:
            return 'brak';
    }
}

export const ProfileView = ({profile}) => <OneColumnLayout>
    <Card>
        <CardHeader
            title={profile.display_name}
            subheader={profile.email}
        />
        <CardContent>
            <Row>
                <RowLabel>Poziom</RowLabel>
                <RowValue>{seniorityAsText(profile.seniority)}</RowValue>
            </Row>
            <Row>
                <RowLabel>Forma językowa</RowLabel>
                <RowValue>{profile.textForm === 'f' ? 'Żeńska' : 'Męska'}</RowValue>
            </Row>
            <Row>
                <RowLabel>Chapter</RowLabel>
                <RowValue>{profile.chapterName ?? profile.chapter}</RowValue>
            </Row>
            <Row>
                <RowLabel>Chapter Leader</RowLabel>
                <RowValue>{profile.chapterLeader}</RowValue>
            </Row>
            {profile.leader && <Row>
                <RowLabel>Leader chapteru</RowLabel>
                <RowValue>
                    {profile.leaderOf.map(
                        chapter => <div key={chapter}>{chapter}</div>
                    )}
                </RowValue>
            </Row>}
            <Row>
                <RowLabel>Zespoły</RowLabel>
                <RowValue>
                    {profile.teams.map(
                        team => <div key={team}>{team}</div>
                    )}
                </RowValue>
            </Row>
            {profile.projects?.length > 0 && <Row>
                <RowLabel>Projekty</RowLabel>
                <RowValue>
                    {profile.projects.map(
                        project => <div key={project}>{project}</div>
                    )}
                </RowValue>
            </Row>}
            {profile.channelManager?.length > 0 && <Row>
                <RowLabel>Menadżer kanałów</RowLabel>
                <RowValue>
                    {profile.channelManager.map(
                        channel => <div key={channel}>{channel}</div>
                    )}
                </RowValue>
            </Row>}
        </CardContent>
    </Card>
</OneColumnLayout>;
