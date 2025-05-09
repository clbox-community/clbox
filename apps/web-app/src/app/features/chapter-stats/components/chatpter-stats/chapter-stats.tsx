import React, {useEffect, useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import styled from 'styled-components';
import {AppState} from '../../../../state/app-state';
import {firebaseApp} from '../../../firebase/firebase.app';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const Body = styled.div`
  width: 1000px;
  margin: 32px auto;
`;

interface UserYearStats {
    [date: string]: number;

    summary: number;
}

interface UserStats {
    user: string;
    stats: {
        byYear: {
            [year: string]: UserYearStats;
        }
    }
}

type ChapterStats = UserStats[];

function statsFor(user: UserStats) {
    const stats = {};
    Object.keys(user.stats?.byYear ?? []).forEach(
        year => Object.entries(user.stats?.byYear[year] ?? [])
            .filter(([key]) => key !== 'summary')
            .map(([key, value]) => [key.substring(0, 7), value])
            .forEach(result => stats[result[0]] = (stats[result[0]] ?? 0) + result[1])
    );
    return stats;
}

const dates = [];
const today = new Date();
for (let i = 0; i < 6; ++i) {
    const date = new Date(today.getFullYear(), (today.getMonth() + 1) - i, 1);
    dates.unshift(date.toISOString().slice(0, 7));
}

const StatsView = ({team}: ViewProps) => {
    const [stats, setStates] = useState<ChapterStats>(undefined);
    useEffect(() => {
        if (team) {
            firebaseApp.functions('europe-west3').httpsCallable('getChapterStatsV2')({
                team: team, statType: 'sent-feedbacks'
            }).then(result => {
                setStates(result.data);
            });
        }
    }, [team]);
    return <Body>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="left">User</TableCell>
                        {dates.map(month => <TableCell align="right" key={month}>{month}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stats
                        ?.map(user => ({user, stats: statsFor(user)}))
                        .map(
                            userStats => <TableRow key={userStats.user.user}>
                                <TableCell align="left">{userStats.user.user}</TableCell>
                                {dates.map(date => <TableCell align="right" key={date}>
                                    {userStats.stats[date] ?? ''}
                                </TableCell>)}
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </Body>
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
    (state: AppState) => ({
        team: state.team?.current?.id
    }),
    {}
);

export const ChapterStats = connector(StatsView);
