import {combineEpics} from 'redux-observable';
import {fetchSentEpic} from './fetch-sent/fetch-sent.epic';

export const sentEpic = combineEpics(
    fetchSentEpic
)
