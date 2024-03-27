import {Draft} from '@reduxjs/toolkit';
import {SentState} from '../sent-state';
import {sentFetched} from './sent-fetched';

export const sentFetchedReducer = (state: Draft<SentState>, action: ReturnType<typeof sentFetched>) => {
    state.messages = {
        byId: action.payload.messages.reduce(
            (teams, team) => ({
                ...teams,
                [team.id]: team
            }),
            {}
        )
    }
};
