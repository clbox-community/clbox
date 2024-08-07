import { configureStore } from '@reduxjs/toolkit';
import { epicMiddleware } from './epic-middleware';
import { rootEpic } from './root-epic';
import { rootReducer } from './root-reducer';

export const store = configureStore({
    reducer: rootReducer(),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(epicMiddleware)
});

epicMiddleware.run(rootEpic);
