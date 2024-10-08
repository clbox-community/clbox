import { Epic } from 'redux-observable';
import { from } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { AppState } from '../../../state/app-state';
import { loggedIn } from '../../authentication/state/login/logged-in.action';
import { firebaseApp } from '../../firebase/firebase.app';
import { teamsFetched } from './teams-fetched';

const userCollection = firebaseApp.firestore().collection(`user`);
export const fetchTeamsEpic: Epic<unknown, unknown, AppState> = action$ => {
    return action$
        .pipe(
            filter(loggedIn.match),
            switchMap(({ payload }) => from(userCollection.doc(payload.email).get())),
            map(teams => Object.keys(teams.data().teams)),
            map(teams => teams.map(team => ({
                id: team,
                name: team
            }))),
            map(teams => teamsFetched({ teams }))
        );
};
