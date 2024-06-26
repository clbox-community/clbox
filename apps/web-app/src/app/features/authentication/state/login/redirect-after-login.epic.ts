import {Epic} from 'redux-observable';
import {of} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';
import {AppState} from '../../../../state/app-state';
import {loggedIn} from './logged-in.action';

export const redirectAfterLogin: Epic<any, any, AppState> = (action$, state$) => action$
    .ofType(loggedIn.type)
    .pipe(
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            if (window.location.pathname === '/login') {
                window.location.pathname = '/feedback/inbox';
            }
            return of();
        })
    );
