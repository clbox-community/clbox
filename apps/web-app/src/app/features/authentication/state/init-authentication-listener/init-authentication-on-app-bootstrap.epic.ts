import { Epic } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';
import { appBootstrap } from '../../../../platform/app-bootstrap';
import { AppState } from '../../../../state/app-state';
import { firebaseApp } from '../../../firebase/firebase.app';
import { loggedIn } from '../login/logged-in.action';
import { loggedOut } from '../logout/logged-out.action';

export const initAuthenticationOnAppBootstrapEpic: Epic<unknown, unknown, AppState> = action$ => action$
    .pipe(
        filter(appBootstrap.match),
        first(),
        switchMap(_ => new Observable(subscriber =>
            firebaseApp.auth().onAuthStateChanged(
                state => subscriber.next(state ? loggedIn({ email: state.email }) : loggedOut())
            )
        ))
    );
