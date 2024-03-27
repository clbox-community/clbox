import {createReducer} from '@reduxjs/toolkit';
import {sentFetchedReducer} from './fetch-sent/sent-featched.reducer';
import {sentFetched} from './fetch-sent/sent-fetched';
import {SentState} from './sent-state';
import {sentStateInitial} from './sent-state-initial';

export const sentReducer = createReducer<SentState>(
    sentStateInitial,
    builder => builder
        .addCase(sentFetched, sentFetchedReducer)
)
