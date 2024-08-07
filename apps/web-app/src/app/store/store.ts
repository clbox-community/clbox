import { configureStore } from '@reduxjs/toolkit';
import { epicMiddleware } from './epic-middleware';
import { rootEpic } from './root-epic';
import { rootReducer } from './root-reducer';

export const store = configureStore({
    reducer: rootReducer(),
    middleware: [epicMiddleware],
    enhancers: []
});

epicMiddleware.run(rootEpic);
