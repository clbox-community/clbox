import {AnyAction, configureStore} from '@reduxjs/toolkit';
import {epicMiddleware} from './epic-middleware';
import {rootEpic} from './root-epic';
import {rootReducer} from './root-reducer';
import * as Sentry from "@sentry/react";
import {AppState} from '../state/app-state';

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
    stateTransformer: state => {
        return {
            ...state,
            inbox: {
                messages: undefined
            },
            sent: {
                messages: undefined
            }
        } as AppState;
    },
    actionTransformer(action: AnyAction): AnyAction | null {
        if (action.type === 'InboxFetched') {
            return {
                ...action,
                payload: {
                    ...action.payload,
                    messages: undefined
                }
            }
        }
        if (action.type === 'SentFetched') {
            return {
                ...action,
                payload: {
                    ...action.payload,
                    messages: undefined
                }
            }
        }
        return action;
    }
});

export const store = configureStore({
    reducer: rootReducer(),
    middleware: [epicMiddleware],
    enhancers: [sentryReduxEnhancer]
});

epicMiddleware.run(rootEpic);
