import firebase from 'firebase/compat/app';
import { combineLatest, Observable, of } from 'rxjs';
import { distinct, filter, map, switchMap } from 'rxjs/operators';
import { inboxStatsFetched } from './inbox-stats-fetched';
import { InboxStats } from '../../model/inbox-stats';
import { firebaseApp } from '../../../firebase/firebase.app';
import { AppState } from '../../../../state/app-state';
import { Epic } from 'redux-observable';

const firestore = firebaseApp.firestore();
export const fetchInboxStatsEpic: Epic<unknown, unknown, AppState> = (_, state$) => combineLatest([
    state$.pipe(
        map(state => state.authentication?.email)
    ),
    state$.pipe(
        map(state => state.team?.current?.id)
    )
]).pipe(
    distinct(([user, team]) => `${user}/${team}`),
    switchMap(([user, team]) => {
        if (team && user) {
            return new Observable<firebase.firestore.DocumentSnapshot>(subscriber => {
                const inboxFilterStatsDoc = firestore.collection(`team/${team}/user/${user}/data`).doc('inbox-filter-stats');
                inboxFilterStatsDoc.onSnapshot(subscriber);
            });
        } else {
            return of<firebase.firestore.DocumentSnapshot>();
        }
    }),
    filter(doc => !!doc.data()),
    map(doc => inboxStatsFetched({
        stats: doc.data() as InboxStats
    }))
);
