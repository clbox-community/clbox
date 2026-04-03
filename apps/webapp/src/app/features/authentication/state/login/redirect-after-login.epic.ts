import { Epic } from 'redux-observable';
import { of } from 'rxjs';
import { filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '../../../../state/app-state';
import { loggedIn } from './logged-in.action';

export const redirectAfterLogin: Epic<unknown, unknown, AppState> = (action$, state$) => action$
    .pipe(
        filter(loggedIn.match),
        withLatestFrom(state$),
        switchMap(() => {
            if (window.location.pathname === '/login') {
                window.location.pathname = '/feedback/inbox';
            }
            return of();
        })
    );
