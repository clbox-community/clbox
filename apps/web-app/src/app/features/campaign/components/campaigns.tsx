import CheckIcon from '@mui/icons-material/Check';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, {Fragment, useCallback, useEffect, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {AppState} from '../../../state/app-state';
import {firebaseApp} from '../../firebase/firebase.app';
import {Campaign} from '../model/campaign';
import {CampaignStatus} from '../model/campaign-status';

const firestore = firebaseApp.firestore();

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

function statsLineColor(count, expected) {
    if (count === expected) {
        return 'green'
    } else if (count < expected / 2) {
        return 'orange'
    } else {
        return 'gray';
    }
}

const CampaignCard = ({campaign, onArchive}: {campaign: Campaign, onArchive: (campaign: Campaign) => void}) => {
    const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState(undefined);
    return <Card
        style={{
            marginBottom: '16px',
            cursor: 'pointer'
        }}
    >
        <CardHeader
            title={campaign.surveyTemplate.title}
            subheader={campaign.details.comment ? `${campaign.details.comment}, ${campaign.created}` : `${campaign.created}`}
            action={
                <IconButton onClick={ev => setHeaderMenuAnchorEl(ev.currentTarget)}>
                    <MoreVertIcon/>
                </IconButton>
            }
        />
        <Menu
            anchorEl={headerMenuAnchorEl}
            open={Boolean(headerMenuAnchorEl)}
            onClose={() => setHeaderMenuAnchorEl(undefined)}
        >
            <MenuItem onClick={() => onArchive(campaign)} sx={{color: 'secondary.main'}}>
                <ListItemIcon>
                    <DeleteForeverIcon color={"secondary"}/>
                </ListItemIcon>
                <ListItemText primary="Archive"/>
            </MenuItem>
        </Menu>
        <Link to={`/campaign/${campaign.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <CardContent>
                {campaign.answers && <div style={{
                    fontStyle: 'italic',
                    fontSize: '0.8em',
                    display: 'flex',
                    color: statsLineColor(campaign.answers.length, campaign.users.length)
                }}>
                    Wypełnione: {campaign.answers.length} / {campaign.users.length} (
                    {Math.round(campaign.answers.length / campaign.users.length * 100)}
                    %)
                    {
                        campaign.answers.length === campaign.users.length &&
                        <div style={{
                            marginLeft: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <CheckIcon fontSize={'inherit'}/>
                        </div>
                    }
                    {
                        campaign.answers.length < (campaign.users.length / 2) &&
                        <div style={{
                            marginLeft: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <WarningAmberIcon fontSize={'inherit'}/>
                        </div>
                    }
                </div>}
                {campaign.answers && <div style={{
                    fontStyle: 'italic',
                    fontSize: '0.8em',
                    color: 'gray'
                }}>
                    Ostatnia odpowiedź:&nbsp;
                    {
                        campaign.answers
                            .map(a => a.timestamp)
                            .filter(a => !!a)
                            .sort((a, b) => a - b)
                            .map(timestamp => new Date(timestamp).toISOString())
                            .find(_ => true)
                        ?? '...'
                    }
                </div>}
                <div style={{
                    color: 'gray',
                    fontStyle: 'italic',
                    fontSize: '0.8em',
                    marginTop: '4px'
                }}>
                    Użytkownicy: {campaign.users.join(', ')}
                </div>
            </CardContent>
        </Link>
    </Card>;
}

export const CampaignsView = ({teamId, userId}: ViewProps) => {

    const [campaigns, setCampaigns] = useState<Campaign[]>(undefined);
    const [filter, setFilter] = useState<CampaignStatus>(CampaignStatus.Current);

    useEffect(() => {
        (async () => {
            if (teamId && userId) {
                const queryResult = await firestore
                    .collection(`/team/${teamId}/campaign`)
                    .where("owners", "array-contains", userId)
                    .get();
                setCampaigns(
                    queryResult.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }) as Campaign)
                        .map(campaign => {
                            campaign.status = campaign.status ?? CampaignStatus.Current;
                            return campaign;
                        })
                );
            } else if (campaigns !== undefined) {
                setCampaigns(undefined);
            }
        })();
    }, [teamId, userId]);

    const onArchive = useCallback((campaign: Campaign) => {
        campaign.status = CampaignStatus.Archived;
        setCampaigns(campaigns.map(c => {
            if (c === campaign) {
                return {
                    ...c,
                    status: CampaignStatus.Archived
                };
            } else {
                return c;
            }
        }))
        firestore
            .collection(`/team/${teamId}/campaign`)
            .doc(campaign.id)
            .update({status: CampaignStatus.Archived});
    }, [teamId, campaigns]);

    return <Layout>
        <div style={{cursor: 'pointer'}}>
            <div style={{fontWeight: filter === CampaignStatus.Current ? 600 : undefined}}
                 onClick={() => setFilter(CampaignStatus.Current)} role="button">Bieżące
            </div>
            <div style={{fontWeight: filter === CampaignStatus.Archived ? 600 : undefined}}
                 onClick={() => setFilter(CampaignStatus.Archived)} role="button">Archiwalne
            </div>
            <div style={{fontWeight: filter === CampaignStatus.All ? 600 : undefined}}
                 onClick={() => setFilter(CampaignStatus.All)} role="button">Wszystkie
            </div>
        </div>
        <div>
            {campaigns
                ?.filter(campaign => filter === CampaignStatus.All || campaign.status === filter)
                .map(campaign => <Fragment key={campaign.id}>
                    <CampaignCard campaign={campaign} onArchive={onArchive} />
                </Fragment>)}
        </div>
    </Layout>;
};

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

export const Campaigns = connector(CampaignsView);
