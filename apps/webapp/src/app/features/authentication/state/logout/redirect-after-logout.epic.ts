import { Epic } from 'redux-observable';
import { filter, switchMap } from 'rxjs/operators';
import { AppState } from '../../../../state/app-state';
import { loggedOut } from './logged-out.action';
import { of } from 'rxjs';

export const redirectAfterLogout: Epic<unknown, unknown, AppState> = action$ => action$
    .pipe(
        filter(loggedOut.match),
        switchMap(() => {
            if (window.location.pathname !== '/login') {
                console.log(`Logout required`);
                window.location.pathname = '/login';
            }
            return of();
        })
    );
