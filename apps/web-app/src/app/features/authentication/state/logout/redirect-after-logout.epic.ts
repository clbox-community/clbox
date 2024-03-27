import {Epic} from 'redux-observable';
import {switchMap} from 'rxjs/operators';
import {AppState} from '../../../../state/app-state';
import {loggedOut} from './logged-out.action';
import {of} from "rxjs";

export const redirectAfterLogout: Epic<any, any, AppState> = (action$, state$) => action$
    .ofType(loggedOut.type)
    .pipe(
        switchMap(() => {
            if (window.location.pathname !== '/login') {
                console.log(`Logout required`);
                window.location.pathname = '/login';
            }
            return of();
        })
    );
