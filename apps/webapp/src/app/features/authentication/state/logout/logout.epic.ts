import { Epic } from 'redux-observable';
import { from, merge, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AppState } from '../../../../state/app-state';
import { firebaseApp } from '../../../firebase/firebase.app';
import { logoutRequested } from './logout-requested.action';
import { logout } from './logout.action';

export const logoutEpic: Epic<unknown, unknown, AppState> = action$ => action$
    .pipe(
        filter(logout.match),
        switchMap(() => merge(
            of(logoutRequested()),
            from(firebaseApp.auth().signOut()).pipe(
                filter(_ => false)
            )
        ))
    );
